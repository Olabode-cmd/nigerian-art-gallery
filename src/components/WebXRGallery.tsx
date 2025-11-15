import { useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { WebXRManager } from '../webxr/WebXRManager'
import { VRButton } from '../webxr/VRButton'
import Room from './Room'

function WebXRContent() {
  const { gl, scene } = useThree()
  const webxrManagerRef = useRef<WebXRManager | null>(null)
  const vrButtonRef = useRef<VRButton | null>(null)

  useEffect(() => {
    webxrManagerRef.current = new WebXRManager(gl, scene)
    vrButtonRef.current = new VRButton(gl)
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

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Room 
        onArtworkClick={() => {}}
        selectedArtwork={null}
        selectedArtworkPosition={null}
        onClosePanel={() => {}}
      />

      <OrbitControls 
        enablePan={false}
        target={[0, 4, 0]}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={1}
        maxDistance={15}
      />
    </>
  )
}

export default function WebXRGallery() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas 
        camera={{ position: [0, 4.5, 0], fov: 75 }}
        onCreated={({ gl }) => {
          gl.xr.enabled = true
        }}
      >
        <WebXRContent />
      </Canvas>
    </div>
  )
}