import { useRef } from 'react'
import { Mesh, RepeatWrapping } from 'three'
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { useGLTF, Text } from '@react-three/drei'
import ArtPiece from './ArtPiece'
import FloatingInfoPanel from './FloatingInfoPanel'
import { art } from '../data/art'

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
  
  // Load floor textures
  const floorDiffuse = useLoader(TextureLoader, '/models/floor_textures/textures/wood_floor_diff_2k.jpg')
  const floorDisplacement = useLoader(TextureLoader, '/models/floor_textures/textures/wood_floor_disp_2k.png')
  
  // Load wall textures (stone tile wall for main walls)
  const wallDiffuse = useLoader(TextureLoader, '/models/stone_tile_wall/textures/stone_tile_wall_diff_1k.jpg')
  const wallDisplacement = useLoader(TextureLoader, '/models/stone_tile_wall/textures/stone_tile_wall_disp_1k.png')
  
  // Load marble textures for columns
  const marbleDiffuse = useLoader(TextureLoader, '/models/marble_textures/textures/marble_mosaic_tiles_diff_1k.jpg')
  const marbleDisplacement = useLoader(TextureLoader, '/models/marble_textures/textures/marble_mosaic_tiles_disp_1k.png')
  
  // Load ceiling textures
  const ceilingDiffuse = useLoader(TextureLoader, '/models/ceiling_textures/textures/ceiling_interior_diff_1k.jpg')
  const ceilingDisplacement = useLoader(TextureLoader, '/models/ceiling_textures/textures/ceiling_interior_disp_1k.png')
  
  // Configure texture wrapping and repeat
  floorDiffuse.wrapS = floorDiffuse.wrapT = RepeatWrapping
  floorDiffuse.repeat.set(4, 4)
  floorDisplacement.wrapS = floorDisplacement.wrapT = RepeatWrapping
  floorDisplacement.repeat.set(4, 4)
  
  wallDiffuse.wrapS = wallDiffuse.wrapT = RepeatWrapping
  wallDiffuse.repeat.set(4, 2)
  
  ceilingDiffuse.wrapS = ceilingDiffuse.wrapT = RepeatWrapping
  ceilingDiffuse.repeat.set(3, 3)
  
  // Load ceiling light
  const { scene: ceilingLight } = useGLTF('/models/light_ceiling.glb')
  
  // Load decorative models
  const { scene: decorativeVase } = useGLTF('/models/decorative_vase.glb')
  const { scene: rhyzomePlant } = useGLTF('/models/rhyzome_plant.glb')
  // const { scene: scannedBenches } = useGLTF('/models/scanned_benches_on_cobble.glb')
  // const { scene: kungsaraBench } = useGLTF('/models/the_kungsara_bench.glb')
  const { scene: apollSculpture } = useGLTF('/models/apoll_sculpture.glb')

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[roomSize, roomSize]} />
        <meshStandardMaterial 
          map={floorDiffuse}
          displacementMap={floorDisplacement}
          displacementScale={0.1}
          roughness={0.6}
        />
      </mesh>

      {/* Four Walls */}
      {/* North Wall */}
      <mesh position={[0, wallHeight/2, -roomSize/2]}>
        <boxGeometry args={[roomSize, wallHeight, 0.5]} />
        <meshStandardMaterial 
          map={wallDiffuse}
          displacementMap={wallDisplacement}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* South Wall */}
      <mesh position={[0, wallHeight/2, roomSize/2]}>
        <boxGeometry args={[roomSize, wallHeight, 0.5]} />
        <meshStandardMaterial 
          map={wallDiffuse}
          displacementMap={wallDisplacement}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* East Wall */}
      <mesh position={[roomSize/2, wallHeight/2, 0]}>
        <boxGeometry args={[0.5, wallHeight, roomSize]} />
        <meshStandardMaterial 
          map={wallDiffuse}
          displacementMap={wallDisplacement}
          displacementScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* West Wall */}
      <mesh position={[-roomSize/2, wallHeight/2, 0]}>
        <boxGeometry args={[0.5, wallHeight, roomSize]} />
        <meshStandardMaterial 
          map={wallDiffuse}
          displacementMap={wallDisplacement}
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
            map={marbleDiffuse}
            displacementMap={marbleDisplacement}
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
          map={ceilingDiffuse}
          displacementMap={ceilingDisplacement}
          displacementScale={0.03}
          roughness={0.6}
          metalness={0.05}
        />
      </mesh>
      
      {/* Ceiling Light */}
      <primitive
        object={ceilingLight.clone()}
        position={[0, wallHeight - 0.5, 0]}
        scale={[1.5, 1.5, 1.5]}
      />
      
      {/* Decorative Elements */}
      {/* Decorative Vase - in corner */}
      <primitive 
        object={decorativeVase.clone()} 
        position={[8, 0, 4]} 
        scale={[0.015, 0.015, 0.015]} 
      />
      
      {/* Rhyzome Plant */}
      <primitive 
        object={rhyzomePlant.clone()} 
        position={[-6, 0, -8]} 
        scale={[1.8, 1.8, 1.8]} 
      />
      
      {/* Scanned Benches - center of room */}
      {/* <primitive 
        object={scannedBenches.clone()} 
        position={[0, 0, 0]} 
        scale={[0.4, 0.4, 0.4]} 
      /> */}
      
      {/* Kungsara Bench - along wall center */}
      {/* <primitive 
        object={kungsaraBench.clone()} 
        position={[0, 0, 8]} 
        rotation={[0, 0, 0]}
        scale={[0.8, 0.8, 0.8]} 
      /> */}
      
      {/* Apollo Sculpture - in empty corner */}
      <primitive 
        object={apollSculpture.clone()} 
        position={[-8, 0, 8]} 
        rotation={[0, Math.PI/3, 0]}
        scale={[0.85, 0.85, 0.85]} 
      />

      {/* Instruction Sign */}
      <group position={[0, 9, -9]}>
        <mesh>
          <boxGeometry args={[6, 1.5, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={5.5}
        >
          Point and select artwork to learn more
          {"\n"}Use controllers to teleport around
        </Text>
      </group>

      {/* Floating Info Panel */}
      <FloatingInfoPanel 
        artwork={selectedArtwork}
        artworkPosition={selectedArtworkPosition}
        onClose={onClosePanel}
      />

      {/* Art Pieces - 4 per wall */}
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
    </group>
  )
}