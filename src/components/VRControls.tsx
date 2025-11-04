import { Text } from '@react-three/drei'
import { useXRStore } from '@react-three/xr'

export default function VRControls() {
  const store = useXRStore()

  const handleExitVR = () => {
    store.exitVR()
  }

  return (
    <group position={[0, 6, -3]}>
      {/* Exit VR Button */}
      <mesh onClick={handleExitVR}>
        <boxGeometry args={[2, 0.8, 0.2]} />
        <meshStandardMaterial color="#dc3545" />
      </mesh>
      
      <Text
        position={[0, 0, 0.11]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Exit VR
      </Text>
    </group>
  )
}