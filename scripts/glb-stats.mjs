// One-off diagnostic: print triangle counts for the GLB models
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const loader = new GLTFLoader()

for (const file of process.argv.slice(2)) {
  const data = readFileSync(file)
  const buffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  loader.parse(
    buffer,
    '',
    (gltf) => {
      let tris = 0
      let meshes = 0
      gltf.scene.traverse((o) => {
        if (o.isMesh) {
          meshes++
          const g = o.geometry
          if (g.index) tris += g.index.count / 3
          else if (g.attributes.position) tris += g.attributes.position.count / 3
        }
      })
      console.log(
        `${path.basename(file)}: ${meshes} meshes, ${Math.round(tris)} triangles`
      )
    },
    (err) => console.error(`${file}: ${err.message}`)
  )
}