import Gallery from './components/Gallery'
import WebXRGallery from './components/WebXRGallery'

function App() {
  // Toggle between implementations
  const useWebXR = new URLSearchParams(window.location.search).get('webxr') === 'true'
  return useWebXR ? <WebXRGallery /> : <Gallery />
}

export default App
