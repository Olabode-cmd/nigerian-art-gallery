import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { XR, createXRStore, useXR } from '@react-three/xr'
import Room from './Room'
import FirstPersonControls from './FirstPersonControls'
import NavigationSelector from './NavigationSelector'
import VRControls from './VRControls'
import { art } from '../data/art'

function GalleryContent() {
  const [selectedArtwork, setSelectedArtwork] = useState<typeof art[0] | null>(null)
  const [selectedArtworkPosition, setSelectedArtworkPosition] = useState<[number, number, number] | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [navigationMode, setNavigationMode] = useState<'orbit' | 'wasd'>('orbit')
  const session = useXR((state) => state.session)

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
      
      {session ? (
        <VRControls />
      ) : (
        isMobile || navigationMode === 'orbit' ? (
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
        )
      )}
    </>
  )
}

const store = createXRStore()

export default function Gallery() {
  const [isVRSupported, setIsVRSupported] = useState(false)
  const [isVRActive, setIsVRActive] = useState(false)

  useEffect(() => {
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

    // Listen for VR session changes
    const unsubscribe = store.subscribe((state) => {
      setIsVRActive(!!state.session)
    })

    return unsubscribe
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas 
        camera={{ position: [0, 4.5, 0], fov: 75 }}
        onCreated={({ gl }) => {
          gl.xr.enabled = true
        }}
      >
        <XR store={store}>
          <GalleryContent />
        </XR>
      </Canvas>
      
      {isVRSupported && (
        <button
          onClick={() => store.enterVR()}
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
      <NavigationSelector isMobile={false} isVRActive={isVRActive} />
    </div>
  )
}