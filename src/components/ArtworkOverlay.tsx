interface ArtworkOverlayProps {
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

export default function ArtworkOverlay({ artwork, onClose }: ArtworkOverlayProps) {
  if (!artwork) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>
          
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6">
              <img
                src={artwork.image}
                alt={artwork.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            <div className="md:w-1/2 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {artwork.title}
              </h2>
              <p className="text-lg text-gray-600 mb-1">
                {artwork.artist}
              </p>
              <p className="text-md text-gray-500 mb-4">
                {artwork.year}
              </p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {artwork.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Story
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {artwork.story}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}