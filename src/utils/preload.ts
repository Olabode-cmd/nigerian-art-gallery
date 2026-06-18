import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { art } from '../data/art'

export function PreloadArtwork() {
  const images = art.map(a => a.image)
  useLoader(TextureLoader, images)
  return null
}

export function preloadCriticalAssets() {
  const criticalImages = art.slice(0, 4).map(a => a.image)
  criticalImages.forEach(src => {
    const img = new Image()
    img.src = src
  })
}
