import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useGLTF, useProgress } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import { BoxGeometry, CylinderGeometry, MeshLambertMaterial, Object3D, TextureLoader } from 'three'
import type { InstancedMesh } from 'three'
import ArtPiece from './ArtPiece'
import LazyDecorations from './LazyDecorations'
import { art } from '../data/art'
import { useOptimizedTexture } from '../hooks/useOptimizedTexture'
import { useSignTexture } from '../hooks/useSignTexture'
import { useGallery, type Vec3 } from '../store'

// Stable identities so the texture hook's memo doesn't invalidate every render
const FLOOR_REPEAT: [number, number] = [4, 4]
const WALL_REPEAT: [number, number] = [4, 2]
const CEILING_REPEAT: [number, number] = [3, 3]

const roomSize = 20
const wallHeight = 12

// Shared geometry/material for repeated elements — each InstancedMesh is one draw call
const FRAME_GEOMETRY = new BoxGeometry(2.2, 2.8, 0.1)
const FRAME_MATERIAL = new MeshLambertMaterial({ color: '#8B4513' })
const COLUMN_GEOMETRY = new CylinderGeometry(0.3, 0.4, wallHeight, 12)
const COLUMN_OFFSETS: [number, number][] = [[-1, -1], [1, -1], [1, 1], [-1, 1]]

// Loaded on demand with the troika text engine, on the first artwork selection
const FloatingInfoPanel = lazy(() => import('./FloatingInfoPanel'))

// Start artwork downloads immediately, in parallel with the room assets.
// Preload each URL individually (not as one array): R3F's useLoader cache keys
// on [loader, ...urls], so array-preloads never match the single-URL lookups in
// ArtPiece — that mismatch caused every image to be fetched twice. Per-URL
// preloads share ArtPiece's cache entries (one fetch each) and still fire at
// module-eval, ahead of the room textures which start on first render.
art.forEach((artwork) => useLoader.preload(TextureLoader, artwork.image))

function getArtworkPlacement(index: number, roomSize: number): { position: Vec3; rotation: Vec3 } {
  const wallIndex = Math.floor(index / 4)
  const positionOnWall = index % 4
  const spacing = roomSize / 5

  switch (wallIndex) {
    case 0: // North wall
      return {
        position: [(-roomSize / 2 + spacing) + positionOnWall * spacing, 5, -roomSize / 2 + 0.3],
        rotation: [0, 0, 0],
      }
    case 1: // East wall
      return {
        position: [roomSize / 2 - 0.3, 5, (-roomSize / 2 + spacing) + positionOnWall * spacing],
        rotation: [0, -Math.PI / 2, 0],
      }
    case 2: // South wall
      return {
        position: [(roomSize / 2 - spacing) - positionOnWall * spacing, 5, roomSize / 2 - 0.3],
        rotation: [0, Math.PI, 0],
      }
    case 3: // West wall
      return {
        position: [-roomSize / 2 + 0.3, 5, (roomSize / 2 - spacing) - positionOnWall * spacing],
        rotation: [0, Math.PI / 2, 0],
      }
    default:
      return { position: [0, 5, 0], rotation: [0, 0, 0] }
  }
}

// Decorations (vase, plant, sculpture) are not needed to see or use the room —
// they download after the critical assets finish, while the user is already in
// the gallery. The same `progress === 100` signal the LoadingScreen uses means
// the loading bar never waits on them.
function DecorationsAfterCriticalPath() {
  const progress = useProgress((state) => state.progress)
  const [mount, setMount] = useState(false)

  useEffect(() => {
    if (progress === 100) setMount(true)
  }, [progress])

  if (!mount) return null
  return <LazyDecorations />
}

export default function Room() {
  const selectArtwork = useGallery((state) => state.selectArtwork)
  const hasSelection = useGallery((state) => state.selectedArtwork !== null)
  const columnsRef = useRef<InstancedMesh>(null)
  const framesRef = useRef<InstancedMesh>(null)

  const floor = useOptimizedTexture(
    '/models/floor_textures/textures/wood_floor_diff_1k.webp',
    FLOOR_REPEAT
  )
  const wall = useOptimizedTexture(
    '/models/stone_tile_wall/textures/stone_tile_wall_diff_1k.webp',
    WALL_REPEAT
  )
  const marble = useOptimizedTexture(
    '/models/marble_textures/textures/marble_mosaic_tiles_diff_1k.webp'
  )
  const ceiling = useOptimizedTexture(
    '/models/ceiling_textures/textures/ceiling_interior_diff_1k.webp',
    CEILING_REPEAT
  )
  const signTexture = useSignTexture()

  const columnMaterial = useMemo(() => new MeshLambertMaterial({ map: marble }), [marble])

  const { scene: ceilingLight } = useGLTF('/models/light_ceiling.glb')

  useLayoutEffect(() => {
    const mesh = columnsRef.current
    if (!mesh) return
    const dummy = new Object3D()
    COLUMN_OFFSETS.forEach(([x, z], i) => {
      dummy.position.set(x * (roomSize / 2 - 0.5), wallHeight / 2, z * (roomSize / 2 - 0.5))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  useLayoutEffect(() => {
    const mesh = framesRef.current
    if (!mesh) return
    const dummy = new Object3D()
    art.forEach((_, index) => {
      const { position, rotation } = getArtworkPlacement(index, roomSize)
      dummy.position.set(position[0], position[1], position[2])
      dummy.rotation.set(rotation[0], rotation[1], rotation[2])
      dummy.translateZ(0.05) // frame sits slightly in front of the wall, as before
      dummy.updateMatrix()
      mesh.setMatrixAt(index, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [])

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
      <instancedMesh
        ref={columnsRef}
        args={[COLUMN_GEOMETRY, columnMaterial, COLUMN_OFFSETS.length]}
      />

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

      {/* Decorative Elements - load after the critical path, not before it */}
      <DecorationsAfterCriticalPath />

      {/* Instruction Sign — text is baked to a texture, no troika on the critical path */}
      <group position={[0, 9, -9]}>
        <mesh>
          <boxGeometry args={[6, 2.2, 0.1]} />
          <meshLambertMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[6, 2.2]} />
          <meshBasicMaterial map={signTexture} transparent />
        </mesh>
      </group>

      {/* Floating Info Panel — mounted only while a selection exists, so the
          troika text chunk loads on the first artwork click */}
      {hasSelection && (
        <Suspense fallback={null}>
          <FloatingInfoPanel />
        </Suspense>
      )}

      {/* Artwork frames - instanced, one draw call for all 16 */}
      <instancedMesh ref={framesRef} args={[FRAME_GEOMETRY, FRAME_MATERIAL, art.length]} />

      {/* Art Pieces - 4 per wall */}
      <Suspense fallback={null}>
        {art.map((artwork, index) => {
          const { position, rotation } = getArtworkPlacement(index, roomSize)

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
