import { useRef } from 'react'
import { Mesh } from 'three'

export default function VRTeleport() {
  const meshRef = useRef<Mesh>(null)

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.01, 0]}
      visible={false}
    >
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  )
}