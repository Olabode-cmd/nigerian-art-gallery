import { useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Room from './Room'
import FirstPersonControls from './FirstPersonControls'
import NavigationSelector from './NavigationSelector'
import { art } from '../data/art'

declare global {
  interface Window {
    enterVR?: () => Promise<void>
  }
}

function VRManager() {
  const { gl } = useThree()
  
  useEffect(() => {
    (window as any).enterVR = async () => {
      if (!navigator.xr) return
      
      try {
        const session = await navigator.xr.requestSession('immersive-vr', {
          requiredFeatures: ['viewer'],
          optionalFeatures: ['local-floor', 'bounded-floor']
        })
        gl.xr.setSession(session)
      } catch (error) {
        console.log('VR not available:', error)
      }
    }
  }, [gl])
  
  return null
}

function GalleryContent() {
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
    <>
      <ambientLight intensity={0.8} />
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
    </>
  )
}

export default function Gallery() {
  const [, setIsVRSupported] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [canvasError, setCanvasError] = useState(false)
  
  // Detect VR browsers
  const isVRBrowser = /OculusBrowser|Quest|SamsungBrowser.*VR/i.test(navigator.userAgent)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)

    const checkVRSupport = async () => {
      if ('xr' in navigator && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr')
          setIsVRSupported(supported)
        } catch {
          setIsVRSupported(false)
        }
      }
    }
    checkVRSupport()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (canvasError || isVRBrowser) {
    return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Canvas 
          camera={{ position: [0, 4.5, 0], fov: 75 }}
          onCreated={({ gl }) => {
            // Enable XR in VR browsers for immersive experience
            gl.xr.enabled = true
          }}
          onError={() => setCanvasError(true)}
        >
          {/* Include VR manager for VR browsers */}
          <VRManager />
          <GalleryContent />
        </Canvas>
        
        {/* VR button for immersive mode */}
        <button
          onClick={() => (window as any).enterVR?.()}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 1001,
            padding: '12px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🥽 Enter Immersive VR
        </button>
        <NavigationSelector isMobile={false} isVRActive={false} />
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas 
        camera={{ position: [0, 4.5, 0], fov: 75 }}
        onCreated={({ gl }) => {
          gl.xr.enabled = true
        }}
        onError={() => setCanvasError(true)}
      >
        <VRManager />
        <GalleryContent />
      </Canvas>
      
      {!isMobile && (
        <button
          onClick={() => (window as any).enterVR?.()}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 1001,
            padding: '12px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Enter VR
        </button>
      )}
      <NavigationSelector isMobile={isMobile} isVRActive={false} />
    </div>
  )
}