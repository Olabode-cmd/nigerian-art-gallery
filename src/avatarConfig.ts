export type HairStyle = 'none' | 'short' | 'afro' | 'low'

// Type alias (not interface) so it's assignable to Trystero's JsonValue payloads
export type AvatarConfig = {
  skin: string
  hair: string
  hairStyle: HairStyle
  shirt: string
  pants: string
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skin: '#e8c9a0',
  hair: '#15110e',
  hairStyle: 'short',
  shirt: '#1e3a5f',
  pants: '#20242e',
}

export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: 'none', label: 'Bald' },
  { id: 'short', label: 'Short' },
  { id: 'afro', label: 'Afro' },
  { id: 'low', label: 'Low fade' },
]

export const SKIN_TONES = [
  { name: 'Ivory', value: '#f6d7bd' },
  { name: 'Sand', value: '#e8c9a0' },
  { name: 'Honey', value: '#d9a97e' },
  { name: 'Amber', value: '#c98d5e' },
  { name: 'Bronze', value: '#a9714b' },
  { name: 'Caramel', value: '#8d5524' },
  { name: 'Chestnut', value: '#6a3f1d' },
  { name: 'Espresso', value: '#45291a' },
]

export const HAIR_COLORS = [
  { name: 'Black', value: '#15110e' },
  { name: 'Dark brown', value: '#33241a' },
  { name: 'Brown', value: '#5c4426' },
  { name: 'Auburn', value: '#7b3b1e' },
  { name: 'Blonde', value: '#c9a86a' },
  { name: 'Gray', value: '#9e9e9e' },
]

export const SHIRT_COLORS = [
  { name: 'Navy', value: '#1e3a5f' },
  { name: 'White', value: '#f4f4f4' },
  { name: 'Black', value: '#17171a' },
  { name: 'Green', value: '#1f8a4c' },
  { name: 'Red', value: '#b23a3a' },
  { name: 'Gold', value: '#d4a017' },
  { name: 'Sky', value: '#5b8ac6' },
  { name: 'Purple', value: '#7c3aed' },
]

export const PANTS_COLORS = [
  { name: 'Charcoal', value: '#20242e' },
  { name: 'Black', value: '#101014' },
  { name: 'Denim', value: '#3b5b7d' },
  { name: 'Khaki', value: '#b3a07a' },
  { name: 'Gray', value: '#55565e' },
  { name: 'White', value: '#e8e8e8' },
]

const STORAGE_KEY = 'avatarConfig'
const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/

/** Validates an unknown value (localStorage or a remote peer) into a safe config */
export function sanitizeAvatarConfig(raw: unknown): AvatarConfig {
  const config = { ...DEFAULT_AVATAR_CONFIG }
  if (typeof raw !== 'object' || raw === null) return config
  const values = raw as Record<string, unknown>
  const pickColor = (key: 'skin' | 'hair' | 'shirt' | 'pants') => {
    const value = values[key]
    if (typeof value === 'string' && HEX_COLOR.test(value)) config[key] = value
  }
  pickColor('skin')
  pickColor('hair')
  pickColor('shirt')
  pickColor('pants')
  if (
    typeof values.hairStyle === 'string' &&
    HAIR_STYLES.some((style) => style.id === values.hairStyle)
  ) {
    config.hairStyle = values.hairStyle as HairStyle
  }
  return config
}

export function loadAvatarConfig(): AvatarConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_AVATAR_CONFIG }
    return sanitizeAvatarConfig(JSON.parse(raw))
  } catch {
    // Corrupted or unavailable storage — fall back to the defaults
    return { ...DEFAULT_AVATAR_CONFIG }
  }
}

export function saveAvatarConfig(config: AvatarConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Storage unavailable (private browsing) — the customization still
    // applies for this session
  }
}
