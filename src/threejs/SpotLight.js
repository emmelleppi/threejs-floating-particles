import React from 'react'
import * as THREE from "three"

import { Z_BIAS, CAMERA_TO_SCENE_DISTANCE_RATIO } from './utility/constants'

const defaultState = {
  color : 0xFFFFFF,
  intensity : 1,
  distance : 1000,
  angle : 0,
  penumbra : 0,
  decay : 0,
}

class SpotLight extends React.Component {
  constructor(props){
    super(props)
    const { color, intensity, angle, penumbra, decay, cubeDimensions } = props
    this.state = {
      ...defaultState,
      color,
      intensity,
      angle,
      penumbra,
      decay,
    }
    this.cubeDimensions = cubeDimensions
    this.frontLight = null
  }

  componentDidMount(){
    const { color, intensity, angle, distance, penumbra, decay } = this.state
    this.frontLight = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay)
    this.frontLight.position.set(
      0,
      0,
      (this.cubeDimensions.z + Z_BIAS) * 1.1 ,
    )    
    this.frontLight.castShadow = true
    this.props.scene.add(this.frontLight)
  }

  render(){
    return null
  }
}

export default SpotLight