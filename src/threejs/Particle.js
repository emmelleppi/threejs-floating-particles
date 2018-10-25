import * as THREE from "three"
import { TweenMax, Expo } from "gsap"

import { randomInUnityRange } from "./utility/general";
import { TRANSFORMATION_MATRICES, SCALE_PARTICLES_VELOCITY } from './utility/constants'

const defaultState = {
  position: new THREE.Vector3(0,0,0),
  currentPosition: new THREE.Vector3(0,0,0),
  velocity: new THREE.Vector3(0,0,0),
  scaleFactor: new THREE.Vector3(0,0,0),
  color: 0xFFFFFF,
  emissive: 0x000000,
  radius: 5,
  segments: 32,
  scaleVelocity: SCALE_PARTICLES_VELOCITY,
}

class Particle {
  constructor(props){
    const { color, scaleVelocity, scaleFactor, camera, frustum } = props
    this.state = {
      ...defaultState,
      color,
      scaleVelocity,
      scaleFactor,
    }
    this.mesh = null
    this.id = null
    this.updateFlag = true
    this.camera = camera
    this.frustum = frustum

    this.create()
    
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.updateMesh = this.updateMesh.bind(this)
    this.startMovement = this.startMovement.bind(this)
    this.stopMovement = this.stopMovement.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  create(){
    const { color, emissive, radius, segments } = this.state
    
    const material = new THREE.MeshLambertMaterial({
      color,
      emissive,
    })
    const geometry = new THREE.CircleGeometry(radius, segments)
    this.mesh = new THREE.Mesh(geometry, material)
    this.id = this.mesh.uuid

    this.state.position = new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      ( 0.9999 - Math.exp( -Math.random() * 20 / 1 ) * 0.01 )
    )
   
    this.state.velocity = new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      randomInUnityRange()/1000
    ).multiplyScalar(this.state.scaleVelocity)

    this.update()
  }

  update(){    
    const { position, velocity } = this.state
    const { x, y, z } = position    
    
    if(!this.frustum.intersectsObject( this.mesh )){
      if (Math.abs(x) > 1.05) {
        velocity.reflect( x > 0 ? TRANSFORMATION_MATRICES.x_L : TRANSFORMATION_MATRICES.x_R )
      }
      else if (Math.abs(y) > 1.05) {
        velocity.reflect( y > 0 ? TRANSFORMATION_MATRICES.y_L : TRANSFORMATION_MATRICES.y_R )
      }
      else if (z > 0.999) {
        velocity.reflect( TRANSFORMATION_MATRICES.z_L )
      }
      else if (z <= 0.98) {
        velocity.reflect( TRANSFORMATION_MATRICES.z_R )
      }
    }
    this.updateFlag && position.add(velocity)
    this.updateMesh()
  }

  updateMesh(){
    const unprojPosition = this.state.position.clone()
    unprojPosition.unproject(this.camera)
    const { x, y, z } = unprojPosition
    this.mesh.position.set(x, y, z)
  }

  stopMovement(){
    this.updateFlag = false
  }

  startMovement(){
    this.updateFlag = true
  }

  onClick(){
    if (!this.updateFlag) {
      TweenMax.to(this.state.position, 0.6, {
        x: this.state.currentPosition.x,
        y: this.state.currentPosition.y,
        z: this.state.currentPosition.z,
        ease: Expo.easeOut
      })
      this.startMovement()
    } else {
      this.state.currentPosition = this.state.position.clone()
      
      TweenMax.to(this.state.position, 0.6, {
        z: 0.96,
        ease: Expo.easeIn
      })
      this.stopMovement()
    }
  }

}

export default Particle