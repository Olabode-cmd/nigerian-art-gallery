import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'
import { logLoad, installLoadingLogger } from './debugLog'

logLoad('main.tsx executing')
installLoadingLogger()

document.fonts?.ready.then(() => {
  logLoad('web fonts ready')
})

logLoad('react root rendering')
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
logLoad('react root render call returned (suspense may still be pending)')
