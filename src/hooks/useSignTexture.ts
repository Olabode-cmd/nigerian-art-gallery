import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

// Matches the 6 x 2.2 sign board's aspect ratio
const WIDTH = 768
const HEIGHT = 282

const TITLE = 'Click on any artwork to learn more'
const CONTACTS = ['contact developer: olabodebalogun80@gmail.com', 'twitter: @theavatar_bode']

function drawSign(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Title — shrink to fit, matching the original 3D text layout
  let titleSize = 32
  ctx.font = `700 ${titleSize}px "DM Sans", sans-serif`
  while (ctx.measureText(TITLE).width > WIDTH - 64 && titleSize > 20) {
    titleSize -= 2
    ctx.font = `700 ${titleSize}px "DM Sans", sans-serif`
  }
  ctx.fillStyle = '#ffffff'
  ctx.fillText(TITLE, WIDTH / 2, 90)

  ctx.font = `400 19px "DM Sans", sans-serif`
  ctx.fillStyle = '#cccccc'
  CONTACTS.forEach((line, index) => {
    ctx.fillText(line, WIDTH / 2, 167 + index * 38)
  })
}

/**
 * Bakes the instruction sign's text into a canvas texture, replacing three
 * troika <Text> instances — nothing text-related loads on the critical path.
 */
export function useSignTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = WIDTH
    canvas.height = HEIGHT
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    return tex
  }, [])

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement
    drawSign(canvas)
    texture.needsUpdate = true

    // The web font may not be parsed yet on first draw — redraw once it is
    const fontPromise = document.fonts?.ready
    if (fontPromise) {
      fontPromise.then(() => {
        drawSign(canvas)
        texture.needsUpdate = true
      })
    }

    return () => texture.dispose()
  }, [texture])

  return texture
}
