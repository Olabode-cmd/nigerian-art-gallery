import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Group } from 'three'
import Room from './Room'
import Avatar, { HEAD_Y } from './Avatar'
import AvatarControls from './AvatarControls'
import NavigationSelector from './NavigationSelector'
import LoadingScreen from './LoadingScreen'
import { WebXRManager } from '../webxr/WebXRManager'
import { VRButton } from '../webxr/VRButton'
import { useGallery } from '../store'

function GalleryScene() {
  const { gl, scene, camera } = useThree()
  const managerRef = useRef<WebXRManager | null>(null)
  const avatarRef = useRef<Group>(null)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const isMobile = useGallery((state) => state.isMobile)
  const navigationMode = useGallery((state) => state.navigationMode)
  const setIsMobile = useGallery((state) => state.setIsMobile)
  const setWebXRManager = useGallery((state) => state.setWebXRManager)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  // When entering orbit mode the camera may be sitting at the avatar's head
  // (radius ~0 for OrbitControls), so back it out to a natural viewing spot
  useEffect(() => {
    if (navigationMode === 'orbit') {
      camera.position.set(0, 5, 8)
    }
  }, [navigationMode, camera])

  useEffect(() => {
    const manager = new WebXRManager(gl, scene)
    managerRef.current = manager
    setWebXRManager(manager)

    const vrButton = new VRButton(gl)

    return () => {
      vrButton.dispose()
      manager.dispose()
      managerRef.current = null
      setWebXRManager(null)
    }
  }, [gl, scene, setWebXRManager])

  // R3F owns the render loop; this keeps the WebXR raycasters in sync per frame
  useFrame(() => {
    managerRef.current?.update()
  })

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Room />
      </Suspense>

      <Avatar ref={avatarRef} />
      <AvatarControls avatarRef={avatarRef} controlsRef={controlsRef} />

      {isMobile || navigationMode === 'orbit' ? (
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          target={[0, HEAD_Y, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={1}
          maxDistance={15}
        />
      ) : null}
    </>
  )
}

export default function Gallery() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LoadingScreen />
      <Canvas
        camera={{ position: [0, 5, 8], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance', antialias: false }}
      >
        <GalleryScene />
      </Canvas>
      <NavigationSelector />
    </div>
  )
}