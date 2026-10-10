import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Group } from 'three'
import Room from './Room'
import Avatar, { HEAD_Y } from './Avatar'
import AvatarControls from './AvatarControls'
import Peers from './Peers'
import NavigationSelector from './NavigationSelector'
import LoadingScreen from './LoadingScreen'
import { WebXRManager } from '../webxr/WebXRManager'
import { VRButton } from '../webxr/VRButton'
import { useGallery, detectIsMobile } from '../store'
import { voice } from '../voice'
import TouchControls from './TouchControls'
import AvatarCustomizer from './AvatarCustomizer'
import RoomLobby from './RoomLobby'
import VoiceControls from './VoiceControls'

function VoiceAnalyzer() {
  const camera = useThree((state) => state.camera)
  useFrame(() => {
    // Drives speech indicators and keeps the 3D audio listener at the camera
    voice.updateLevels()
    voice.updateListener(camera)
  })
  return null
}

function GalleryScene() {
  const { gl, scene, camera } = useThree()
  const managerRef = useRef<WebXRManager | null>(null)
  const avatarRef = useRef<Group>(null)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const speedRef = useRef(0)
  const avatarConfig = useGallery((state) => state.avatarConfig)
  const isMobile = useGallery((state) => state.isMobile)
  const navigationMode = useGallery((state) => state.navigationMode)
  const setIsMobile = useGallery((state) => state.setIsMobile)
  const setWebXRManager = useGallery((state) => state.setWebXRManager)
  const userName = useGallery((state) => state.userName)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(detectIsMobile())
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

      <Avatar
        ref={avatarRef}
        speed={speedRef}
        speech={voice.localSpeech}
        config={avatarConfig}
        name={userName}
        isLocal
      />
      <AvatarControls avatarRef={avatarRef} controlsRef={controlsRef} speedRef={speedRef} />
      <Peers />
      <VoiceAnalyzer />

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
      <AvatarCustomizer />
      <RoomLobby />
      <VoiceControls />
      <TouchControls />
    </div>
  )
}