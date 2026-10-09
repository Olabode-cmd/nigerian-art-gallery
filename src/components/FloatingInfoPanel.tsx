import { useRef } from 'react'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useGallery } from '../store'
import { FONT_BOLD, FONT_REGULAR } from '../fonts'

export default function FloatingInfoPanel() {
  const floatRef = useRef<Group>(null)
  const artwork = useGallery((state) => state.selectedArtwork)
  const artworkPosition = useGallery((state) => state.selectedPosition)
  const onClose = useGallery((state) => state.closePanel)

  useFrame((state) => {
    if (floatRef.current) {
      // Gentle floating animation — applied to the wrapper so background and
      // text move together
      floatRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
    }
  })

  if (!artwork || !artworkPosition) return null
  const [artX, artY, artZ] = artworkPosition
  const directionX = -artX
  const directionZ = -artZ
  const length = Math.sqrt(directionX * directionX + directionZ * directionZ)
  const normalizedX = directionX / length
  const normalizedZ = directionZ / length

  const panelX = artX + normalizedX * 3
  const panelZ = artZ + normalizedZ * 3
  const panelY = artY - 0.5

  const rotationY = Math.atan2(normalizedX, normalizedZ)

  return (
    <group position={[panelX, panelY, panelZ]} rotation={[0, rotationY, 0]}>
      <group ref={floatRef}>
        {/* Background */}
        <mesh onClick={onClose}>
          <boxGeometry args={[4, 3.2, 0.12]} />
          <meshLambertMaterial color="#222226" />
        </mesh>

        {/* Close Button */}
        <mesh position={[1.72, 1.42, 0.07]} onClick={onClose}>
          <circleGeometry args={[0.15, 16]} />
          <meshLambertMaterial color="#ff4444" />
        </mesh>

        <Text
          font={FONT_REGULAR}
          position={[1.72, 1.42, 0.08]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ×
        </Text>

        {/* Title */}
        <Text
          font={FONT_BOLD}
          position={[0, 1.05, 0.07]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.6}
        >
          {artwork.title}
        </Text>

        {/* Artist and Year */}
        <Text
          font={FONT_BOLD}
          position={[0, 0.72, 0.07]}
          fontSize={0.12}
          color="#cccccc"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.6}
        >
          {artwork.artist} • {artwork.year}
        </Text>

        {/* Description */}
        <Text
          font={FONT_REGULAR}
          position={[0, 0.18, 0.07]}
          fontSize={0.095}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.4}
          textAlign="center"
        >
          {artwork.description}
        </Text>

        {/* Story (truncated) */}
        <Text
          font={FONT_REGULAR}
          position={[0, -0.55, 0.07]}
          fontSize={0.085}
          color="#dddddd"
          anchorX="center"
          anchorY="middle"
          maxWidth={3.4}
          textAlign="center"
        >
          {artwork.story.substring(0, 200)}…
        </Text>
      </group>
    </group>
  )
}
