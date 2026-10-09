import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'

const WIDTH = 256
const HEIGHT = 128

function drawLabel(canvas: HTMLCanvasElement, title: string, subtitle: string) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Title (shrink to fit)
  let titleSize = 44
  ctx.font = `700 ${titleSize}px "DM Sans", sans-serif`
  while (ctx.measureText(title).width > WIDTH - 16 && titleSize > 20) {
    titleSize -= 2
    ctx.font = `700 ${titleSize}px "DM Sans", sans-serif`
  }
  ctx.fillStyle = '#ffffff'
  ctx.fillText(title, WIDTH / 2, 44)

  // Subtitle (artist • year)
  let subSize = 28
  ctx.font = `400 ${subSize}px "DM Sans", sans-serif`
  while (ctx.measureText(subtitle).width > WIDTH - 16 && subSize > 14) {
    subSize -= 2
    ctx.font = `400 ${subSize}px "DM Sans", sans-serif`
  }
  ctx.fillStyle = '#cccccc'
  ctx.fillText(subtitle, WIDTH / 2, 92)
}

/**
 * Bakes the artwork title/artist into a canvas texture, replacing two troika
 * <Text> instances per artwork (32 total). The web font may not be parsed yet
 * on first draw, so it redraws once document.fonts.ready resolves.
 */
export function useLabelTexture(title: string, subtitle: string) {
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
    drawLabel(canvas, title, subtitle)
    texture.needsUpdate = true

    const fontPromise = document.fonts?.ready
    if (fontPromise) {
      fontPromise.then(() => {
        drawLabel(canvas, title, subtitle)
        texture.needsUpdate = true
      })
    }

    return () => texture.dispose()
  }, [texture, title, subtitle])

  return texture
}