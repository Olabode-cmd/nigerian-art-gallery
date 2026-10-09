import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  EyeIcon,
  KeyboardIcon,
  OrbitIcon,
  UserIcon,
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

const buttonStyle = (active: boolean, activeColor = '#2563eb') => ({
  padding: '4px 12px',
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

export default function NavigationSelector() {
  const isMobile = useGallery((state) => state.isMobile)
  const currentMode = useGallery((state) => state.navigationMode)
  const setNavigationMode = useGallery((state) => state.setNavigationMode)
  const cameraView = useGallery((state) => state.cameraView)
  const setCameraView = useGallery((state) => state.setCameraView)

  const handleModeChange = (mode: 'orbit' | 'wasd') => {
    if (mode !== currentMode) {
      setNavigationMode(mode)
    }
  }

  if (isMobile) {
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
            style={buttonStyle(currentMode === 'orbit')}
          >
            <HugeiconsIcon icon={OrbitIcon} size={15} color="currentColor" strokeWidth={1.8} />
            Orbit
          </button>
          <button
            onClick={() => handleModeChange('wasd')}
            style={buttonStyle(currentMode === 'wasd')}
          >
            <HugeiconsIcon icon={KeyboardIcon} size={15} color="currentColor" strokeWidth={1.8} />
            WASD
          </button>
          {currentMode === 'wasd' && (
            <button
              onClick={() => setCameraView(cameraView === 'first' ? 'third' : 'first')}
              style={buttonStyle(cameraView === 'third', '#7c3aed')}
            >
              <HugeiconsIcon
                icon={cameraView === 'third' ? UserIcon : EyeIcon}
                size={15}
                color="currentColor"
                strokeWidth={1.8}
              />
              {cameraView === 'third' ? '3rd Person' : '1st Person'}
            </button>
          )}
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
          <div style={{
            color: 'white',
            fontSize: '14px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <HugeiconsIcon icon={KeyboardIcon} size={14} color="#9ca3af" strokeWidth={1.8} />
            Controls
          </div>
          <div style={{ color: '#d1d5db', fontSize: '12px' }}>
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
      )}
    </>
  )
}
