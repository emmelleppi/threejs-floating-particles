import React from 'react'
import * as THREE from "three"

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
    const { color, intensity, angle, penumbra, decay } = props
    this.state = {
      ...defaultState,
      color,
      intensity,
      angle,
      penumbra,
      decay,
    }
    this.frontLight = null
  }

  componentDidMount(){
    const { color, intensity, angle, distance, penumbra, decay } = this.state
    this.frontLight = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay)
    const position = new THREE.Vector3(0, 0, 0).unproject(this.props.camera)
    const { x, y, z } = position
    this.frontLight.position.set(x, y, z) 
    this.frontLight.castShadow = true
    this.props.scene.add(this.frontLight)
  }

  render(){
    return null
  }
}

export default SpotLight