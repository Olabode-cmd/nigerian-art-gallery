import { forwardRef } from 'react'
import type { Group } from 'three'

// Eye level of the avatar — matches the room's oversized scale (artwork
// centers sit at y=5, so a ~5-unit-tall character reads correctly in it)
export const HEAD_Y = 4.3

const Avatar = forwardRef<Group>((_, ref) => {
  return (
    <group ref={ref} position={[0, 0, 0]}>
      {/* Legs */}
      <mesh position={[-0.24, 0.6, 0]}>
        <boxGeometry args={[0.32, 1.2, 0.36]} />
        <meshLambertMaterial color="#20242e" />
      </mesh>
      <mesh position={[0.24, 0.6, 0]}>
        <boxGeometry args={[0.32, 1.2, 0.36]} />
        <meshLambertMaterial color="#20242e" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 2.3, 0]}>
        <capsuleGeometry args={[0.45, 1.2, 8, 16]} />
        <meshLambertMaterial color="#1e3a5f" />
      </mesh>

      {/* Green sash — Nigerian flag accent */}
      <mesh position={[0, 2.6, 0.47]}>
        <boxGeometry args={[0.1, 0.9, 0.08]} />
        <meshLambertMaterial color="#1f8a4c" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.35, 12]} />
        <meshLambertMaterial color="#c99b70" />
      </mesh>

      {/* Head */}
      <mesh position={[0, 4.15, 0]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshLambertMaterial color="#e8c9a0" />
      </mesh>
    </group>
  )
})

Avatar.displayName = 'Avatar'

export default Avatar