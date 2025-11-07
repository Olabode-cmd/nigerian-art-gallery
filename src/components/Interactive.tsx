import { useEffect, useRef, cloneElement, ReactElement } from 'react'
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
      }
    }
  }, [scene, userData, onSelect])

  return cloneElement(children, { ref: meshRef })
}