import { useState } from 'react'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
} from '@hugeicons/core-free-icons'
import { useGallery } from '../store'
import { input } from '../input'

const BUTTON_SIZE = 56

interface PadButtonProps {
  arrowKey: string
  icon: IconSvgElement
  gridArea: string
  label: string
}

function PadButton({ arrowKey, icon, gridArea, label }: PadButtonProps) {
  const [held, setHeld] = useState(false)

  const press = () => {
    input.press(arrowKey)
    setHeld(true)
  }

  const release = () => {
    input.release(arrowKey)
    setHeld(false)
  }

  return (
    <button
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault()
        press()
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={release}
      onContextMenu={(event) => event.preventDefault()}
      style={{
        gridArea,
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        backgroundColor: held ? 'rgba(37, 99, 235, 0.9)' : 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <HugeiconsIcon icon={icon} size={22} color="currentColor" strokeWidth={2} />
    </button>
  )
}

/**
 * On-screen arrow pad for touch devices, mapping to the same arrow keys the
 * keyboard uses — up/down move, left/right turn — in every navigation mode.
 */
export default function TouchControls() {
  const isMobile = useGallery((state) => state.isMobile)
  if (!isMobile) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto)',
        gridTemplateRows: 'repeat(3, auto)',
        gap: '8px'
      }}
    >
      <PadButton arrowKey="arrowup" icon={ArrowUpIcon} gridArea="1 / 2" label="Move forward" />
      <PadButton arrowKey="arrowleft" icon={ArrowLeftIcon} gridArea="2 / 1" label="Turn left" />
      <PadButton arrowKey="arrowright" icon={ArrowRightIcon} gridArea="2 / 3" label="Turn right" />
      <PadButton arrowKey="arrowdown" icon={ArrowDownIcon} gridArea="3 / 2" label="Move backward" />
    </div>
  )
}
