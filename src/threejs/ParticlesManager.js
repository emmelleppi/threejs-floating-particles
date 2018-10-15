import * as THREE from "three"
import { randomInUnityRange } from "./utility/general"

const NUM_OF_PARTICLES = 2000
const SCALE_PARTICLES_VERTICES = 0.1


export default ({
  cubeDimensions,
  Z_BIAS,
  scene,
  particles,
}) => {

  function createParticles(){
    for (let i = 0; i < NUM_OF_PARTICLES; i++) {
      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 0x000000
      })
      const geometry = new THREE.CircleGeometry(5, 32)
      const circle = new THREE.Mesh(geometry, material)
      circle.position.x = (randomInUnityRange() * cubeDimensions.x) / 2
      circle.position.y = (randomInUnityRange() * cubeDimensions.y) / 2
      circle.position.z = Z_BIAS + Math.random() * cubeDimensions.z
      circle.vertices = new THREE.Vector3(
        randomInUnityRange(),
        randomInUnityRange(),
        randomInUnityRange()
      ).multiplyScalar(SCALE_PARTICLES_VERTICES)
      scene.add(circle)
      particles.push(circle)
    }
  }

  return {
    createParticles
  }

}

