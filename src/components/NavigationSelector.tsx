import { useState, useEffect } from 'react'

interface NavigationSelectorProps {
  isMobile: boolean
  isVRActive?: boolean
}

export default function NavigationSelector({ isMobile, isVRActive = false }: NavigationSelectorProps) {
  const [currentMode, setCurrentMode] = useState<'orbit' | 'wasd'>('wasd')

  useEffect(() => {
    const saved = localStorage.getItem('navigationMode') as 'orbit' | 'wasd'
    if (saved) {
      setCurrentMode(saved)
    }
  }, [])

  const handleModeChange = (mode: 'orbit' | 'wasd') => {
    if (mode !== currentMode) {
      localStorage.setItem('navigationMode', mode)
      window.location.reload()
    }
  }

  if (isMobile || isVRActive) {
    return null
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        borderRadius: '8px',
        padding: '12px'
      }}>
        <div style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>Navigation</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleModeChange('orbit')}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentMode === 'orbit' ? '#2563eb' : '#4b5563',
              color: currentMode === 'orbit' ? 'white' : '#d1d5db'
            }}
          >
            Orbit
          </button>
          <button
            onClick={() => handleModeChange('wasd')}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: currentMode === 'wasd' ? '#2563eb' : '#4b5563',
              color: currentMode === 'wasd' ? 'white' : '#d1d5db'
            }}
          >
            WASD
          </button>
        </div>
      </div>
      
      {currentMode === 'wasd' && (
        <div style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <div style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>Controls</div>
          <div style={{ color: '#d1d5db', fontSize: '12px' }}>
            <div style={{ marginBottom: '4px' }}><span style={{ fontFamily: 'monospace', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '2px' }}>W</span> Move Forward</div>
            <div style={{ marginBottom: '4px' }}><span style={{ fontFamily: 'monospace', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '2px' }}>S</span> Move Backward</div>
            <div style={{ marginBottom: '4px' }}><span style={{ fontFamily: 'monospace', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '2px' }}>A</span> Strafe Left</div>
            <div style={{ marginBottom: '4px' }}><span style={{ fontFamily: 'monospace', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '2px' }}>D</span> Strafe Right</div>
            <div style={{ marginBottom: '4px' }}><span style={{ fontFamily: 'monospace', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '2px' }}>Q</span> Turn Left</div>
            <div><span style={{ fontFamily: 'monospace', backgroundColor: '#374151', padding: '2px 4px', borderRadius: '2px' }}>E</span> Turn Right</div>
          </div>
        </div>
      )}
    </>
  )
}