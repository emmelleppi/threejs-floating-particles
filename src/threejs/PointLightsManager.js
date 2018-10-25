import React from 'react'
import * as THREE from "three"

import PointLight from "./PointLight";
import { SCALE_PARTICLES_VELOCITY } from "./utility/constants"

const deafultState = {
  scaleFactor: new THREE.Vector3(1,1,1),
  scaleVelocity: SCALE_PARTICLES_VELOCITY,
  colors: [],
  intensity: 1,
  radius: 1000,
  zFlat: false,
}

class PointLightsManager extends React.Component {
  constructor(props){
    super(props)
    const { scaleFactor, scaleVelocity, colors, intensity, radius, zFlat, frustum, camera } = props
    this.state = {
      ...deafultState,
      scaleFactor,
      scaleVelocity,
      intensity,
      radius,
      zFlat,
    }
    this.colors = colors || []
    this.lights = []
    this.camera = camera
    this.frustum = frustum

    this.update = this.update.bind(this)
  }

  componentDidMount(){
    for(let i = 0; i < this.colors.length; i++){
      const pointLight =  new PointLight({ ...this.state, color: this.colors[i], camera: this.camera, frustum: this.frustum  })
      this.lights.push(pointLight)
      this.props.scene.add(pointLight.pointLight)
    }
    this.props.addInUpdateProcess(this.update)
  }

  update(){
    for(let i = 0; i < this.lights.length; i++ ){
      this.lights[i].update(true)
    }
  }

  render(){
    return null
  }
}

export default PointLightsManager