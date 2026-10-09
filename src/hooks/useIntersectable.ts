import { useEffect, useRef, type RefObject } from 'react'
import type { Mesh } from 'three'
import { useGallery } from '../store'
import type { Artwork } from '../data/art'

/**
 * Registers a mesh with the WebXR manager so VR controllers can select it.
 * The manager may not exist yet on first mount, so the effect re-runs when it
 * appears. The selection callback is kept in a ref so the mesh is registered
 * exactly once instead of on every render.
 */
export function useIntersectable(
  meshRef: RefObject<Mesh | null>,
  artwork: Artwork,
  onSelect: () => void,
) {
  const webxrManager = useGallery((state) => state.webxrManager)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || !webxrManager) return

    mesh.userData.artwork = artwork
    mesh.userData.onSelect = () => onSelectRef.current()
    webxrManager.addIntersectable(mesh)
    return () => webxrManager.removeIntersectable(mesh)
  }, [meshRef, artwork, webxrManager])
}
