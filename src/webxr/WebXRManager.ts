import { WebGLRenderer, Scene, Group, Raycaster, Vector3, BufferGeometry, Line, LineBasicMaterial, Mesh, BoxGeometry, MeshBasicMaterial } from 'three'
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
      new Vector3(0, 0, -5)
    ])
    const material = new LineBasicMaterial({ color: 0xff0000 })
    return new Line(geometry, material)
  }

  private createTestObjects() {
    // Create sample cubes that change color when hit
    const positions = [
      [-2, 1.5, -3],
      [0, 1.5, -3],
      [2, 1.5, -3]
    ]

    positions.forEach(pos => {
      const geometry = new BoxGeometry(0.5, 0.5, 0.5)
      const material = new MeshBasicMaterial({ color: 0x00ff00 })
      const cube = new Mesh(geometry, material)
      cube.position.set(pos[0], pos[1], pos[2])
      cube.userData = { originalColor: 0x00ff00, isHit: false }
      this.scene.add(cube)
      this.intersectables.push(cube)
    })
  }

  private onSelectStart(controllerIndex: number) {
    // Change laser color to blue when trigger pressed
    const laser = this.lasers[controllerIndex]
    if (laser) {
      ;(laser.material as LineBasicMaterial).color.setHex(0x0000ff)
    }
  }

  private onSelectEnd(controllerIndex: number) {
    // Change laser color back to red when trigger released
    const laser = this.lasers[controllerIndex]
    if (laser) {
      ;(laser.material as LineBasicMaterial).color.setHex(0xff0000)
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

    // Check intersections
    const intersects = raycaster.intersectObjects(this.intersectables)
    
    // Reset all objects to original color
    this.intersectables.forEach(obj => {
      if (obj.userData.isHit) {
        ;(obj.material as MeshBasicMaterial).color.setHex(obj.userData.originalColor)
        obj.userData.isHit = false
      }
    })

    // Highlight intersected object
    if (intersects.length > 0) {
      const intersected = intersects[0].object as Mesh
      ;(intersected.material as MeshBasicMaterial).color.setHex(0xffff00)
      intersected.userData.isHit = true
    }
  }

  public getIntersectables(): Mesh[] {
    return this.intersectables
  }

  public addIntersectable(mesh: Mesh) {
    this.intersectables.push(mesh)
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