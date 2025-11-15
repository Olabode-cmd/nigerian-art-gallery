import { useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface FloatingInfoPanelProps {
  artwork: {
    id: number
    title: string
    artist: string
    year: string
    description: string
    story: string
    image: string
  } | null
  artworkPosition: [number, number, number] | null
  onClose: () => void
}

export default function FloatingInfoPanel({ artwork, artworkPosition, onClose }: FloatingInfoPanelProps) {
  const panelRef = useRef<Mesh>(null)
  const isVisible = !!artwork

  useFrame((state) => {
    if (panelRef.current && isVisible) {
      // Gentle floating animation
      panelRef.current.position.y = 4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  if (!artwork || !artworkPosition) return null
  const [artX, artY, artZ] = artworkPosition
  const centerX = 0
  const centerZ = 0
  const directionX = centerX - artX
  const directionZ = centerZ - artZ
  const length = Math.sqrt(directionX * directionX + directionZ * directionZ)
  const normalizedX = directionX / length
  const normalizedZ = directionZ / length
  
  const panelX = artX + normalizedX * 3
  const panelZ = artZ + normalizedZ * 3
  const panelY = artY - 0.5
  
  const rotationY = Math.atan2(normalizedX, normalizedZ)

  return (
    <group position={[panelX, panelY, panelZ]} rotation={[0, rotationY, 0]} visible={isVisible}>
      <mesh ref={panelRef} onClick={onClose}>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial 
          color="#2a2a2a" 
          transparent 
          opacity={0.9}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* Close Button */}
      <mesh position={[1.7, 1.3, 0.11]} onClick={onClose}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>
      
      <Text
        position={[1.7, 1.3, 0.12]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        ×
      </Text>

      {/* Title */}
      <Text
        position={[0, 1, 0.11]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.5}
      >
        {artwork.title}
      </Text>

      {/* Artist and Year */}
      <Text
        position={[0, 0.7, 0.11]}
        fontSize={0.12}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.5}
      >
        {artwork.artist} • {artwork.year}
      </Text>

      {/* Description */}
      <Text
        position={[0, 0.2, 0.11]}
        fontSize={0.09}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.3}
        textAlign="center"
      >
        {artwork.description}
      </Text>

      {/* Story (truncated) */}
      <Text
        position={[0, -0.5, 0.11]}
        fontSize={0.08}
        color="#dddddd"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.3}
        textAlign="center"
      >
        {artwork.story.substring(0, 200)}...
      </Text>
    </group>
  )
}