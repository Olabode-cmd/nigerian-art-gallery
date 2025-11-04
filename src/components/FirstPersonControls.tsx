import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function FirstPersonControls() {
  const { camera } = useThree()
  const keys = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    e: false
  })

  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const roomSize = 20
  const wallBuffer = 1

  useEffect(() => {
    // Set initial camera rotation to face north wall
    camera.rotation.set(0, 0, 0)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = true
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (key in keys.current) {
        keys.current[key as keyof typeof keys.current] = false
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    const moveSpeed = 5
    const turnSpeed = 1

    // Reset velocity
    velocity.current.set(0, 0, 0)

    // Movement (WASD)
    if (keys.current.w) {
      camera.getWorldDirection(direction.current)
      velocity.current.add(direction.current.multiplyScalar(moveSpeed * delta))
    }
    if (keys.current.s) {
      camera.getWorldDirection(direction.current)
      velocity.current.add(direction.current.multiplyScalar(-moveSpeed * delta))
    }
    if (keys.current.a) {
      camera.getWorldDirection(direction.current)
      direction.current.cross(camera.up)
      velocity.current.add(direction.current.multiplyScalar(-moveSpeed * delta))
    }
    if (keys.current.d) {
      camera.getWorldDirection(direction.current)
      direction.current.cross(camera.up)
      velocity.current.add(direction.current.multiplyScalar(moveSpeed * delta))
    }

    // Calculate new position with collision detection
    const newPosition = camera.position.clone().add(velocity.current)
    
    // Clamp position within room bounds
    const halfRoom = roomSize / 2 - wallBuffer
    newPosition.x = Math.max(-halfRoom, Math.min(halfRoom, newPosition.x))
    newPosition.z = Math.max(-halfRoom, Math.min(halfRoom, newPosition.z))
    // Keep camera at artwork viewing height
    newPosition.y = 4.5
    
    camera.position.copy(newPosition)

    // Turning (QE)
    if (keys.current.q) {
      camera.rotateY(turnSpeed * delta)
    }
    if (keys.current.e) {
      camera.rotateY(-turnSpeed * delta)
    }
  })

  return null
}