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

  constructor(renderer: WebGLRenderer, scene: Scene) {
    this.renderer = renderer
    this.scene = scene
    this.controllerModelFactory = new XRControllerModelFactory()

    this.setupXR()
  }

  private setupXR() {
    this.renderer.xr.enabled = true
    for (let i = 0; i < 2; i++) {
      this.setupController(i)
    }
  }

  private setupController(index: number) {
    const controller = this.renderer.xr.getController(index)
    controller.addEventListener('selectstart', () => this.onSelectStart(index))
    controller.addEventListener('selectend', () => this.onSelectEnd(index))
    this.scene.add(controller)
    this.controllers[index] = controller

    const controllerGrip = this.renderer.xr.getControllerGrip(index)
    controllerGrip.add(this.controllerModelFactory.createControllerModel(controllerGrip))
    this.scene.add(controllerGrip)
    this.controllerGrips[index] = controllerGrip

    const laser = this.createLaser()
    controller.add(laser)
    this.lasers[index] = laser
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

  private onSelectStart(controllerIndex: number) {
    const laser = this.lasers[controllerIndex]
    if (laser) {
      ;(laser.material as LineBasicMaterial).color.setHex(0xff00ff)
    }

    const raycaster = this.raycasters[controllerIndex]
    if (raycaster) {
      const intersects = raycaster.intersectObjects(this.intersectables)
      if (intersects.length > 0) {
        const mesh = intersects[0].object as Mesh
        if (mesh.userData.onSelect) {
          mesh.userData.onSelect()
        }
      }
    }
  }

  private onSelectEnd(controllerIndex: number) {
    const laser = this.lasers[controllerIndex]
    if (laser) {
      ;(laser.material as LineBasicMaterial).color.setHex(0x00ff00)
    }
  }

  public update() {
    this.controllers.forEach((controller, index) => {
      if (controller && controller.visible) {
        this.updateRaycasting(controller, index)
      }
    })
  }

  private updateRaycasting(controller: Group, index: number) {
    const raycaster = this.raycasters[index]
    if (!raycaster) return

    const tempMatrix = controller.matrixWorld
    raycaster.ray.origin.setFromMatrixPosition(tempMatrix)
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix).sub(raycaster.ray.origin).normalize()
  }

  public addIntersectable(mesh: Mesh) {
    if (!this.intersectables.includes(mesh)) {
      this.intersectables.push(mesh)
    }
  }

  public removeIntersectable(mesh: Mesh) {
    const index = this.intersectables.indexOf(mesh)
    if (index !== -1) {
      this.intersectables.splice(index, 1)
    }
  }

  public dispose() {
    this.controllers.forEach((controller) => {
      if (controller) {
        this.scene.remove(controller)
      }
    })
    this.controllerGrips.forEach((grip) => {
      if (grip) {
        this.scene.remove(grip)
      }
    })
    this.controllers = []
    this.controllerGrips = []
    this.lasers = []
    this.raycasters = []
    this.intersectables = []
  }
}
