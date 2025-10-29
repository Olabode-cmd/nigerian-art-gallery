import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Room from './Room'
import FloatingInfoPanel from './FloatingInfoPanel'
import { art } from '../data/art'

export default function Gallery() {
  const [selectedArtwork, setSelectedArtwork] = useState<typeof art[0] | null>(null)
  const [selectedArtworkPosition, setSelectedArtworkPosition] = useState<[number, number, number] | null>(null)

  const handleArtworkClick = (artwork: typeof art[0], position: [number, number, number]) => {
    setSelectedArtwork(artwork)
    setSelectedArtworkPosition(position)
  }

  const handleCloseOverlay = () => {
    setSelectedArtwork(null)
    setSelectedArtworkPosition(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 6, 8], fov: 60 }}>
        <ambientLight intensity={0.8} />
        {/* <directionalLight position={[10, 10, 5]} intensity={1} /> */}
        <Room 
          onArtworkClick={handleArtworkClick}
          selectedArtwork={selectedArtwork}
          selectedArtworkPosition={selectedArtworkPosition}
          onClosePanel={handleCloseOverlay}
        />
        <OrbitControls 
          enablePan={false}
          target={[0, 4, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={1}
          maxDistance={15}
        />
      </Canvas>
      

    </div>
  )
}