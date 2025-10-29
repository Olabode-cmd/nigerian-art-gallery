import { Html } from '@react-three/drei'

interface ArtworkOverlay3DProps {
  artwork: {
    id: number
    title: string
    artist: string
    year: string
    description: string
    story: string
    image: string
  } | null
  onClose: () => void
}

export default function ArtworkOverlay3D({ artwork, onClose }: ArtworkOverlay3DProps) {
  if (!artwork) return null

  return (
    <Html
      position={[0, 6, 0]}
      center
      distanceFactor={10}
      occlude
      transform
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-96 max-h-96 overflow-y-auto"
        style={{ 
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)'
        }}
      >
        <div className="relative p-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl z-10 w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
          
          <div className="pr-6">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {artwork.title}
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              {artwork.artist}
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {artwork.year}
            </p>
            
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Description
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {artwork.description}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                Story
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
                {artwork.story}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Html>
  )
}