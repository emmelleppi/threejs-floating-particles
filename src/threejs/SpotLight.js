import React from 'react'
import * as THREE from "three"

import { Z_BIAS, CAMERA_TO_SCENE_DISTANCE_RATIO } from './utility/constants'

const defaultState = {
  color : 0xFFFFFF,
  intensity : 1,
  distance : 0,
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
    this.frontLight = new THREE.SpotLight({ ...this.state })
    this.frontLight.position.set(
      0,
      0,
      (this.cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO,
    )
    this.frontLight.castShadow = true
    this.props.scene.add(this.frontLight)
  }

  render(){
    return null
  }
}

export default SpotLight