import { useEffect, useRef } from 'react'
import type { ReactElement } from 'react'
import { Mesh } from 'three'
import { useThree } from '@react-three/fiber'

interface InteractiveProps {
  children: ReactElement
  onSelect?: () => void
  userData?: any
}

export default function Interactive({ children, onSelect, userData }: InteractiveProps) {
  const meshRef = useRef<Mesh>(null)
  const { scene } = useThree()
  const artworkPosition = userData?.position || [0, 0, 0]

  useEffect(() => {
    if (meshRef.current && userData && onSelect) {
      meshRef.current.userData = { ...meshRef.current.userData, ...userData, onSelect }
      const webxrManager = scene.userData.webxrManager
      if (webxrManager) {
        webxrManager.addIntersectable(meshRef.current)
        console.log('Added intersectable mesh for artwork:', userData.artwork?.title)
      } else {
        console.log('WebXR manager not found in scene userData')
      }
    }
  }, [scene, userData, onSelect])

  return (
    <>
      <mesh ref={meshRef} position={[artworkPosition[0], artworkPosition[1], artworkPosition[2] + 0.11]} visible={false}>
        <boxGeometry args={[2, 2.6, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {children}
    </>
  )
}