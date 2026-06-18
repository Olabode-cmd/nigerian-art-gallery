import { useRef, Suspense } from 'react'
import { Mesh } from 'three'
import { useGLTF, Text } from '@react-three/drei'
import ArtPiece from './ArtPiece'
import FloatingInfoPanel from './FloatingInfoPanel'
import LazyDecorations from './LazyDecorations'
import { art } from '../data/art'
import { useOptimizedTexturePair } from '../hooks/useOptimizedTexture'

interface RoomProps {
  onArtworkClick: (artwork: typeof art[0], position: [number, number, number]) => void
  selectedArtwork: typeof art[0] | null
  selectedArtworkPosition: [number, number, number] | null
  onClosePanel: () => void
}

export default function Room({ onArtworkClick, selectedArtwork, selectedArtworkPosition, onClosePanel }: RoomProps) {
  const floorRef = useRef<Mesh>(null)
  const roomSize = 20
  const wallHeight = 12
  
  const floor = useOptimizedTexturePair(
    '/models/floor_textures/textures/wood_floor_diff_2k.jpg',
    '/models/floor_textures/textures/wood_floor_disp_2k.png',
    [4, 4]
  )
  
  const wall = useOptimizedTexturePair(
    '/models/stone_tile_wall/textures/stone_tile_wall_diff_1k.jpg',
    '/models/stone_tile_wall/textures/stone_tile_wall_disp_1k.png',
    [4, 2]
  )
  
  const marble = useOptimizedTexturePair(
    '/models/marble_textures/textures/marble_mosaic_tiles_diff_1k.jpg',
    '/models/marble_textures/textures/marble_mosaic_tiles_disp_1k.png'
  )
  
  const ceiling = useOptimizedTexturePair(
    '/models/ceiling_textures/textures/ceiling_interior_diff_1k.jpg',
    '/models/ceiling_textures/textures/ceiling_interior_disp_1k.png',
    [3, 3]
  )
  
  const { scene: ceilingLight } = useGLTF('/models/light_ceiling.glb')

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial 
          map={floor.diffuse}
          displacementMap={floor.displacement}
          displacementScale={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Four Walls */}
      {/* North Wall */}
      <mesh position={[0, wallHeight/2, -roomSize/2]}>
        <boxGeometry args={[roomSize, wallHeight, 0.5]} />
        <meshStandardMaterial 
          map={wall.diffuse}
          displacementMap={wall.displacement}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* South Wall */}
      <mesh position={[0, wallHeight/2, roomSize/2]}>
        <boxGeometry args={[roomSize, wallHeight, 0.5]} />
        <meshStandardMaterial 
          map={wall.diffuse}
          displacementMap={wall.displacement}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* East Wall */}
      <mesh position={[roomSize/2, wallHeight/2, 0]}>
        <boxGeometry args={[0.5, wallHeight, roomSize]} />
        <meshStandardMaterial 
          map={wall.diffuse}
          displacementMap={wall.displacement}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* West Wall */}
      <mesh position={[-roomSize/2, wallHeight/2, 0]}>
        <boxGeometry args={[0.5, wallHeight, roomSize]} />
        <meshStandardMaterial 
          map={wall.diffuse}
          displacementMap={wall.displacement}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Corner Columns */}
      {[[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z], i) => (
        <mesh key={i} position={[x * (roomSize/2 - 0.5), wallHeight/2, z * (roomSize/2 - 0.5)]}>
          <cylinderGeometry args={[0.3, 0.4, wallHeight, 12]} />
          <meshStandardMaterial 
            map={marble.diffuse}
            displacementMap={marble.displacement}
            displacementScale={0.02}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}
      
      {/* Ceiling */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]}>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial 
          map={ceiling.diffuse}
          displacementMap={ceiling.displacement}
          displacementScale={0.03}
          roughness={0.6}
          metalness={0.05}
        />
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
      <FloatingInfoPanel 
        artwork={selectedArtwork}
        artworkPosition={selectedArtworkPosition}
        onClose={onClosePanel}
      />

      {/* Art Pieces - 4 per wall */}
      <Suspense fallback={null}>
        {art.map((artwork, index) => {
        const wallIndex = Math.floor(index / 4)
        const positionOnWall = index % 4
        const spacing = roomSize / 5
        
        let position: [number, number, number]
        let rotation: [number, number, number]
        
        switch(wallIndex) {
          case 0: // North wall
            position = [(-roomSize/2 + spacing) + positionOnWall * spacing, 5, -roomSize/2 + 0.3]
            rotation = [0, 0, 0]
            break
          case 1: // East wall
            position = [roomSize/2 - 0.3, 5, (-roomSize/2 + spacing) + positionOnWall * spacing]
            rotation = [0, -Math.PI/2, 0]
            break
          case 2: // South wall
            position = [(roomSize/2 - spacing) - positionOnWall * spacing, 5, roomSize/2 - 0.3]
            rotation = [0, Math.PI, 0]
            break
          case 3: // West wall
            position = [-roomSize/2 + 0.3, 5, (roomSize/2 - spacing) - positionOnWall * spacing]
            rotation = [0, Math.PI/2, 0]
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
            onArtworkClick={(artwork) => onArtworkClick(artwork, position)}
          />
        )
      })}
      </Suspense>
    </group>
  )
}

useGLTF.preload('/models/light_ceiling.glb')