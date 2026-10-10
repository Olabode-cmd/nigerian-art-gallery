import { create } from 'zustand'
import type { WebXRManager } from './webxr/WebXRManager'
import type { Artwork } from './data/art'
import {
  loadAvatarConfig,
  saveAvatarConfig,
  DEFAULT_AVATAR_CONFIG,
  type AvatarConfig,
} from './avatarConfig'

export type NavigationMode = 'orbit' | 'wasd'
export type CameraView = 'first' | 'third'
export type Vec3 = [number, number, number]

const NAVIGATION_MODE_KEY = 'navigationMode'
const USER_NAME_KEY = 'userName'
const RECENT_ROOMS_KEY = 'recentRooms'



export function detectIsMobile(): boolean {

  return window.innerWidth <= 768 || 'ontouchstart' in window

}



function loadUserName(): string {
  try {
    const raw = localStorage.getItem(USER_NAME_KEY)
    return typeof raw === 'string' ? raw : ''
  } catch {
    return ''
  }
}

function loadRecentRooms(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_ROOMS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string').slice(0, 3)
      : []
  } catch {
    return []
  }
}

function readStoredNavigationMode(): NavigationMode {

  const fallback: NavigationMode = detectIsMobile() ? 'orbit' : 'wasd'

  try {

    const saved = localStorage.getItem(NAVIGATION_MODE_KEY)

    return saved === 'orbit' || saved === 'wasd' ? saved : fallback

  } catch {

    return fallback

  }

}

interface GalleryState {
  webxrManager: WebXRManager | null
  selectedArtwork: Artwork | null
  selectedPosition: Vec3 | null
  isMobile: boolean
  navigationMode: NavigationMode
  cameraView: CameraView
  avatarConfig: AvatarConfig
  customizerOpen: boolean
  roomId: string | null
  roomError: string | null
  lobbyOpen: boolean
  voiceEnabled: boolean
  voiceMuted: boolean
  voiceError: string | null
  userName: string
  recentRooms: string[]
  peers: Record<string, { config: AvatarConfig; name?: string }>
  setWebXRManager: (manager: WebXRManager | null) => void
  selectArtwork: (artwork: Artwork, position: Vec3) => void
  closePanel: () => void
  setNavigationMode: (mode: NavigationMode) => void
  setIsMobile: (isMobile: boolean) => void
  setCameraView: (view: CameraView) => void
  setAvatarConfig: (partial: Partial<AvatarConfig>) => void
  setCustomizerOpen: (open: boolean) => void
  setRoomId: (roomId: string | null) => void
  setRoomError: (error: string | null) => void
  setLobbyOpen: (open: boolean) => void
  setVoiceEnabled: (enabled: boolean) => void
  setVoiceMuted: (muted: boolean) => void
  setVoiceError: (error: string | null) => void
  setUserName: (name: string) => void
  setPeerName: (id: string, name: string) => void
  addRecentRoom: (id: string) => void
  addPeer: (id: string, config?: AvatarConfig) => void
  removePeer: (id: string) => void
  setPeerConfig: (id: string, config: AvatarConfig) => void
  clearPeers: () => void
}

export const useGallery = create<GalleryState>()((set) => ({
  webxrManager: null,
  selectedArtwork: null,
  selectedPosition: null,
  isMobile: detectIsMobile(),
  navigationMode: readStoredNavigationMode(),
  cameraView: 'third',
  avatarConfig: loadAvatarConfig(),
  customizerOpen: false,
  roomId: null,
  roomError: null,
  lobbyOpen: false,
  voiceEnabled: false,
  voiceMuted: false,
  voiceError: null,
  userName: loadUserName(),
  recentRooms: loadRecentRooms(),
  peers: {},
  setWebXRManager: (manager) => set({ webxrManager: manager }),
  selectArtwork: (artwork, position) =>
    set({ selectedArtwork: artwork, selectedPosition: position }),
  closePanel: () => set({ selectedArtwork: null, selectedPosition: null }),
  setNavigationMode: (mode) => {
    set({ navigationMode: mode })
    try {
      localStorage.setItem(NAVIGATION_MODE_KEY, mode)
    } catch {
      // Storage can be unavailable (private browsing); the mode still applies for this session.
    }
  },
  setIsMobile: (isMobile) => set({ isMobile }),
  setCameraView: (cameraView) => set({ cameraView }),
  setAvatarConfig: (partial) =>
    set((state) => {
      const avatarConfig = { ...state.avatarConfig, ...partial }
      saveAvatarConfig(avatarConfig)
      return { avatarConfig }
    }),
  setCustomizerOpen: (customizerOpen) => set({ customizerOpen }),
  setRoomId: (roomId) => set({ roomId }),
  setRoomError: (roomError) => set({ roomError }),
  setLobbyOpen: (lobbyOpen) => set({ lobbyOpen }),
  setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
  setVoiceMuted: (voiceMuted) => set({ voiceMuted }),
  setVoiceError: (voiceError) => set({ voiceError }),
  setUserName: (userName) => {
    set({ userName })
    try {
      localStorage.setItem(USER_NAME_KEY, userName)
    } catch {
      // Storage unavailable — the name still applies for this session
    }
  },
  setPeerName: (id, name) =>
    set((state) => {
      const existing = state.peers[id]
      return {
        peers: {
          ...state.peers,
          [id]: { config: existing?.config ?? DEFAULT_AVATAR_CONFIG, name },
        },
      }
    }),
  addRecentRoom: (id) =>
    set((state) => {
      const recentRooms = [id, ...state.recentRooms.filter((room) => room !== id)].slice(0, 3)
      try {
        localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(recentRooms))
      } catch {
        // Storage unavailable — the list still applies for this session
      }
      return { recentRooms }
    }),
  addPeer: (id, config) =>
    set((state) =>
      state.peers[id]
        ? state
        : {
            peers: { ...state.peers, [id]: { config: config ?? DEFAULT_AVATAR_CONFIG } },
          }
    ),
  removePeer: (id) =>
    set((state) => {
      if (!(id in state.peers)) return state
      const peers = { ...state.peers }
      delete peers[id]
      return { peers }
    }),
  setPeerConfig: (id, config) =>
    set((state) => ({ peers: { ...state.peers, [id]: { config } } })),
  clearPeers: () => set({ peers: {} }),
}))
