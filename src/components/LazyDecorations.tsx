import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import ErrorBoundary from './ErrorBoundary'

function DecorativeVase() {
  const { scene } = useGLTF('/models/decorative_vase.glb')
  return <primitive object={scene} position={[8, 0, 4]} scale={[0.015, 0.015, 0.015]} />
}

function RhyzomePlant() {
  const { scene } = useGLTF('/models/rhyzome_plant.glb')
  return <primitive object={scene} position={[-6, 0, -8]} scale={[1.8, 1.8, 1.8]} />
}

function ApollSculpture() {
  const { scene } = useGLTF('/models/apoll_sculpture.glb')
  return (
    <primitive 
      object={scene} 
      position={[-8, 0, 8]} 
      rotation={[0, Math.PI/3, 0]}
      scale={[0.85, 0.85, 0.85]} 
    />
  )
}

export default function LazyDecorations() {
  return (
    <Suspense fallback={null}>
      {/* A failed decoration is missing but the gallery stays up */}
      <ErrorBoundary fallback={null}>
        <DecorativeVase />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <RhyzomePlant />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <ApollSculpture />
      </ErrorBoundary>
    </Suspense>
  )
}

// Preload models after initial render
useGLTF.preload('/models/decorative_vase.glb')
useGLTF.preload('/models/rhyzome_plant.glb')
useGLTF.preload('/models/apoll_sculpture.glb')
