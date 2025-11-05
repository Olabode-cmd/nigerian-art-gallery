import { useEffect, useRef } from 'react'
import { Mesh } from 'three'
import { useThree } from '@react-three/fiber'

interface InteractiveProps {
  children: React.ReactNode
  onSelect?: () => void
  userData?: any
}

export default function Interactive({ children, onSelect, userData }: InteractiveProps) {
  const meshRef = useRef<Mesh>(null)
  const { scene } = useThree()

  useEffect(() => {
    if (meshRef.current && userData) {
      meshRef.current.userData = { ...meshRef.current.userData, ...userData }
      
      // Find WebXR manager in scene userData
      const webxrManager = scene.userData.webxrManager
      if (webxrManager) {
        webxrManager.addIntersectable(meshRef.current)
      }
    }
  }, [scene, userData])

  return (
    <mesh ref={meshRef} onClick={onSelect}>
      {children}
    </mesh>
  )
}