import { Suspense } from 'react'
import { useGLTF, Text } from '@react-three/drei'
import ArtPiece from './ArtPiece'
import FloatingInfoPanel from './FloatingInfoPanel'
import LazyDecorations from './LazyDecorations'
import { art } from '../data/art'
import { useOptimizedTexture } from '../hooks/useOptimizedTexture'
import { useGallery, type Vec3 } from '../store'
import { FONT_BOLD, FONT_REGULAR } from '../fonts'

// Stable identities so the texture hook's memo doesn't invalidate every render
const FLOOR_REPEAT: [number, number] = [4, 4]
const WALL_REPEAT: [number, number] = [4, 2]
const CEILING_REPEAT: [number, number] = [3, 3]

export default function Room() {
  const roomSize = 20
  const wallHeight = 12
  const selectArtwork = useGallery((state) => state.selectArtwork)

  const floor = useOptimizedTexture(
    '/models/floor_textures/textures/wood_floor_diff_2k.jpg',
    FLOOR_REPEAT
  )
  const wall = useOptimizedTexture(
    '/models/stone_tile_wall/textures/stone_tile_wall_diff_1k.jpg',
    WALL_REPEAT
  )
  const marble = useOptimizedTexture(
    '/models/marble_textures/textures/marble_mosaic_tiles_diff_1k.jpg'
  )
  const ceiling = useOptimizedTexture(
    '/models/ceiling_textures/textures/ceiling_interior_diff_1k.jpg',
    CEILING_REPEAT
  )

  const { scene: ceilingLight } = useGLTF('/models/light_ceiling.glb')

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial map={floor} roughness={0.6} />
      </mesh>

      {/* Four Walls */}
      {/* North Wall */}
      <mesh position={[0, wallHeight / 2, -roomSize / 2]}>
        <boxGeometry args={[roomSize, wallHeight, 0.5]} />
        <meshStandardMaterial map={wall} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* South Wall */}
      <mesh position={[0, wallHeight / 2, roomSize / 2]}>
        <boxGeometry args={[roomSize, wallHeight, 0.5]} />
        <meshStandardMaterial map={wall} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* East Wall */}
      <mesh position={[roomSize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[0.5, wallHeight, roomSize]} />
        <meshStandardMaterial map={wall} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* West Wall */}
      <mesh position={[-roomSize / 2, wallHeight / 2, 0]}>
        <boxGeometry args={[0.5, wallHeight, roomSize]} />
        <meshStandardMaterial map={wall} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Corner Columns */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x * (roomSize / 2 - 0.5), wallHeight / 2, z * (roomSize / 2 - 0.5)]}>
          <cylinderGeometry args={[0.3, 0.4, wallHeight, 12]} />
          <meshStandardMaterial map={marble} roughness={0.4} metalness={0.1} />
        </mesh>
      ))}

      {/* Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]}>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial map={ceiling} roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Ceiling Light */}
      <primitive
        object={ceilingLight}
        position={[0, wallHeight - 0.5, 0]}
        scale={[1.5, 1.5, 1.5]}
      />

      {/* Decorative Elements - Lazy Loaded */}
      <LazyDecorations />

      {/* Instruction Sign */}
      <group position={[0, 9, -9]}>
        <mesh>
          <boxGeometry args={[6, 2.2, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <Text
          font={FONT_BOLD}
          position={[0, 0.4, 0.06]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.5}
        >
          Click on any artwork to learn more
        </Text>
        <Text
          font={FONT_REGULAR}
          position={[0, -0.2, 0.06]}
          fontSize={0.15}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.5}
        >
          contact developer: olabodebalogun80@gmail.com
        </Text>
        <Text
          font={FONT_REGULAR}
          position={[0, -0.5, 0.06]}
          fontSize={0.15}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.5}
        >
          twitter: @theavatar_bode
        </Text>
      </group>

      {/* Floating Info Panel */}
      <FloatingInfoPanel />

      {/* Art Pieces - 4 per wall */}
      <Suspense fallback={null}>
        {art.map((artwork, index) => {
          const wallIndex = Math.floor(index / 4)
          const positionOnWall = index % 4
          const spacing = roomSize / 5

          let position: Vec3
          let rotation: Vec3

          switch (wallIndex) {
            case 0: // North wall
              position = [(-roomSize / 2 + spacing) + positionOnWall * spacing, 5, -roomSize / 2 + 0.3]
              rotation = [0, 0, 0]
              break
            case 1: // East wall
              position = [roomSize / 2 - 0.3, 5, (-roomSize / 2 + spacing) + positionOnWall * spacing]
              rotation = [0, -Math.PI / 2, 0]
              break
            case 2: // South wall
              position = [(roomSize / 2 - spacing) - positionOnWall * spacing, 5, roomSize / 2 - 0.3]
              rotation = [0, Math.PI, 0]
              break
            case 3: // West wall
              position = [-roomSize / 2 + 0.3, 5, (roomSize / 2 - spacing) - positionOnWall * spacing]
              rotation = [0, Math.PI / 2, 0]
              break
            default:
              position = [0, 5, 0]
              rotation = [0, 0, 0]
          }

          return (
            <ArtPiece
              key={artwork.id}
              artwork={artwork}
              position={position}
              rotation={rotation}
              onSelect={() => selectArtwork(artwork, position)}
            />
          )
        })}
      </Suspense>
    </group>
  )
}

useGLTF.preload('/models/light_ceiling.glb')
