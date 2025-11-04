import { TeleportTarget } from '@react-three/xr'

export default function VRControls() {
  return (
    <TeleportTarget>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </TeleportTarget>
  )
}