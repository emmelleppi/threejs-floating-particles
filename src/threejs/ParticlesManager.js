import React from "react";
import Worker from 'worker-loader!./particleWebWorker.js';

import Particle from "./Particle"
import { NUM_OF_PARTICLES, SCALE_PARTICLES_VELOCITY, MAX_NUMBER_OF_OPEN_PARICLES } from "./utility/constants"

const deafultState = {
  color: 0xFFFFFF,
  numOfParticles: NUM_OF_PARTICLES,
  scaleVelocity: SCALE_PARTICLES_VELOCITY,
}

class ParticlesManager extends React.Component{
  constructor(props){
    super(props)
    const { numOfParticles, scaleVelocity, color, scaleFactor, camera, fakeCamera, frustum } = props    
    this.state = {
      ...deafultState,
      numOfParticles,
      scaleVelocity,
      color,
      scaleFactor,
    }
    this.particles = []
    this.particlesMesh = []
    this.clickedParticles = []
    this.camera = camera
    this.fakeCamera = fakeCamera
    this.frustum = frustum

    this.particlesWorker = new Worker()
    this.particlesWorker.addEventListener(
      'message', 
      e => console.log(e), 
      false
    )
    this.particlesWorker.postMessage({ ciao: 'diocane' })

    this.intersected = {
      object: null,
      currentHex: null,
    }
    this.isParticleOpen = false

    this.update = this.update.bind(this)
    this.handleRaycasterOnParticles = this.handleRaycasterOnParticles.bind(this)
    this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this)
  }

  componentDidMount(){    
    const { color,  scaleVelocity, scaleFactor } = this.state
    
    for(let i = 0; i < this.state.numOfParticles; i++){
      const particle = new Particle({ 
        color, 
        scaleVelocity, 
        scaleFactor, 
        camera: this.camera, 
        frustum: this.frustum, 
        fakeCamera: this.fakeCamera,
        worker: this.particlesWorker,
      })
      this.particles.push(particle)
      this.particlesMesh.push(particle.mesh)
      this.props.scene.add(particle.mesh)
    }
    this.props.addInUpdateProcess(this.update)
    this.props.addInUpdateProcess(this.handleRaycasterOnParticles)
    this.props.eventsHandler.on('mousedown',this.onDocumentMouseDown)
  }

  update(){    
    for(let i = 0; i < this.particles.length; i++ ){
      this.particles[i].update()
    }
  }

  handleRaycasterOnParticles() {
    const { raycast } = this.props    
    if (!this.isParticleOpen && raycast) {
      const intersects = this.props.raycast(this.particlesMesh)
      if (intersects.length > 0) {
        if (this.intersected.object !== intersects[0].object) {
          if (this.intersected.object) {
            let { object, currentHex } = this.intersected
            object.material.emissive.setHex(currentHex)
          }
          this.intersected.object = intersects[0].object
          let { object, currentHex } = this.intersected
          currentHex = object.material.emissive.getHex()
          object.material.emissive.setHex(0x222222)
        }
      } else {
        if (this.intersected.object) {
          let { object, currentHex } = this.intersected
          object.material.emissive.setHex(currentHex)
        }
        this.intersected.object = null
      }
    }
  }

  onDocumentMouseDown(event) {
    event.preventDefault()
    
    if (this.intersected.object) {
      let { object } = this.intersected
      const particle = this.particles.find( particle => particle.id === object.uuid )      
      if(particle){
        particle.onClick()        
        const index = this.clickedParticles.findIndex( item => item.id === particle.id )        
        if(index >= 0){
          this.clickedParticles.splice(index, 1)
        } else {
          this.clickedParticles.push(particle)
          if(this.clickedParticles.length > MAX_NUMBER_OF_OPEN_PARICLES){
            const removed = this.clickedParticles.shift()
            removed.onClick()
          }
        }
      }
    }
  }

  render(){
    return null
  }
}

export default ParticlesManager