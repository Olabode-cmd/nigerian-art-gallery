import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { WebGLRenderer } from 'three'
import { HugeiconsIcon } from '@hugeicons/react'
import { VirtualRealityVr01Icon } from '@hugeicons/core-free-icons'

export class VRButton {
  private button: HTMLButtonElement
  private textSpan!: HTMLSpanElement
  private iconRoot: Root | null = null
  private renderer: WebGLRenderer

  constructor(renderer: WebGLRenderer) {
    this.renderer = renderer
    this.button = this.createButton()
    this.setupEventListeners()
  }

  private createButton(): HTMLButtonElement {
    const button = document.createElement('button')
    button.style.cssText = `
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 1001;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
      font-family: Arial, sans-serif;
    `

    const iconSpan = document.createElement('span')
    iconSpan.style.display = 'flex'

    this.textSpan = document.createElement('span')
    this.textSpan.textContent = 'Enter VR'

    button.append(iconSpan, this.textSpan)
    document.body.appendChild(button)

    this.iconRoot = createRoot(iconSpan)
    this.iconRoot.render(
      createElement(HugeiconsIcon, {
        icon: VirtualRealityVr01Icon,
        size: 16,
        color: 'white',
        strokeWidth: 1.8
      })
    )

    return button
  }

  private setText(text: string) {
    this.textSpan.textContent = text
  }

  private onButtonClick = () => {
    if (this.renderer.xr.isPresenting) {
      this.renderer.xr.getSession()?.end()
    } else {
      this.requestSession()
    }
  }

  private onSessionStart = () => {
    this.setText('Exit VR')
    this.button.style.backgroundColor = '#dc3545'
  }

  private onSessionEnd = () => {
    this.setText('Enter VR')
    this.button.style.backgroundColor = '#007bff'
  }

  private async setupEventListeners() {
    if (!navigator.xr) {
      this.button.style.display = 'none'
      return
    }

    try {
      const supported = await navigator.xr.isSessionSupported('immersive-vr')
      if (!supported) {
        this.button.style.display = 'none'
        return
      }
    } catch {
      this.button.style.display = 'none'
      return
    }

    this.button.addEventListener('click', this.onButtonClick)
    this.renderer.xr.addEventListener('sessionstart', this.onSessionStart)
    this.renderer.xr.addEventListener('sessionend', this.onSessionEnd)
  }

  private async requestSession() {
    if (!navigator.xr) return

    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['viewer'],
        optionalFeatures: ['local-floor', 'bounded-floor']
      })
      this.renderer.xr.setSession(session)
    } catch (error) {
      console.error('Failed to start VR session:', error)
    }
  }

  public dispose() {
    this.button.removeEventListener('click', this.onButtonClick)
    this.renderer.xr.removeEventListener('sessionstart', this.onSessionStart)
    this.renderer.xr.removeEventListener('sessionend', this.onSessionEnd)
    this.iconRoot?.unmount()
    this.iconRoot = null
    if (this.button.parentNode) {
      this.button.parentNode.removeChild(this.button)
    }
  }
}
