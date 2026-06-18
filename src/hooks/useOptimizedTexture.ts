import { useLoader } from '@react-three/fiber'
import { TextureLoader, RepeatWrapping, Texture } from 'three'
import { useMemo } from 'react'

interface OptimizedTextureConfig {
  path: string
  repeat?: [number, number]
  wrapMode?: typeof RepeatWrapping
}

export function useOptimizedTexture(config: OptimizedTextureConfig): Texture {
  const texture = useLoader(TextureLoader, config.path)
  
  return useMemo(() => {
    if (config.repeat) {
      texture.wrapS = texture.wrapT = config.wrapMode || RepeatWrapping
      texture.repeat.set(config.repeat[0], config.repeat[1])
    }
    texture.anisotropy = 4
    return texture
  }, [texture, config.repeat, config.wrapMode])
}

export function useOptimizedTexturePair(diffusePath: string, dispPath: string, repeat?: [number, number]) {
  const diffuse = useLoader(TextureLoader, diffusePath)
  const displacement = useLoader(TextureLoader, dispPath)
  
  return useMemo(() => {
    if (repeat) {
      diffuse.wrapS = diffuse.wrapT = RepeatWrapping
      diffuse.repeat.set(repeat[0], repeat[1])
      displacement.wrapS = displacement.wrapT = RepeatWrapping
      displacement.repeat.set(repeat[0], repeat[1])
    }
    diffuse.anisotropy = 4
    return { diffuse, displacement }
  }, [diffuse, displacement, repeat])
}
