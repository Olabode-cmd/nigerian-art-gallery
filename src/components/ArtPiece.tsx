import { useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader, Mesh } from 'three'
import { Text } from '@react-three/drei'
import { useIntersectable } from '../hooks/useIntersectable'
import type { Artwork } from '../data/art'

interface ArtPieceProps {
  artwork: Artwork
  position: [number, number, number]
  rotation: [number, number, number]
  onSelect: () => void
}

export default function ArtPiece({ artwork, position, rotation, onSelect }: ArtPieceProps) {
  const meshRef = useRef<Mesh>(null)

  const texture = useLoader(TextureLoader, artwork.image)
  texture.anisotropy = 4

  // Register the artwork mesh for VR controller selection. Being part of the
  // rotated group, it inherits the wall orientation — one hitbox for all walls.
  useIntersectable(meshRef, artwork, onSelect)

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[2.2, 2.8, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      <mesh
        ref={meshRef}
        position={[0, 0, 0.11]}
        onPointerOver={() => meshRef.current?.scale.setScalar(1.05)}
        onPointerOut={() => meshRef.current?.scale.setScalar(1)}
        onClick={onSelect}
      >
        <planeGeometry args={[2, 2.6]} />
        <meshStandardMaterial map={texture} />
      </mesh>

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
  )
}
