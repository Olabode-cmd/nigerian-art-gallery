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

  useEffect(() => {
    if (meshRef.current && userData && onSelect) {
      meshRef.current.userData = { ...meshRef.current.userData, ...userData, onSelect }
      
      // Find WebXR manager in scene userData
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
    <group>
      <mesh ref={meshRef} position={[0, 0, 0.11]} visible={false}>
        <boxGeometry args={[2, 2.6, 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      {children}
    </group>
  )
}