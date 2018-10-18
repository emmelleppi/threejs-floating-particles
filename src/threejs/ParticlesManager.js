import React from "react";
import * as THREE from "three"

import Particle from "./Particle"
import { NUM_OF_PARTICLES, SCALE_PARTICLES_VELOCITY } from "./utility/constants"


const deafultState = {
  color: 0xFFFFFF,
  numOfParticles: NUM_OF_PARTICLES,
  scaleVelocity: SCALE_PARTICLES_VELOCITY,
  cubeDimensions: new THREE.Vector3(0,0,0)
}

class ParticlesManager extends React.Component{
  constructor(props){
    super(props)
    const { numOfParticles, scaleVelocity, cubeDimensions, color, scaleFactor } = props
    this.state = {
      ...deafultState,
      numOfParticles,
      scaleVelocity,
      cubeDimensions,
      color,
      scaleFactor,
    }
    this.particles = []

    this.update = this.update.bind(this)
  }

  componentDidMount(){
    const { color, cubeDimensions, scaleVelocity, scaleFactor } = this.state
    
    for(let i = 0; i < this.state.numOfParticles; i++){
      const particle = new Particle({ color, cubeDimensions, scaleVelocity, scaleFactor })
      this.particles.push(particle)
      this.props.scene.add(particle.mesh)
    }
    this.props.addInUpdateProcess(this.update)
  }

  update(){
    for(let i = 0; i < this.particles.length; i++ ){
      this.particles[i].update(true)
    }
  }

  render(){
    return null
  }
}

export default ParticlesManager