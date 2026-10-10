import type { DataPayload, MessageAction, Room } from 'trystero'
import { sanitizeAvatarConfig, type AvatarConfig } from './avatarConfig'
import { useGallery } from './store'
import { voice } from './voice'
import { logLoad } from './debugLog'

const APP_ID = 'nigerian-art-gallery'
const POSE_INTERVAL_MS = 80 // ~12.5 Hz
// Same bound as AvatarControls so remote poses stay inside the room
const ROOM_BOUND = 9
const SEARCH_TIMEOUT_MS = 10_000 // hint when no peer has connected yet
const TRANSIENT_ERROR_MS = 6_000 // auto-clear window for peer-level noise

// Written by AvatarControls every frame; read by the pose sender
export const localPose = { x: 0, z: 0, yaw: 0 }

type PoseData = { x: number; z: number; yaw: number }

interface RemotePlayer {
  x: number
  z: number
  yaw: number
  hasPose: boolean
  moving: boolean
  /** Snap to the next target instead of interpolating (first pose received) */
  snap: boolean
}

// Mutable and outside React on purpose — pose updates at 12Hz must never
// re-render the component tree. Rendering side: Peers.tsx
export const remotePlayers = new Map<string, RemotePlayer>()

// Trystero is dynamically imported so multiplayer never weighs on the initial
// bundle — the chunk is fetched when the lobby opens or on the first join
type TrysteroModule = typeof import('trystero')
let trysteroModule: Promise<TrysteroModule> | null = null

function loadTrystero(): Promise<TrysteroModule> {
  if (!trysteroModule) {
    trysteroModule = import('trystero').catch((error) => {
      // Allow a retry if the chunk failed to load
      trysteroModule = null
      throw error
    })
  }
  return trysteroModule
}

/** Warm up the multiplayer chunk while the user is looking at the lobby */
export function prewarmRoom(): void {
  const started = performance.now()
  void loadTrystero()
    .then(() => {
      logLoad(`multiplayer chunk ready in ${Math.round(performance.now() - started)}ms`)
    })
    .catch(() => {
      // Chunk fetch failure surfaces as a join error later
      logLoad('multiplayer chunk FAILED to load')
    })
}

let room: Room | null = null
let poseAction: MessageAction<PoseData> | null = null
let configAction: MessageAction<AvatarConfig> | null = null
let metaAction: MessageAction<{ name: string }> | null = null
let poseInterval: number | null = null
let unsubscribeConfig: (() => void) | null = null
let joinPending = false
let joinGeneration = 0
let searchTimer: number | null = null
let joinErrorTimer: number | null = null

function sanitizeName(name: unknown): string {
  if (typeof name !== 'string') return ''
  return name.replace(/\s+/g, ' ').trim().slice(0, 24)
}

function safeSend<T extends DataPayload>(
  action: MessageAction<T> | null,
  data: T,
  target?: string
): void {
  if (!action) return
  action.send(data, target ? { target } : undefined).catch(() => {
    // Peer disconnected mid-send — nothing to do
  })
}

/** Shows a message that clears itself, so peer-level noise doesn't stick around */
function showTransientRoomError(message: string): void {
  useGallery.getState().setRoomError(message)
  if (joinErrorTimer !== null) clearTimeout(joinErrorTimer)
  joinErrorTimer = window.setTimeout(() => {
    joinErrorTimer = null
    useGallery.getState().setRoomError(null)
  }, TRANSIENT_ERROR_MS)
}

/** Keeps the ?room= deep link in sync with the active room */
function updateUrl(roomId: string | null): void {
  const url = new URL(window.location.href)
  if (roomId) {
    url.searchParams.set('room', roomId)
  } else {
    url.searchParams.delete('room')
  }
  window.history.replaceState(null, '', url)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function ensurePeer(peerId: string): void {
  if (!remotePlayers.has(peerId)) {
    remotePlayers.set(peerId, {
      x: 0,
      z: 0,
      yaw: 0,
      hasPose: false,
      moving: false,
      snap: false,
    })
  }
  useGallery.getState().addPeer(peerId)
}

function removePeer(peerId: string): void {
  remotePlayers.delete(peerId)
  useGallery.getState().removePeer(peerId)
}

function receivePose(data: PoseData, peerId: string): void {
  if (!Number.isFinite(data.x) || !Number.isFinite(data.z) || !Number.isFinite(data.yaw)) return
  ensurePeer(peerId)
  const player = remotePlayers.get(peerId)
  if (!player) return
  const moved = Math.hypot(data.x - player.x, data.z - player.z)
  player.moving = moved > 0.01
  if (!player.hasPose) player.snap = true
  player.x = clamp(data.x, -ROOM_BOUND, ROOM_BOUND)
  player.z = clamp(data.z, -ROOM_BOUND, ROOM_BOUND)
  player.yaw = data.yaw
  player.hasPose = true
}

export async function joinRoomAsPlayer(roomId: string): Promise<void> {
  if (room || joinPending) return
  joinPending = true
  const generation = ++joinGeneration

  const store = useGallery.getState()
  store.setRoomId(roomId)
  store.setRoomError(null)
  if (joinErrorTimer !== null) {
    clearTimeout(joinErrorTimer)
    joinErrorTimer = null
  }

  try {
    const { joinRoom } = await loadTrystero()
    if (generation !== joinGeneration) return // user left while the chunk loaded

    const instance = joinRoom({ appId: APP_ID }, roomId, {
      onJoinError: () => {
        // Handshake failures are per-peer, not room failures — brief hint only
        showTransientRoomError('Could not connect to a peer. They may have a weak connection.')
      },
    })

    poseAction = instance.makeAction<PoseData>('pose', {
      onMessage: (data, context) => receivePose(data, context.peerId),
    })
    configAction = instance.makeAction<AvatarConfig>('config', {
      onMessage: (data, context) => {
        useGallery.getState().setPeerConfig(context.peerId, sanitizeAvatarConfig(data))
      },
    })
    metaAction = instance.makeAction<{ name: string }>('meta', {
      onMessage: (data, context) => {
        useGallery.getState().setPeerName(context.peerId, sanitizeName(data.name))
      },
    })

    instance.onPeerJoin = (peerId) => {
      ensurePeer(peerId)
      if (searchTimer !== null) {
        clearTimeout(searchTimer)
        searchTimer = null
      }
      const profile = useGallery.getState()
      // Give the new peer our config and name; they do the same for us
      safeSend(configAction, profile.avatarConfig, peerId)
      safeSend(metaAction, { name: sanitizeName(profile.userName) }, peerId)
      // Late joiners need the mic stream if voice is already on
      const micStream = voice.getMicStream()
      if (micStream) {
        Promise.allSettled(instance.addStream(micStream, { target: peerId }))
      }
    }
    instance.onPeerLeave = (peerId) => {
      voice.removeRemote(peerId)
      removePeer(peerId)
    }
    instance.onPeerStream = (stream, peerId) => {
      voice.addRemote(peerId, stream)
    }

    room = instance
    voice.setRoom(instance)
    useGallery.getState().addRecentRoom(roomId)
    updateUrl(roomId)

    poseInterval = window.setInterval(() => {
      safeSend(poseAction, { x: localPose.x, z: localPose.z, yaw: localPose.yaw })
    }, POSE_INTERVAL_MS)

    // If nothing connects shortly after joining, surface that we're still
    // searching instead of letting the user sit in a silent room
    searchTimer = window.setTimeout(() => {
      searchTimer = null
      if (room === instance && Object.keys(useGallery.getState().peers).length === 0) {
        showTransientRoomError('Still searching for players — check your connection.')
      }
    }, SEARCH_TIMEOUT_MS)

    // Broadcast live avatar customizations and name changes
    unsubscribeConfig = useGallery.subscribe((state, prev) => {
      if (state.avatarConfig !== prev.avatarConfig) {
        safeSend(configAction, state.avatarConfig)
      }
      if (state.userName !== prev.userName) {
        safeSend(metaAction, { name: sanitizeName(state.userName) })
      }
    })
  } catch {
    if (generation === joinGeneration) {
      useGallery.getState().setRoomError('Could not connect. Please try again.')
      useGallery.getState().setRoomId(null)
    }
  } finally {
    joinPending = false
  }
}

export function leaveRoom(): void {
  joinGeneration++ // invalidates any in-flight join
  if (searchTimer !== null) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
  if (joinErrorTimer !== null) {
    clearTimeout(joinErrorTimer)
    joinErrorTimer = null
  }
  if (poseInterval !== null) {
    clearInterval(poseInterval)
    poseInterval = null
  }
  if (unsubscribeConfig) {
    unsubscribeConfig()
    unsubscribeConfig = null
  }
  voice.setRoom(null)
  if (room) {
    room.leave().catch(() => {
      // Already disconnecting
    })
    room = null
  }
  poseAction = null
  configAction = null
  metaAction = null
  remotePlayers.clear()
  const store = useGallery.getState()
  store.clearPeers()
  store.setRoomId(null)
  store.setRoomError(null)
  updateUrl(null)
}
