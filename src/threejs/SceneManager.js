import React from "react"
import * as THREE from "three"
import { onDocumentMouseMove } from "./utility/events"
import { moveObjects } from "./utility/elementsInteraction"


const CAMERA_TO_SCENE_DISTANCE_RATIO = 1.01
const CONTAINER_DEPTH = 1500
const Z_BIAS = 2000

let particles = []
let lightPoints = []
let wallLightPoints = []

let materialDepth
let postprocessing = {}
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
    this.createScene = this.createScene.bind(this)
    this.createBackgroundWall = this.createBackgroundWall.bind(this)
  }

  componentDidMount(){
    this.props.containerHandler.on('resize', this.onWindowResize)
    this.init()
  }

  componentDidUpdate(){
    const { innerWidth, innerHeight } = this.state
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize( innerWidth, innerHeight )
  }

  init(){
    const { x, y } = this.cubeDimensions
    this.createCamera()
    this.createScene()
    this.createBackgroundWall()

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.setPixelRatio(1)
    this.renderer.setSize( x, y, false )
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  createCamera(){
    const { eventsHandler } = this.props
    const { innerWidth, innerHeight } = this.state
    const { x, y, z } = this.cubeDimensions

    const screenRatio = x / y
    
    this.camera = new THREE.PerspectiveCamera(
      this.cameraParams.fov,
      screenRatio,
      this.cameraParams.init,
      this.cameraParams.end,
    )
    
    this.camera.position.set( 0, 0, z + Z_BIAS )

    const onMouseMove = onDocumentMouseMove(innerWidth, innerHeight)
    eventsHandler.on('mousemove', e => handleCameraPositionOnMouseMove(onMouseMove(e)))
  }
  
  createScene(){
    const fog = {
      color: 0x004d5f,
      density: 0.0025
    }
    this.scene = new THREE.Scene()
    this.camera.lookAt( this.scene.position )
    this.scene.fog = new THREE.FogExp2(fog.color, fog.density)
  }

  createBackgroundWall(){
    const { x, y } = this.cubeDimensions
    const scaleFactor = 10
    const color = 0x33717f
    const groundGeometry = new THREE.PlaneBufferGeometry(
      x * scaleFactor,
      y * scaleFactor
    )
    const groundMaterial = new THREE.MeshPhongMaterial({
      color,
      dithering: true
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.position.set( 0, 0, 0 )
    ground.receiveShadow = true
    this.scene.add(ground)
  }

  onWindowResize(e) {
    const { innerWidth, innerHeight } = e.target
    this.setState({
      innerWidth,
      innerHeight,
    })
  }

  handleCameraPositionOnMouseMove(mouse) {
    const scaleX = 1 / 10
    const scaleY = 20
    this.camera.position.set(
      Math.atan(mouse.x * scaleX) * scaleY,
      Math.atan(-mouse.y * scaleX) * scaleY,
      (this.cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    )
    this.camera.updateMatrixWorld()
  }

  render(){
    return this.props.children({
      camera: this.camera,
      scene: this.scene, 
      renderer: this.renderer,
    });
  }
  
  // update() {
  //   moveObjects(particles)
  //   moveObjects(lightPoints)
  //   moveObjects(wallLightPoints, true)
  //   raycasterManager.handleRaycasterOnParticles()
  
  //   renderer.clear()
  //   renderer.render(scene, camera, postprocessing.rtTextureColor, true)
  //   scene.overrideMaterial = materialDepth
  //   renderer.render(scene, camera, postprocessing.rtTextureDepth, true)
  //   scene.overrideMaterial = null
  //   renderer.render(postprocessing.scene, postprocessing.camera)
  // }
}

export default SceneManager