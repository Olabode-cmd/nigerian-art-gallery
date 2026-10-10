import { create } from 'zustand'
import type { WebXRManager } from './webxr/WebXRManager'
import type { Artwork } from './data/art'

export type NavigationMode = 'orbit' | 'wasd'
export type CameraView = 'first' | 'third'
export type Vec3 = [number, number, number]

const NAVIGATION_MODE_KEY = 'navigationMode'



export function detectIsMobile(): boolean {

  return window.innerWidth <= 768 || 'ontouchstart' in window

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
  setWebXRManager: (manager: WebXRManager | null) => void
  selectArtwork: (artwork: Artwork, position: Vec3) => void
  closePanel: () => void
  setNavigationMode: (mode: NavigationMode) => void
  setIsMobile: (isMobile: boolean) => void
  setCameraView: (view: CameraView) => void
}

export const useGallery = create<GalleryState>()((set) => ({
  webxrManager: null,
  selectedArtwork: null,
  selectedPosition: null,
  isMobile: detectIsMobile(),
  navigationMode: readStoredNavigationMode(),
  cameraView: 'first',
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
}))
