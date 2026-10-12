import { useEffect, type MutableRefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type Group } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useGallery } from '../store'
import { input } from '../input'
import { localPeer, localPose, remotePlayers } from '../room'
import { AVATAR_RADIUS, HEAD_Y } from './Avatar'

const MOVE_SPEED = 5
const TURN_SPEED = 1
const ROOM_BOUND = 9 // roomSize/2 - wallBuffer
const MIN_SEPARATION = AVATAR_RADIUS * 2
const MIN_SEPARATION_SQ = MIN_SEPARATION * MIN_SEPARATION

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

/**
 * Pushes the local avatar out of any remote avatar it overlaps. Each client
 * only moves its own avatar, but since every client does this, no pair of
 * avatars can stand inside each other.
 */
function pushOutOfPeers(position: Vector3): void {
  remotePlayers.forEach((peer, peerId) => {
    if (!peer.hasPose) return
    const dx = position.x - peer.x
    const dz = position.z - peer.z
    const distSq = dx * dx + dz * dz
    if (distSq >= MIN_SEPARATION_SQ) return
    const dist = Math.sqrt(distSq)
    let normalX = 0
    let normalZ = 0
    if (dist > 1e-4) {
      normalX = dx / dist
      normalZ = dz / dist
    } else {
      // Exactly on top of each other (e.g. both at spawn): comparing IDs
      // sends the two clients in opposite directions
      normalX = localPeer.id < peerId ? 1 : -1
    }
    const depth = MIN_SEPARATION - dist
    position.x = clamp(position.x + normalX * depth, -ROOM_BOUND, ROOM_BOUND)
    position.z = clamp(position.z + normalZ * depth, -ROOM_BOUND, ROOM_BOUND)
  })
}

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
    tmpRight.set(-tmpForward.z, 0, tmpForward.x)

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
    // Runs even when idle, so avatars that spawn on the same spot separate
    pushOutOfPeers(avatar.position)

    // Drive the walk animation from actual displacement, so the legs stop
    // when the avatar is blocked by a wall or another avatar
    const moved = Math.hypot(avatar.position.x - prevX, avatar.position.z - prevZ)
    speedRef.current = moved > 1e-4 ? 1 : 0

    if (anyPressed(TURN_LEFT_KEYS, pressed)) {
      avatar.rotation.y += TURN_SPEED * delta
    }
    if (anyPressed(TURN_RIGHT_KEYS, pressed)) {
      avatar.rotation.y -= TURN_SPEED * delta
    }

    // Feed the multiplayer pose sender
    localPose.x = avatar.position.x
    localPose.z = avatar.position.z
    localPose.yaw = avatar.rotation.y

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