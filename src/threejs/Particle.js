import React from "react"

const defaultState = {
  position: {
    x: 0,
    y: 0,
    z: 0,
  },
  vertices: {
    x: 0,
    y: 0,
    z: 0,
  },
  color: 0xFFFFFF,
}

class Particle extends React.Component{
  constructor(props){
    super(props)
    const { position, vertices, color } = props
    this.state = {
      ...defaultState,
      position,
      vertices,
      color,
    }
    
  }

  componentDidMount(){
    const material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x000000
    })
    const geometry = new THREE.CircleGeometry(5, 32)
    const circle = new THREE.Mesh(geometry, material)
    circle.position.x = (randomInUnityRange() * cubeDimensions.x) / 2
    circle.position.y = (randomInUnityRange() * cubeDimensions.y) / 2
    circle.position.z = Z_BIAS + Math.random() * cubeDimensions.z
    circle.vertices = new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      randomInUnityRange()
    ).multiplyScalar(SCALE_PARTICLES_VERTICES)
    scene.add(circle)
  }

  render(){

  }
}

export default Particle