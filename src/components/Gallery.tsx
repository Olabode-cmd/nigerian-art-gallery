import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Room from './Room'
import FirstPersonControls from './FirstPersonControls'
import NavigationSelector from './NavigationSelector'
import { art } from '../data/art'

export default function Gallery() {
  const [selectedArtwork, setSelectedArtwork] = useState<typeof art[0] | null>(null)
  const [selectedArtworkPosition, setSelectedArtworkPosition] = useState<[number, number, number] | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [navigationMode, setNavigationMode] = useState<'orbit' | 'wasd'>('orbit')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    const savedMode = localStorage.getItem('navigationMode') as 'orbit' | 'wasd'
    if (savedMode) {
      setNavigationMode(savedMode)
    }
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleArtworkClick = (artwork: typeof art[0], position: [number, number, number]) => {
    setSelectedArtwork(artwork)
    setSelectedArtworkPosition(position)
  }

  const handleCloseOverlay = () => {
    setSelectedArtwork(null)
    setSelectedArtworkPosition(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 3.5, 0], fov: 75 }}>
        <ambientLight intensity={0.8} />
        {/* <directionalLight position={[10, 10, 5]} intensity={1} /> */}
        <Room 
          onArtworkClick={handleArtworkClick}
          selectedArtwork={selectedArtwork}
          selectedArtworkPosition={selectedArtworkPosition}
          onClosePanel={handleCloseOverlay}
        />
        {isMobile || navigationMode === 'orbit' ? (
          <OrbitControls 
            enablePan={false}
            target={[0, 4, 0]}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.2}
            minDistance={1}
            maxDistance={15}
          />
        ) : (
          <FirstPersonControls />
        )}
      </Canvas>
      <NavigationSelector isMobile={isMobile} />
    </div>
  )
}