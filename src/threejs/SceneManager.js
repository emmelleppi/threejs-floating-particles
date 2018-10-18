import React from "react"
import * as THREE from "three"

import Listener from "./Listener";

import { onDocumentMouseMove } from "./utility/events"
import { CAMERA_TO_SCENE_DISTANCE_RATIO, CONTAINER_DEPTH, Z_BIAS } from "./utility/constants"

class SceneManager extends React.Component {

  constructor(props){
    super(props)

    const { innerWidth, innerHeight } = props.container
    this.state = {
      canvasKey: 0,
      innerWidth,
      innerHeight,
      scene: null
    }
    this.cubeDimensions = new THREE.Vector3(
      this.state.innerWidth,
      this.state.innerHeight,
      CONTAINER_DEPTH
    )
    this.cameraParams = {
      fov: 90,
      init: 1,
      end: (this.cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    }

    this.camera = null
    this.scene = null
    this.renderer = null
    this.canvas = null

    this.eventsHandler = new Listener(document)
    this.containerHandler = new Listener(window)
    this.renderProcess = []

    this.init = this.init.bind(this)
    this.createCamera = this.createCamera.bind(this)
    this.createScene = this.createScene.bind(this)
    this.createBackgroundWall = this.createBackgroundWall.bind(this)    
    this.resizeCanvas = this.resizeCanvas.bind(this)
    this.update = this.update.bind(this)
    this.addInUpdateProcess = this.addInUpdateProcess.bind(this)
  }

  componentDidMount() {    
    this.init()
    this.createCamera()
    this.createScene()
    this.createBackgroundWall()

    this.addInUpdateProcess(() => {
      this.renderer.render(this.scene, this.camera)
    })
    this.containerHandler.on('resize', this.onWindowResize)
    this.containerHandler.on('resize', this.resizeCanvas)

    this.update()
  }

  componentDidUpdate(){
    const { innerWidth, innerHeight } = this.state
    this.camera.aspect = innerWidth / innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize( innerWidth, innerHeight )
  }

  init(){
    const { x, y } = this.cubeDimensions

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.setPixelRatio(1)
    this.renderer.setSize( x, y, false )
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  resizeCanvas() {
    this.canvas.current.style.width = '100%'
    this.canvas.current.style.height= '100%'
    this.canvas.current.width = this.canvas.current.offsetWidth
    this.canvas.current.height = this.canvas.current.offsetHeight
  }

  createCamera(){
    const { innerWidth, innerHeight } = this.state
    const { x, y, z } = this.cubeDimensions

    const screenRatio = x / y
    
    this.camera = new THREE.PerspectiveCamera(
      this.cameraParams.fov,
      screenRatio,
      this.cameraParams.init,
      this.cameraParams.end,
    )
    
    this.camera.position.set( 0, 0, this.cameraParams.end )
    
    const onMouseMove = onDocumentMouseMove(innerWidth, innerHeight)
    this.eventsHandler.on('mousemove', e => this.handleCameraPositionOnMouseMove(onMouseMove(e)))
  }
  
  createScene(){
    const fog = {
      color: 0x004d5f,
      density: 0.000025
    }
    this.scene = new THREE.Scene()
    this.camera.lookAt( this.scene.position )
    this.scene.fog = new THREE.FogExp2(fog.color, fog.density)

    this.setState({
      scene: this.scene
    })
  }

  createBackgroundWall(){
    const { x, y } = this.cubeDimensions
    const scaleFactor = 2
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
      this.cameraParams.end
    )
    this.camera.updateMatrixWorld()
  }

  update() {               
    requestAnimationFrame(this.update, false)
    for(let i=0; i<this.renderProcess.length; i++){
      this.renderProcess[i]()
    }
  }

  addInUpdateProcess(fn){
    this.renderProcess.push(fn)
  }

  render(){  
    const { container } = this.props
    const { scene, canvasKey} = this.state
    
    return (
      <React.Fragment>
        <canvas 
          key={canvasKey}
          ref={element => this.canvas = element} 
        />
        {
          scene ?
          this.props.children({
            container,
            eventsHandler: this.eventsHandler,
            containerHandler: this.containerHandler,
            addInUpdateProcess: this.addInUpdateProcess,
            camera: this.camera,
            scene, 
            renderer: this.renderer,
            cubeDimensions: this.cubeDimensions,
          }) : null
        }
      </React.Fragment>
    )
  }
  
  // update() {
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