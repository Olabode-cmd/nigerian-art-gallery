import { useRef, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, Mesh } from 'three'
import { Text } from '@react-three/drei'
import Interactive from './Interactive'

interface ArtPieceProps {
  artwork: {
    id: number
    title: string
    artist: string
    year: string
    description: string
    story: string
    image: string
  }
  position: [number, number, number]
  rotation: [number, number, number]
  onArtworkClick: (artwork: ArtPieceProps['artwork']) => void
}

export default function ArtPiece({ artwork, position, rotation, onArtworkClick }: ArtPieceProps) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  const texture = useLoader(TextureLoader, artwork.image)

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.scale.setScalar(1.05)
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1)
    }
  })

  return (
    <Interactive 
      onSelect={() => onArtworkClick(artwork)}
      userData={{ artwork, position }}
    >
      <group position={position} rotation={rotation}>
        {/* Frame */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[2.2, 2.8, 0.1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Artwork */}
        <mesh
          ref={meshRef}
          position={[0, 0, 0.11]}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          onClick={() => onArtworkClick(artwork)}
        >
          <planeGeometry args={[2, 2.6]} />
          <meshStandardMaterial map={texture} />
        </mesh>

        {/* Label */}
        <Text
          position={[0, -1.8, 0.12]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {artwork.title}
        </Text>
        
        <Text
          position={[0, -2.1, 0.12]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {artwork.artist} • {artwork.year}
        </Text>
      </group>
    </Interactive>
  )
}