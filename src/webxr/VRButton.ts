export class VRButton {
  private button: HTMLButtonElement
  private renderer: any

  constructor(renderer: any) {
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

  private async setupEventListeners() {
    // Check VR support
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

    // Add click handler
    this.button.addEventListener('click', this.onButtonClick.bind(this))

    // Update button state based on XR session
    this.renderer.xr.addEventListener('sessionstart', () => {
      this.button.textContent = 'Exit VR'
      this.button.style.backgroundColor = '#dc3545'
    })

    this.renderer.xr.addEventListener('sessionend', () => {
      this.button.textContent = 'Enter VR'
      this.button.style.backgroundColor = '#007bff'
    })
  }

  private async onButtonClick() {
    if (this.renderer.xr.isPresenting) {
      this.renderer.xr.getSession()?.end()
    } else {
      try {
        const session = await navigator.xr!.requestSession('immersive-vr', {
          requiredFeatures: ['viewer'],
          optionalFeatures: ['local-floor', 'bounded-floor']
        })
        this.renderer.xr.setSession(session)
      } catch (error) {
        console.error('Failed to start VR session:', error)
      }
    }
  }

  public dispose() {
    if (this.button.parentNode) {
      this.button.parentNode.removeChild(this.button)
    }
  }
}