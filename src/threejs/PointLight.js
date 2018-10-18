import * as THREE from "three"

import { randomInUnityRange } from './utility/general'
import { SCALE_POINT_LIGHT_VELOCITY, TRANSFORMATION_MATRICES, Z_BIAS } from './utility/constants'

const defaultState = {
  position: new THREE.Vector3(0,0,0),
  velocity: new THREE.Vector3(0,0,0),
  scaleFactor: new THREE.Vector3(1,1,1),
  scaleVelocity: SCALE_POINT_LIGHT_VELOCITY,
  color: 0xFFFFFF,
  intensity: 1,
  radius: 1000,
  zFlat: false,
}

class PointLight {
  constructor(props){
    const { color, cubeDimensions, scaleFactor, intensity, radius, zFlat, scaleVelocity } = props
    this.state = {
      ...defaultState,
      color,
      scaleFactor,
      scaleVelocity,
      intensity,
      radius,
      zFlat,
    }
    this.pointLight = null
    this.cubeReference = null

    this.setCubeReference(cubeDimensions)
    this.create()

    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.updatePointLight = this.updatePointLight.bind(this)
    this.initPosition = this.initPosition.bind(this)
    this.initVelocity = this.initVelocity.bind(this)
  }

  create(){
    const { color, intensity, radius } = this.state    
    this.pointLight = new THREE.PointLight(color, intensity, radius, 1)
    this.state.position = this.initPosition(this.state.zFlat)
    this.state.velocity = this.initVelocity(this.state.zFlat)
    this.update()
  }

  initPosition(zFlat){
    const { x, y, z } = this.cubeReference
    return new THREE.Vector3(
      randomInUnityRange() * x,
      randomInUnityRange() * y,
      zFlat ? Z_BIAS : Math.random() * z + Z_BIAS
    ).multiply(this.state.scaleFactor)
  }

  initVelocity(zFlat){
    return new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      zFlat ? 0 : randomInUnityRange()
    ).multiplyScalar(this.state.scaleVelocity)
  }

  update(updatePointLight=true){
    const { position, velocity } = this.state
    const { x, y, z } = position
    const { x: xCube, y: yCube, z: zCube } = this.cubeReference
    
    if (Math.abs(x) > xCube) {
      velocity.reflect( x > 0 ? TRANSFORMATION_MATRICES.x_L : TRANSFORMATION_MATRICES.x_R )
    }
    else if (Math.abs(y) > yCube) {
      velocity.reflect( y > 0 ? TRANSFORMATION_MATRICES.y_L : TRANSFORMATION_MATRICES.y_R )
    }
    else if (!this.state.zFlat){
      if (z - Z_BIAS > zCube) {
        velocity.reflect( TRANSFORMATION_MATRICES.z_L )
      }
      else if (z - Z_BIAS <= 0) {
        velocity.reflect( TRANSFORMATION_MATRICES.z_R )
      }
    }
    position.add(velocity)
    updatePointLight && this.updatePointLight()
  }

  updatePointLight(){
    const { x, y, z } = this.state.position    
    this.pointLight.position.set(x, y, z)
  }

  setCubeReference(cubeDimensions){
    const cube = cubeDimensions.clone()
    this.cubeReference = cube.multiply(this.state.scaleFactor)
  }
}

export default PointLight