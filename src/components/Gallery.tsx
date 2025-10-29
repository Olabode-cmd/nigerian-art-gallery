import { useState, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Room from './Room'
import { art } from '../data/art'
import { WebGLRenderer } from 'three'

function VRManager() {
  const { gl } = useThree()
  
  window.enterVR = async () => {
    if (!navigator.xr) {
      alert('WebXR is not supported in this browser')
      return
    }
    
    if (!(gl instanceof WebGLRenderer)) {
      alert('WebGL renderer not available')
      return
    }
    
    try {
      // Check if VR is supported
      const isSupported = await navigator.xr.isSessionSupported('immersive-vr')
      if (!isSupported) {
        alert('VR is not supported on this device')
        return
      }
      
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['viewer']
      })
      
      gl.xr.setSession(session)
      console.log('VR mode activated!')
      
    } catch (error: any) {
      console.log('VR error:', error)
      if (error.name === 'NotSupportedError') {
        alert('VR features not supported on this device')
      } else if (error.name === 'NotAllowedError') {
        alert('VR access denied by user')
      } else {
        alert('VR not available: ' + error.message)
      }
    }
  }
  
  return null
}

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
      <button 
        onClick={() => (window as any).enterVR?.()}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Enter VR
      </button>
      <Canvas camera={{ position: [0, 6, 8], fov: 60 }} onCreated={({ gl }) => gl.xr.enabled = true}>
        <VRManager />
        <ambientLight intensity={0.8} />
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