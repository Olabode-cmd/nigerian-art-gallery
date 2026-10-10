import type { CSSProperties } from 'react'
import {
  HAIR_COLORS,
  HAIR_STYLES,
  PANTS_COLORS,
  SHIRT_COLORS,
  SKIN_TONES,
  type AvatarConfig,
} from '../avatarConfig'
import { useGallery } from '../store'

interface ColorOption {
  name: string
  value: string
}

function SwatchRow({
  colors,
  value,
  onSelect,
}: {
  colors: ColorOption[]
  value: string
  onSelect: (value: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {colors.map((color) => (
        <button
          key={color.value}
          aria-label={color.name}
          title={color.name}
          onClick={() => onSelect(color.value)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: color.value,
            outline: value === color.value ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.25)',
            outlineOffset: '2px'
          }}
        />
      ))}
    </div>
  )
}

const sectionLabel: CSSProperties = {
  color: '#9ca3af',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '8px'
}

const sectionSpacing: CSSProperties = {
  marginBottom: '16px'
}

export default function AvatarCustomizer() {
  const open = useGallery((state) => state.customizerOpen)
  const config = useGallery((state) => state.avatarConfig)
  const setAvatarConfig = useGallery((state) => state.setAvatarConfig)
  const setCustomizerOpen = useGallery((state) => state.setCustomizerOpen)

  if (!open) return null

  const setColor = (key: keyof Pick<AvatarConfig, 'skin' | 'hair' | 'shirt' | 'pants'>) => (value: string) =>
    setAvatarConfig({ [key]: value })

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '16px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
        borderRadius: '8px',
        padding: '16px',
        width: 'min(300px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}
      >
        <span style={{ color: 'white', fontSize: '14px' }}>Customize avatar</span>
        <button
          aria-label="Close"
          onClick={() => setCustomizerOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '18px',
            padding: 0,
            lineHeight: 1
          }}
        >
          ×
        </button>
      </div>

      <div style={sectionSpacing}>
        <div style={sectionLabel}>Skin tone</div>
        <SwatchRow colors={SKIN_TONES} value={config.skin} onSelect={setColor('skin')} />
      </div>

      <div style={sectionSpacing}>
        <div style={sectionLabel}>Hairstyle</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {HAIR_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setAvatarConfig({ hairStyle: style.id })}
              style={{
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: config.hairStyle === style.id ? '#2563eb' : '#4b5563',
                color: config.hairStyle === style.id ? 'white' : '#d1d5db'
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div style={sectionSpacing}>
        <div style={sectionLabel}>Hair color</div>
        <SwatchRow colors={HAIR_COLORS} value={config.hair} onSelect={setColor('hair')} />
      </div>

      <div style={sectionSpacing}>
        <div style={sectionLabel}>Shirt</div>
        <SwatchRow colors={SHIRT_COLORS} value={config.shirt} onSelect={setColor('shirt')} />
      </div>

      <div style={sectionSpacing}>
        <div style={sectionLabel}>Pants</div>
        <SwatchRow colors={PANTS_COLORS} value={config.pants} onSelect={setColor('pants')} />
      </div>

      <div style={{ color: '#6b7280', fontSize: '11px' }}>
        Switch to third person to see your changes live.
      </div>
    </div>
  )
}
