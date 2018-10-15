import * as THREE from "three"
import { TweenMax, Expo } from "gsap"
import React from "react"
import ShaderManager from "./ShaderManager"
import LightsManager from "./LightsManager"
import ParticlesManager from "./ParticlesManager"
import RaycasterManager from "./RaycasterManager"
import Gui from "./Gui"

const CAMERA_TO_SCENE_DISTANCE_RATIO = 1.01
const CONTAINER_DEPTH = 1500
const Z_BIAS = 2000
const fog = {
  color: 0x004d5f,
  density: 0.0025
}


let camera, scene, renderer
let mouse = new THREE.Vector2()
let raycaster
let intersected = {
  object: null,
  currentHex: null,
  currentPosition: new THREE.Vector3(0, 0, 0),
  currentVertices: new THREE.Vector3(0, 0, 0),
}
let isParticleOpen = false

let particles = []
let lightPoints = []
let wallLightPoints = []

let materialDepth
let postprocessing = {}
let shaderSettings = {
  rings: 3,
  samples: 4
}
let effectController = {
  fstop: 2.2,
  maxblur: 1.0,
  focalDepth: 2.8,
  vignetting: false,
  depthblur: false,
  threshold: 0.5,
  gain: 2.0,
  bias: 0.5,
  fringe: 0.7,
  focalLength: 35,
  pentagon: false,
  dithering: 0.0001
}

let shaderManager
let lightsManager
let particlesManager
let raycasterManager

class SceneManager extends React.Component {

  constructor(props){
    super(props)

    const { canvas, innerWidth, innerHeight } = props
    this.state = {
      innerWidth,
      innerHeight,
    }

    this.canvas = canvas
    this.innerWidth = innerWidth
    this.innerHeight = innerHeight
    this.cubeDimensions = {
      x: this.state.innerWidth,
      y: this.state.innerHeight,
      z: CONTAINER_DEPTH
    }
    this.cameraParams = {
      fov: 45,
      init: 1,
      end: (this.cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    }
    this.camera = null
    this.scene = null
    this.renderer = null

    this.init = this.init.bind(this)
    this.createCamera = this.createCamera.bind(this)
    this.createBackgroundWall = this.createBackgroundWall.bind(this)
  }

  componentDidMount(){
    this.init()
  }

  componentDidUpdate(){
    const { innerWidth, innerHeight } = this.state
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize( innerWidth, innerHeight )
  }

  init(){
    this.createCamera()
    this.createBackgroundWall()

    const { x, y } = this.cubeDimensions
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas ,antialias: true })
    this.renderer.setPixelRatio(1)
    this.renderer.setSize( x, y, false )
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  createCamera(){
    const { x, y, z } = this.cubeDimensions
    const screenRatio = x / y
    this.camera = new THREE.PerspectiveCamera(
      this.cameraParams.fov,
      screenRatio,
      this.cameraParams.init,
      this.cameraParams.end,
    )
    this.camera.position.set( 0, 0, z + Z_BIAS )
    this.scene = new THREE.Scene()
    this.camera.lookAt( this.scene.position )
    this.scene.fog = new THREE.FogExp2(fog.color, fog.density)
  }
  
  createBackgroundWall(){
    const { x, y } = this.cubeDimensions 
    const groundGeometry = new THREE.PlaneBufferGeometry(
      x * 10,
      y * 10
    )
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x33717f,
      dithering: true
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.position.set( 0, 0, 0 )
    ground.receiveShadow = true
    this.scene.add(ground)
  }

  onDocumentMouseMove(event) {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
  }

  checkCollision(coords = [0, 0, 0], zFlat = false) {
    const { x, y, z } = coords
    const prospectiveScaling = zFlat ? z / 300 : 1 / 2
    if (Math.abs(x) > this.cubeDimensions.x * prospectiveScaling) {
      return x > 0 ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(1, 0, 0)
    }
    if (Math.abs(y) > this.cubeDimensions.y * prospectiveScaling) {
      return y > 0 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0)
    }
    if (!zFlat) {
      if (z - Z_BIAS > this.cubeDimensions.z / 2) {
        return new THREE.Vector3(0, 0, -1)
      }
      if (z - Z_BIAS <= 0) {
        return new THREE.Vector3(0, 0, 1)
      }
    }
    return null
  }
  
  moveObjects(array = [], zFlat = false) {
    for (let i = 0; i < array.length; i++) {
      const object = array[i]
      const reflectionVector = checkCollision(object.position, zFlat)
      if (reflectionVector) {
        object.vertices.reflect(reflectionVector)
      }
      const { x, y, z } = object.vertices
      object.position.x += x
      object.position.y += y
      object.position.z += z
    }
  }
  
  handleCameraPositionOnMouseMove() {
    const scaleX = 1 / 10
    const scaleY = 20
    camera.position.set(
      Math.atan(mouse.x * scaleX) * scaleY,
      Math.atan(-mouse.y * scaleX) * scaleY,
      (this.cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    )
    camera.updateMatrixWorld()
  }
  
  onDocumentMouseDown(event) {
    event.preventDefault()
    if (intersected.object) {
      let { object, currentPosition, currentVertices, currentHex } = intersected
      let { position, vertices } = object
  
      if (isParticleOpen) {
        TweenMax.to(position, 0.6, {
          x: currentPosition.x,
          y: currentPosition.y,
          z: currentPosition.z,
          ease: Expo.easeOut
        })
        vertices.x = currentVertices.x
        vertices.y = currentVertices.y
        vertices.z = currentVertices.z
  
        isParticleOpen = false
      } else {
        currentPosition.x = position.x
        currentPosition.y = position.y
        currentPosition.z = position.z
        currentVertices.x = vertices.x
        currentVertices.y = vertices.y
        currentVertices.z = vertices.z
  
        TweenMax.to(position, 0.6, {
          x: 0,
          y: 0,
          z: 3500,
          ease: Expo.easeIn
        })
        vertices.x = 0
        vertices.y = 0
        vertices.z = 0
        object.material.emissive.setHex(currentHex)
        isParticleOpen = true
      }
    }
  }
  
  update() {
    moveObjects(particles)
    moveObjects(lightPoints)
    moveObjects(wallLightPoints, true)
    handleCameraPositionOnMouseMove()
    raycasterManager.handleRaycasterOnParticles()
  
    renderer.clear()
    renderer.render(scene, camera, postprocessing.rtTextureColor, true)
    scene.overrideMaterial = materialDepth
    renderer.render(scene, camera, postprocessing.rtTextureDepth, true)
    scene.overrideMaterial = null
    renderer.render(postprocessing.scene, postprocessing.camera)
  }

  onWindowResize(innerWidth, innerHeight) {
    this.setState({
      innerWidth,
      innerHeight,
    })
  }

  render(){
    return this.props.children({
      camera: this.camera,
      scene: this.scene, 
      renderer: this.renderer,
      onWindowResize: this.onWindowResize,
    });
  }

}

export default SceneManager