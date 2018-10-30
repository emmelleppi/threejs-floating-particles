import * as THREE from "three"

import { randomInUnityRange } from './utility/general'
import { SCALE_POINT_LIGHT_VELOCITY, TRANSFORMATION_MATRICES } from './utility/constants'

const defaultState = {
  position: new THREE.Vector3(0,0,0),
  velocity: new THREE.Vector3(0,0,0),
  scaleVelocity: SCALE_POINT_LIGHT_VELOCITY,
  color: 0xFFFFFF,
  intensity: 1,
  radius: 1000,
  zFlat: false,
}

class PointLight {
  constructor(props){
    const { color, intensity, radius, zFlat, scaleVelocity, camera, frustum } = props
    this.state = {
      ...defaultState,
      color,
      scaleVelocity,
      intensity,
      radius,
      zFlat,
    }
    this.pointLight = null
    this.camera = camera
    this.frustum = frustum
    this.outOfTheFrustum = false

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
    console.log(this.pointLight);
    
  }

  initPosition(zFlat){
    return new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      zFlat ? 1 : ( 0.999 - Math.exp( -Math.random() * 20 ) * 0.01 )
    )
  }

  initVelocity(zFlat){
    return new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      zFlat ? 0 : randomInUnityRange()/1000
    ).multiplyScalar(this.state.scaleVelocity)
  }

  update(){
    const { position, velocity } = this.state
    const { x, y, z } = position
    
    if(!this.frustum.containsPoint( this.pointLight.position ) && !this.outOfTheFrustum){
      if (Math.abs(x) > 1.05) {
        velocity.reflect( x > 0 ? TRANSFORMATION_MATRICES.x_L : TRANSFORMATION_MATRICES.x_R )
        this.outOfTheFrustum = true
      }
      else if (Math.abs(y) > 1.05) {
        velocity.reflect( y > 0 ? TRANSFORMATION_MATRICES.y_L : TRANSFORMATION_MATRICES.y_R )
        this.outOfTheFrustum = true
      }
      else if (!this.state.zFlat){
        if (z >= 1) {
          velocity.reflect( TRANSFORMATION_MATRICES.z_L )
          this.outOfTheFrustum = true
        }
        else if (z <= 0.95) {
          velocity.reflect( TRANSFORMATION_MATRICES.z_R )
          this.outOfTheFrustum = true
        }
      }
    } else {
      this.outOfTheFrustum = false
    }
    position.add(velocity)
    this.updatePointLight()
  }

  updatePointLight(){
    const unprojPosition = this.state.position.clone()
    unprojPosition.unproject(this.camera)
    const { x, y, z } = unprojPosition
    this.pointLight.position.set(x, y, z)
  }

}

export default PointLight