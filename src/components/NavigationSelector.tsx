import { useEffect, useState, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  EyeIcon,
  KeyboardIcon,
  OrbitIcon,
  UserCircleIcon,
  UserIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import { useGallery } from '../store'

function Key({ children }: { children: ReactNode }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '20px',
      fontFamily: 'monospace',
      backgroundColor: '#374151',
      padding: '2px 5px',
      borderRadius: '3px'
    }}>
      {children}
    </span>
  )
}

function HintRow({ keys, label }: { keys: ReactNode[]; label: string }) {
  return (
    <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {keys.map((k, i) => <Key key={i}>{k}</Key>)} {label}
    </div>
  )
}

const buttonStyle = (active: boolean, isMobile: boolean, activeColor = '#2563eb') => ({
  padding: isMobile ? '10px 16px' : '4px 12px',
  borderRadius: '4px',
  fontSize: '14px',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: active ? activeColor : '#4b5563',
  color: active ? 'white' : '#d1d5db'
})

const AUTO_COLLAPSE_MS = 5000

export default function NavigationSelector() {
  const isMobile = useGallery((state) => state.isMobile)
  const currentMode = useGallery((state) => state.navigationMode)
  const setNavigationMode = useGallery((state) => state.setNavigationMode)
  const cameraView = useGallery((state) => state.cameraView)
  const setCameraView = useGallery((state) => state.setCameraView)
  const customizerOpen = useGallery((state) => state.customizerOpen)
  const setCustomizerOpen = useGallery((state) => state.setCustomizerOpen)
  const lobbyOpen = useGallery((state) => state.lobbyOpen)
  const setLobbyOpen = useGallery((state) => state.setLobbyOpen)
  const roomId = useGallery((state) => state.roomId)
  const peerCount = useGallery((state) => Object.keys(state.peers).length)
  const [controlsCollapsed, setControlsCollapsed] = useState(false)

  // Give new visitors time to read the controls, then tuck the panel away
  useEffect(() => {
    const timer = setTimeout(() => setControlsCollapsed(true), AUTO_COLLAPSE_MS)
    return () => clearTimeout(timer)
  }, [])

  const handleModeChange = (mode: 'orbit' | 'wasd') => {
    if (mode !== currentMode) {
      setNavigationMode(mode)
    }
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
        padding: '12px',
        maxWidth: 'calc(100vw - 32px)'
      }}>
        <div style={{ color: 'white', fontSize: '14px', marginBottom: '8px' }}>Navigation</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleModeChange('orbit')}
            style={buttonStyle(currentMode === 'orbit', isMobile)}
          >
            <HugeiconsIcon icon={OrbitIcon} size={15} color="currentColor" strokeWidth={1.8} />
            Orbit
          </button>
          <button
            onClick={() => handleModeChange('wasd')}
            style={buttonStyle(currentMode === 'wasd', isMobile)}
          >
            <HugeiconsIcon icon={KeyboardIcon} size={15} color="currentColor" strokeWidth={1.8} />
            WASD
          </button>
          {currentMode === 'wasd' && (
            <button
              onClick={() => setCameraView(cameraView === 'first' ? 'third' : 'first')}
              style={buttonStyle(false, isMobile)}
            >
              <HugeiconsIcon
                icon={cameraView === 'first' ? UserIcon : EyeIcon}
                size={15}
                color="currentColor"
                strokeWidth={1.8}
              />
              {cameraView === 'first' ? 'Switch to 3rd person' : 'Switch to 1st person'}
            </button>
          )}
          <button
            onClick={() => {
              const next = !customizerOpen
              setCustomizerOpen(next)
              if (next) setLobbyOpen(false)
            }}
            style={buttonStyle(customizerOpen, isMobile, '#7c3aed')}
          >
            <HugeiconsIcon icon={UserCircleIcon} size={15} color="currentColor" strokeWidth={1.8} />
            Avatar
          </button>
          <button
            onClick={() => {
              const next = !lobbyOpen
              setLobbyOpen(next)
              if (next) setCustomizerOpen(false)
            }}
            style={buttonStyle(lobbyOpen, isMobile)}
          >
            <HugeiconsIcon icon={UserMultipleIcon} size={15} color="currentColor" strokeWidth={1.8} />
            {roomId ? `Room · ${peerCount + 1}` : 'Rooms'}
          </button>
        </div>
      </div>

      {!isMobile && currentMode === 'wasd' && (
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
          <button
            onClick={() => setControlsCollapsed((c) => !c)}
            aria-expanded={!controlsCollapsed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              padding: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontSize: '14px'
            }}
          >
            <HugeiconsIcon icon={KeyboardIcon} size={14} color="#9ca3af" strokeWidth={1.8} />
            Controls
            <span style={{ flex: 1 }} />
            <span style={{
              display: 'inline-flex',
              transform: controlsCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease'
            }}>
              <HugeiconsIcon icon={ArrowDownIcon} size={14} color="#9ca3af" strokeWidth={1.8} />
            </span>
          </button>
          <div style={{
            maxHeight: controlsCollapsed ? 0 : '500px',
            opacity: controlsCollapsed ? 0 : 1,
            overflow: 'hidden',
            transition: 'max-height 0.4s ease, opacity 0.3s ease'
          }}>
            <div style={{ paddingTop: '8px', color: '#d1d5db', fontSize: '12px' }}>
              <HintRow keys={['W']} label="Move Forward" />
              <HintRow keys={['S']} label="Move Backward" />
              <HintRow keys={['A']} label="Strafe Left" />
              <HintRow keys={['D']} label="Strafe Right" />
              <HintRow keys={['Q']} label="Turn Left" />
              <HintRow keys={['E']} label="Turn Right" />
              <HintRow keys={[<HugeiconsIcon key="up" icon={ArrowUpIcon} size={12} strokeWidth={2.2} />]} label="Move Forward" />
              <HintRow keys={[<HugeiconsIcon key="down" icon={ArrowDownIcon} size={12} strokeWidth={2.2} />]} label="Move Backward" />
              <HintRow keys={[<HugeiconsIcon key="left" icon={ArrowLeftIcon} size={12} strokeWidth={2.2} />]} label="Turn Left" />
              <HintRow keys={[<HugeiconsIcon key="right" icon={ArrowRightIcon} size={12} strokeWidth={2.2} />]} label="Turn Right" />
              <HintRow keys={['C']} label="Switch Camera" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
