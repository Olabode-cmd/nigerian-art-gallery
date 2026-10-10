import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logLoad } from '../debugLog'

interface Props {
  children: ReactNode
  /**
   * Rendered in place of children when they crash. Omit for the root
   * boundary, which shows a full-screen fallback.
   */
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logLoad(`component crashed: ${error.message}`)
    console.error(error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    if (this.props.fallback !== undefined) return this.props.fallback

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '24px',
          zIndex: 2000
        }}
      >
        <h1 style={{ fontSize: '20px', margin: 0 }}>Something went wrong</h1>
        <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '420px', margin: 0 }}>
          The gallery failed to load — usually a network hiccup. Your connection may still be
          busy with large assets.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            background: '#2563eb',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Reload
        </button>
      </div>
    )
  }
}
