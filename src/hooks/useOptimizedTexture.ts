import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { RepeatWrapping, type Texture, TextureLoader } from 'three'

/**
 * Loads a texture with optional tiling. Diffuse maps only — the room geometry
 * is low-poly, so displacement/normal maps had no visible effect and only
 * cost download time.
 */
export function useOptimizedTexture(path: string, repeat?: [number, number]): Texture {
  const texture = useLoader(TextureLoader, path)

  return useMemo(() => {
    if (repeat) {
      texture.wrapS = texture.wrapT = RepeatWrapping
      texture.repeat.set(repeat[0], repeat[1])
    }
    texture.anisotropy = 4
    return texture
  }, [texture, repeat])
}
