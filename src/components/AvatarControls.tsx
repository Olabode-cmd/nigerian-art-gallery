import { useEffect, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type Group } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useGallery } from '../store'
import { input } from '../input'
import { HEAD_Y } from './Avatar'

const MOVE_SPEED = 5
const TURN_SPEED = 1
const ROOM_BOUND = 9 // roomSize/2 - wallBuffer

const THIRD_PERSON_DISTANCE = 4.5
const THIRD_PERSON_HEIGHT = HEAD_Y + 0.9

// Reused vectors to avoid per-frame allocations
const tmpForward = new Vector3()
const tmpRight = new Vector3()
const tmpHead = new Vector3()
const tmpDesired = new Vector3()

const FORWARD_KEYS = new Set(['w', 'arrowup'])
const BACKWARD_KEYS = new Set(['s', 'arrowdown'])
const STRAFE_LEFT_KEYS = new Set(['a'])
const STRAFE_RIGHT_KEYS = new Set(['d'])
const TURN_LEFT_KEYS = new Set(['q', 'arrowleft'])
const TURN_RIGHT_KEYS = new Set(['e', 'arrowright'])
const ARROW_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright'])

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const anyPressed = (keys: Set<string>, pressed: Set<string>) => {
  for (const key of keys) {
    if (pressed.has(key)) return true
  }
  return false
}

interface AvatarControlsProps {
  avatarRef: React.RefObject<Group | null>
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  speedRef: MutableRefObject<number>
}

export default function AvatarControls({ avatarRef, controlsRef, speedRef }: AvatarControlsProps) {
  const { camera, gl } = useThree()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if (ARROW_KEYS.has(key)) {
        event.preventDefault() // arrows scroll the page by default
      }
      input.press(key)
      if (key === 'c' && !event.repeat) {
        const { cameraView, setCameraView } = useGallery.getState()
        setCameraView(cameraView === 'first' ? 'third' : 'first')
      }
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      input.release(event.key.toLowerCase())
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    const avatar = avatarRef.current
    if (!avatar) return

    avatar.visible = !gl.xr.isPresenting
    if (gl.xr.isPresenting) return

    const { navigationMode, cameraView } = useGallery.getState()

    // --- Avatar movement ---
    const yaw = avatar.rotation.y
    const prevX = avatar.position.x
    const prevZ = avatar.position.z
    tmpForward.set(-Math.sin(yaw), 0, -Math.cos(yaw))
    tmpRight.set(tmpForward.z, 0, -tmpForward.x)

    let moveX = 0
    let moveZ = 0
    const pressed = input.pressedKeys()
    if (anyPressed(FORWARD_KEYS, pressed)) {
      moveX += tmpForward.x
      moveZ += tmpForward.z
    }
    if (anyPressed(BACKWARD_KEYS, pressed)) {
      moveX -= tmpForward.x
      moveZ -= tmpForward.z
    }
    if (anyPressed(STRAFE_LEFT_KEYS, pressed)) {
      moveX -= tmpRight.x
      moveZ -= tmpRight.z
    }
    if (anyPressed(STRAFE_RIGHT_KEYS, pressed)) {
      moveX += tmpRight.x
      moveZ += tmpRight.z
    }

    const length = Math.hypot(moveX, moveZ)
    if (length > 0) {
      avatar.position.x = clamp(
        avatar.position.x + (moveX / length) * MOVE_SPEED * delta,
        -ROOM_BOUND,
        ROOM_BOUND
      )
      avatar.position.z = clamp(
        avatar.position.z + (moveZ / length) * MOVE_SPEED * delta,
        -ROOM_BOUND,
        ROOM_BOUND
      )
    }

    // Drive the walk animation from actual displacement, so the legs stop
    // when the avatar is blocked by a wall
    const moved = Math.hypot(avatar.position.x - prevX, avatar.position.z - prevZ)
    speedRef.current = moved > 1e-4 ? 1 : 0

    if (anyPressed(TURN_LEFT_KEYS, pressed)) {
      avatar.rotation.y += TURN_SPEED * delta
    }
    if (anyPressed(TURN_RIGHT_KEYS, pressed)) {
      avatar.rotation.y -= TURN_SPEED * delta
    }

    // --- Camera ---
    tmpHead.set(avatar.position.x, HEAD_Y, avatar.position.z)

    if (navigationMode === 'orbit') {
      // Orbit revolves around the avatar
      const controls = controlsRef.current
      if (controls) {
        controls.target.copy(tmpHead)
      }
    } else if (cameraView === 'first') {
      // Eye view of the avatar
      camera.position.copy(tmpHead)
      camera.rotation.set(0, yaw, 0)
    } else {
      // Third person — a few meters behind the head
      tmpDesired.set(
        avatar.position.x + Math.sin(yaw) * THIRD_PERSON_DISTANCE,
        THIRD_PERSON_HEIGHT,
        avatar.position.z + Math.cos(yaw) * THIRD_PERSON_DISTANCE
      )
      // Keep the camera inside the room when the avatar is near a wall
      tmpDesired.x = clamp(tmpDesired.x, -ROOM_BOUND, ROOM_BOUND)
      tmpDesired.z = clamp(tmpDesired.z, -ROOM_BOUND, ROOM_BOUND)

      const t = 1 - Math.pow(0.001, delta)
      camera.position.lerp(tmpDesired, t)
      camera.lookAt(tmpHead)
    }
  })

  return null
}