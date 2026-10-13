import type { DataPayload, MessageAction, Room, TurnServerConfig } from 'trystero'
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
// Public Nostr relays are free and flaky: more of them means a dead or
// auth-gated relay can't stop two players from finding each other (default 5)
const RELAY_REDUNDANCY = 8
// Signaling timestamps come from each device's clock, so a skew beyond this
// can make relays drop the other player's announcements
const CLOCK_SKEW_LIMIT_MS = 10_000
const CLOCK_CHECK_TIMEOUT_MS = 4_000

// Written by AvatarControls every frame; read by the pose sender
export const localPose = { x: 0, z: 0, yaw: 0 }

// Our Trystero peer ID once the multiplayer chunk has loaded. Lets two
// clients agree on who steps which way when their avatars fully overlap.
export const localPeer = { id: '' }

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
// Shown whenever no transient message is active; cleared once a peer connects
let persistentNotice: string | null = null

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
    useGallery.getState().setRoomError(persistentNotice)
  }, TRANSIENT_ERROR_MS)
}

/** A notice that stays until it is replaced or a peer connects */
function setPersistentNotice(message: string | null): void {
  persistentNotice = message
  if (joinErrorTimer === null) useGallery.getState().setRoomError(message)
}

/**
 * Optional TURN relay, configured through VITE_TURN_* env vars. Without one,
 * players behind symmetric or carrier-grade NAT (common on mobile data)
 * cannot connect, because Trystero only ships public STUN servers.
 */
function readTurnConfig(): TurnServerConfig[] | undefined {
  const urls = String(import.meta.env.VITE_TURN_URLS ?? '')
    .split(',')
    .map((url) => url.trim())
    .filter((url) => /^turns?:/i.test(url))
  const username = import.meta.env.VITE_TURN_USERNAME
  const credential = import.meta.env.VITE_TURN_CREDENTIAL
  if (urls.length === 0) return undefined
  if (!username || !credential) {
    console.warn('Room: VITE_TURN_URLS is set but VITE_TURN_USERNAME / VITE_TURN_CREDENTIAL are missing; TURN disabled')
    return undefined
  }
  return [{ urls, username, credential }]
}

/**
 * Server time minus device time, measured against our own host. Returns null
 * when it can't be measured, so a flaky network never raises a false warning.
 */
async function measureClockSkewMs(): Promise<number | null> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), CLOCK_CHECK_TIMEOUT_MS)
  try {
    const sent = Date.now()
    const response = await fetch(window.location.origin + '/', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    })
    const received = Date.now()
    const dateHeader = response.headers.get('date')
    if (!dateHeader) return null
    const serverMs = Date.parse(dateHeader)
    if (!Number.isFinite(serverMs)) return null
    // A cached response reports when it was generated; Age is how long ago
    const ageMs = (Number(response.headers.get('age')) || 0) * 1000
    return serverMs + ageMs - (sent + received) / 2
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function describeClockSkew(skewMs: number): string {
  const seconds = Math.round(Math.abs(skewMs) / 1000)
  const amount = seconds >= 90 ? `${Math.round(seconds / 60)} minutes` : `${seconds} seconds`
  const direction = skewMs > 0 ? 'behind' : 'ahead'
  return `Your device clock is about ${amount} ${direction}. Turn on automatic date and time, then rejoin the room.`
}

/**
 * Subclass that reports ICE failures. Trystero hides failed connection
 * attempts, so without this a blocked connection looks like an empty room.
 */
function createObservedPeerConnection(hasTurn: boolean): typeof RTCPeerConnection {
  return class extends RTCPeerConnection {
    constructor(config?: RTCConfiguration) {
      super(config)
      const candidateTypes: Record<string, number> = {}
      this.addEventListener('icecandidate', (event) => {
        const type = event.candidate?.type
        if (type) candidateTypes[type] = (candidateTypes[type] ?? 0) + 1
      })
      this.addEventListener('iceconnectionstatechange', () => {
        if (this.iceConnectionState !== 'failed') return
        console.warn('Room: ICE connection failed', {
          localCandidates: candidateTypes,
          turnConfigured: hasTurn,
        })
        showTransientRoomError(
          'Could not reach another player directly. Their network may be blocking peer-to-peer connections.'
        )
      })
    }
  }
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
  persistentNotice = null
  if (joinErrorTimer !== null) {
    clearTimeout(joinErrorTimer)
    joinErrorTimer = null
  }

  try {
    const { joinRoom, selfId } = await loadTrystero()
    if (generation !== joinGeneration) return // user left while the chunk loaded
    localPeer.id = selfId

    const turnConfig = readTurnConfig()
    const instance = joinRoom(
      {
        appId: APP_ID,
        relayConfig: { redundancy: RELAY_REDUNDANCY },
        rtcPolyfill: createObservedPeerConnection(turnConfig !== undefined),
        ...(turnConfig ? { turnConfig } : {}),
      },
      roomId,
      {
        onJoinError: (details) => {
          // Handshake failures are per-peer, not room failures — brief hint only
          console.warn('Room: peer handshake failed', details.error)
          showTransientRoomError('Could not connect to a peer. They may have a weak connection.')
        },
      }
    )

    // Off the join path: a slow or failed check must never delay connecting
    void measureClockSkewMs().then((skewMs) => {
      if (room !== instance || skewMs === null || Math.abs(skewMs) < CLOCK_SKEW_LIMIT_MS) return
      if (Object.keys(useGallery.getState().peers).length > 0) return
      console.warn('Room: device clock skew (ms, server minus device):', skewMs)
      setPersistentNotice(describeClockSkew(skewMs))
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
      setPersistentNotice(null)
      const profile = useGallery.getState()
      // Give the new peer our config and name; they do the same for us
      safeSend(configAction, profile.avatarConfig, peerId)
      safeSend(metaAction, { name: sanitizeName(profile.userName) }, peerId)
      // Late joiners need the mic stream if voice is already on
      voice.shareMicWith(instance, peerId)
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
      if (room !== instance || Object.keys(useGallery.getState().peers).length > 0) return
      // A clock-skew notice is more specific, so don't replace it
      if (persistentNotice === null) {
        setPersistentNotice(
          'Still searching for players. Check that you both entered the same room code and have a working connection.'
        )
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
  persistentNotice = null
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
