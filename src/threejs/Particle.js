import * as THREE from "three"

import { randomInUnityRange } from "./utility/general";
import { TRANSFORMATION_MATRICES, Z_BIAS, SCALE_PARTICLES_VELOCITY } from './utility/constants'

const defaultState = {
  position: new THREE.Vector3(0,0,0),
  velocity: new THREE.Vector3(0,0,0),
  color: 0xFFFFFF,
  emissive: 0x000000,
  radius: 5,
  segments: 16,
  scaleVelocity: SCALE_PARTICLES_VELOCITY,
}

const PROSPECTIVE_SCALING = 0.5

class Particle {
  constructor(props){
    const { color, cubeDimensions, scaleVelocity } = props
    this.state = {
      ...defaultState,
      color,
      scaleVelocity,
    }
    this.mesh = null
    this.cubeReference = null

    this.setCubeReference(cubeDimensions)
    this.create()

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.updateMesh = this.updateMesh.bind(this)
    this.setCubeReference = this.setCubeReference.bind(this)
  }

  create(){
    const { color, emissive, radius, segments } = this.state
    const { x, y, z } = this.cubeReference
    
    const material = new THREE.MeshLambertMaterial({
      color,
      emissive,
    })
    const geometry = new THREE.CircleGeometry(radius, segments)
    this.mesh = new THREE.Mesh(geometry, material)
    
    this.state.position = new THREE.Vector3(
      randomInUnityRange() * x,
      randomInUnityRange() * y,
      Math.random() * z + Z_BIAS
    )
    this.state.velocity = new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      randomInUnityRange()
    ).multiplyScalar(this.state.scaleVelocity)

    this.update()
  }

  update(updateMesh=true){
    const { position, velocity } = this.state
    const { x, y, z } = position
    const { x: xCube, y: yCube, z: zCube } = this.cubeReference
    
    if (Math.abs(x) > xCube) {
      velocity.reflect( x > 0 ? TRANSFORMATION_MATRICES.x_L : TRANSFORMATION_MATRICES.x_R )
    }
    else if (Math.abs(y) > yCube) {
      velocity.reflect( y > 0 ? TRANSFORMATION_MATRICES.y_L : TRANSFORMATION_MATRICES.y_L )
    }
    else if (z - Z_BIAS > zCube) {
      velocity.reflect( TRANSFORMATION_MATRICES.z_L )
    }
    else if (z - Z_BIAS <= 0) {
      velocity.reflect( TRANSFORMATION_MATRICES.z_R )
    }
    position.add(velocity)
    updateMesh && this.updateMesh()
  }

  updateMesh(){
    const { x, y, z } = this.state.position
    this.mesh.position.set(x, y, z)
  }

  setCubeReference(cubeDimensions){
    this.cubeReference = cubeDimensions.multiplyScalar(PROSPECTIVE_SCALING)
  }

}

export default Particle