import { useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Room from './Room'
import FirstPersonControls from './FirstPersonControls'
import NavigationSelector from './NavigationSelector'
import { WebXRManager } from '../webxr/WebXRManager'
import { VRButton } from '../webxr/VRButton'
import { art } from '../data/art'

function WebXRContent() {
  const { gl, scene } = useThree()
  const webxrManagerRef = useRef<WebXRManager | null>(null)
  const vrButtonRef = useRef<VRButton | null>(null)
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
  
  useEffect(() => {
    // Initialize WebXR manager
    webxrManagerRef.current = new WebXRManager(gl, scene)
    
    // Store manager in scene for Interactive components
    scene.userData.webxrManager = webxrManagerRef.current
    
    // Set artwork selection callback
    webxrManagerRef.current.setArtworkSelectCallback((mesh) => {
      const artworkData = mesh.userData.artwork
      const position = mesh.userData.position
      if (artworkData && position) {
        handleArtworkClick(artworkData, position)
      }
    })
    
    // Initialize VR button
    vrButtonRef.current = new VRButton(gl)

    // Animation loop
    const animate = () => {
      webxrManagerRef.current?.update()
    }

    gl.setAnimationLoop(animate)

    return () => {
      gl.setAnimationLoop(null)
      webxrManagerRef.current?.dispose()
      vrButtonRef.current?.dispose()
    }
  }, [gl, scene])

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
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas 
        camera={{ position: [0, 5, 0], fov: 75 }}
        onCreated={({ gl, camera }) => {
          gl.xr.enabled = true
          // Set VR camera height to match artwork level
          gl.xr.addEventListener('sessionstart', () => {
            camera.position.y = 5
          })
        }}
      >
        <WebXRContent />
      </Canvas>
      <NavigationSelector isMobile={false} isVRActive={false} />
    </div>
  )
}