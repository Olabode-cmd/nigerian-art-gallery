import { WebGLRenderer, Scene, Group, Raycaster, Vector3, BufferGeometry, Line, LineBasicMaterial, Mesh } from 'three'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js'

export class WebXRManager {
  private renderer: WebGLRenderer
  private scene: Scene
  private controllers: Group[] = []
  private controllerGrips: Group[] = []
  private raycasters: Raycaster[] = []
  private lasers: Line[] = []
  private intersectables: Mesh[] = []
  private controllerModelFactory: XRControllerModelFactory
  private onArtworkSelect?: (mesh: Mesh) => void

  constructor(renderer: WebGLRenderer, scene: Scene) {
    this.renderer = renderer
    this.scene = scene
    this.controllerModelFactory = new XRControllerModelFactory()
    
    this.setupXR()
    this.createTestObjects()
  }

  private setupXR() {
    // Enable XR
    this.renderer.xr.enabled = true

    // Detect and setup controllers (up to 2)
    for (let i = 0; i < 2; i++) {
      this.setupController(i)
    }
  }

  private setupController(index: number) {
    // Controller input
    const controller = this.renderer.xr.getController(index)
    controller.addEventListener('selectstart', () => this.onSelectStart(index))
    controller.addEventListener('selectend', () => this.onSelectEnd(index))
    this.scene.add(controller)
    this.controllers[index] = controller

    // Controller grip (for model)
    const controllerGrip = this.renderer.xr.getControllerGrip(index)
    controllerGrip.add(this.controllerModelFactory.createControllerModel(controllerGrip))
    this.scene.add(controllerGrip)
    this.controllerGrips[index] = controllerGrip

    // Laser beam
    const laser = this.createLaser()
    controller.add(laser)
    this.lasers[index] = laser

    // Raycaster
    this.raycasters[index] = new Raycaster()
  }

  private createLaser(): Line {
    const geometry = new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(0, 0, -15)
    ])
    const material = new LineBasicMaterial({ color: 0x00ff00 })
    return new Line(geometry, material)
  }

  private createTestObjects() {
    // Test objects removed - artwork interaction handled separately
  }

  private onSelectStart(controllerIndex: number) {
    // Change laser color to purple when trigger pressed
    const laser = this.lasers[controllerIndex]
    if (laser) {
      ;(laser.material as LineBasicMaterial).color.setHex(0xff00ff)
    }
    
    // Check for artwork selection
    const raycaster = this.raycasters[controllerIndex]
    if (raycaster) {
      const intersects = raycaster.intersectObjects(this.intersectables)
      console.log(`Controller ${controllerIndex} intersects:`, intersects.length, 'objects')
      if (intersects.length > 0) {
        const mesh = intersects[0].object as Mesh
        console.log('Selected mesh userData:', mesh.userData)
        // Call the onSelect function stored in userData
        if (mesh.userData.onSelect) {
          console.log('Calling onSelect for artwork:', mesh.userData.artwork?.title)
          mesh.userData.onSelect()
        }
        // Also call the artwork select callback if available
        if (this.onArtworkSelect) {
          this.onArtworkSelect(mesh)
        }
      }
    }
  }

  private onSelectEnd(controllerIndex: number) {
    // Change laser color back to green when trigger released
    const laser = this.lasers[controllerIndex]
    if (laser) {
      ;(laser.material as LineBasicMaterial).color.setHex(0x00ff00)
    }
  }

  public update() {
    // Update raycasting for each active controller
    this.controllers.forEach((controller, index) => {
      if (controller && controller.visible) {
        this.updateRaycasting(controller, index)
      }
    })
  }

  private updateRaycasting(controller: Group, index: number) {
    const raycaster = this.raycasters[index]
    if (!raycaster) return

    // Set raycaster from controller position and direction
    const tempMatrix = controller.matrixWorld
    raycaster.ray.origin.setFromMatrixPosition(tempMatrix)
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix).sub(raycaster.ray.origin).normalize()
  }

  public getIntersectables(): Mesh[] {
    return this.intersectables
  }

  public addIntersectable(mesh: Mesh) {
    this.intersectables.push(mesh)
  }

  public setArtworkSelectCallback(callback: (mesh: Mesh) => void) {
    this.onArtworkSelect = callback
  }

  public dispose() {
    this.controllers.forEach(controller => {
      if (controller) {
        this.scene.remove(controller)
      }
    })
    this.controllerGrips.forEach(grip => {
      if (grip) {
        this.scene.remove(grip)
      }
    })
  }
}