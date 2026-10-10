export type HairStyle = 'none' | 'short' | 'afro' | 'low'

export interface AvatarConfig {
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

export function loadAvatarConfig(): AvatarConfig {
  const config = { ...DEFAULT_AVATAR_CONFIG }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return config
    const saved = JSON.parse(raw) as Record<string, unknown>
    if (typeof saved.skin === 'string') config.skin = saved.skin
    if (typeof saved.hair === 'string') config.hair = saved.hair
    if (typeof saved.shirt === 'string') config.shirt = saved.shirt
    if (typeof saved.pants === 'string') config.pants = saved.pants
    if (
      typeof saved.hairStyle === 'string' &&
      HAIR_STYLES.some((style) => style.id === saved.hairStyle)
    ) {
      config.hairStyle = saved.hairStyle as HairStyle
    }
  } catch {
    // Corrupted or unavailable storage — fall back to the defaults
  }
  return config
}

export function saveAvatarConfig(config: AvatarConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Storage unavailable (private browsing) — the customization still
    // applies for this session
  }
}
