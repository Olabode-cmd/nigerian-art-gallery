import type { WebGLRenderer } from 'three'

export class VRButton {
  private button: HTMLButtonElement
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
    button.textContent = 'Enter VR'
    document.body.appendChild(button)
    return button
  }

  private onButtonClick = () => {
    if (this.renderer.xr.isPresenting) {
      this.renderer.xr.getSession()?.end()
    } else {
      this.requestSession()
    }
  }

  private onSessionStart = () => {
    this.button.textContent = 'Exit VR'
    this.button.style.backgroundColor = '#dc3545'
  }

  private onSessionEnd = () => {
    this.button.textContent = 'Enter VR'
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
    if (this.button.parentNode) {
      this.button.parentNode.removeChild(this.button)
    }
  }
}
