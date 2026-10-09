import { useRef } from 'react'
import { useLoader } from '@react-three/fiber'
import { TextureLoader, Mesh } from 'three'
import { useIntersectable } from '../hooks/useIntersectable'
import { useLabelTexture } from '../hooks/useLabelTexture'
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

  const labelTexture = useLabelTexture(artwork.title, `${artwork.artist} • ${artwork.year}`)

  // Register the artwork mesh for VR controller selection. Being part of the
  // rotated group, it inherits the wall orientation — one hitbox for all walls.
  useIntersectable(meshRef, artwork, onSelect)

  return (
    <group position={position} rotation={rotation}>
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

      {/* Baked title/artist label — no troika text cost */}
      <mesh position={[0, -1.95, 0.13]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial map={labelTexture} transparent />
      </mesh>
    </group>
  )
}