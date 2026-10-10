// One-off: converts room textures and artwork images to WebP to cut the
// initial download for users on slow connections. Run: bun run scripts/convert-webp.mjs
import sharp from 'sharp'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOM_TEXTURES = [
  'public/models/floor_textures/textures/wood_floor_diff_2k.jpg',
  'public/models/stone_tile_wall/textures/stone_tile_wall_diff_1k.jpg',
  'public/models/marble_textures/textures/marble_mosaic_tiles_diff_1k.jpg',
  'public/models/ceiling_textures/textures/ceiling_interior_diff_1k.jpg',
]

const ARTWORK_QUALITY = 85
const TEXTURE_QUALITY = 82

async function convert(file, quality) {
  const out = file.replace(/\.jpg$/, '.webp')
  await sharp(file).webp({ quality }).toFile(out)
  console.log(`${file} → ${out}`)
}

for (const file of ROOM_TEXTURES) {
  await convert(file, TEXTURE_QUALITY)
}

const artworkDir = 'public/images'
for (const file of readdirSync(artworkDir)) {
  if (file.endsWith('.jpg')) {
    await convert(join(artworkDir, file), ARTWORK_QUALITY)
  }
}
