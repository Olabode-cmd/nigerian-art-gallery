import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useShallow } from 'zustand/react/shallow'
import Avatar, { HEAD_Y } from './Avatar'
import { remotePlayers } from '../room'
import { voice } from '../voice'
import { DEFAULT_AVATAR_CONFIG } from '../avatarConfig'
import { useGallery } from '../store'

// Exponential smoothing time constant (~100ms behind the latest received pose)
const SMOOTHING = 10

function RemoteAvatar({ id }: { id: string }) {
  const groupRef = useRef<Group>(null)
  const speedRef = useRef(0)
  const speechRef = useRef(0)
  const config = useGallery((state) => state.peers[id]?.config ?? DEFAULT_AVATAR_CONFIG)
  const name = useGallery((state) => state.peers[id]?.name)

  useFrame((_, delta) => {
    const group = groupRef.current
    const player = remotePlayers.get(id)
    if (!group || !player) return

    // Invisible until the first pose arrives, so peers don't pop in at the origin
    group.visible = player.hasPose
    if (!player.hasPose) return

    if (player.snap) {
      group.position.set(player.x, 0, player.z)
      group.rotation.y = player.yaw
      player.snap = false
      return
    }

    const t = 1 - Math.exp(-SMOOTHING * delta)
    group.position.x += (player.x - group.position.x) * t
    group.position.z += (player.z - group.position.z) * t
    // Shortest-arc interpolation so yaw never spins the long way around
    const dy = player.yaw - group.rotation.y
    group.rotation.y += Math.atan2(Math.sin(dy), Math.cos(dy)) * t
    speedRef.current = player.moving ? 1 : 0
    speechRef.current = voice.getRemoteLevel(id)
    // Keep their voice panned at the interpolated position
    voice.updateRemotePosition(id, group.position.x, HEAD_Y, group.position.z)
  })

  return <Avatar ref={groupRef} config={config} speed={speedRef} speech={speechRef} name={name} />
}

export default function Peers() {
  const peerIds = useGallery(useShallow((state) => Object.keys(state.peers)))
  return (
    <>
      {peerIds.map((id) => (
        <RemoteAvatar key={id} id={id} />
      ))}
    </>
  )
}
