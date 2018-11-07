import React from "react"
import * as THREE from "three"

import Listener from "./Listener";

import { onDocumentMouseMove } from "./utility/events"
import { CONTAINER_DEPTH } from "./utility/constants"

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
    this.cameraParams = {
      fov: 60,
      init: 1,
      end: CONTAINER_DEPTH
    }

    this.camera = null
    this.fakeCamera = null
    this.frustum = null
    this.scene = null
    this.renderer = null
    this.canvas = null
    this.mouse = {
      x: 0,
      y: 0,
    }
    this.raycaster = null

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
    this.initRaycaster = this.initRaycaster.bind(this)
    this.getIntersectedObject = this.getIntersectedObject.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
  }

  componentDidMount() {    
    this.init()
    this.createCamera()
    this.createScene()
    this.createBackgroundWall()
    this.initRaycaster()

    this.addInUpdateProcess(() => {
      this.renderer.render(this.scene, this.camera)
    })
    this.containerHandler.on('resize', this.onWindowResize)

    this.update()
  }

  componentDidUpdate(){
    const { innerWidth, innerHeight } = this.state
    this.fakeCamera.aspect = innerWidth / innerHeight
    this.fakeCamera.updateProjectionMatrix()
    this.renderer.setSize( innerWidth, innerHeight )
  }

  init(){
    const { innerWidth, innerHeight } = this.state

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true })
    this.renderer.setPixelRatio(1)
    this.renderer.setSize( innerWidth, innerHeight, false )
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
  }

  resizeCanvas() {
    const { innerWidth, innerHeight } = this.state

    this.canvas.style.width = '100%'
    this.canvas.style.height= '100%'
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
    
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( innerWidth, innerHeight );
  }

  createCamera(){
    const { innerWidth, innerHeight } = this.state

    const screenRatio = innerWidth / innerHeight
    
    this.fakeCamera = new THREE.PerspectiveCamera(
      this.cameraParams.fov,
      screenRatio,
      this.cameraParams.init,
      this.cameraParams.end,
    )
    this.fakeCamera.position.set( 0, 0, this.cameraParams.end )
    this.fakeCamera.updateMatrix()
    this.fakeCamera.updateMatrixWorld()
    this.fakeCamera.matrixWorldInverse.getInverse( this.fakeCamera.matrixWorld );
    
    this.camera = new THREE.PerspectiveCamera(
      this.cameraParams.fov,
      screenRatio,
      this.cameraParams.init,
      this.cameraParams.end,
    )
    this.camera.position.set( 0, 0, this.cameraParams.end )

    this.frustum = new THREE.Frustum()
    
    const cameraViewProjectionMatrix = new THREE.Matrix4()
    cameraViewProjectionMatrix.multiplyMatrices( this.fakeCamera.projectionMatrix, this.fakeCamera.matrixWorldInverse )
    this.frustum.setFromMatrix( cameraViewProjectionMatrix )
    this.frustum.planes.forEach(plane => plane.normal.multiplyScalar(-1))
      
    const onMouseMove = onDocumentMouseMove(innerWidth, innerHeight)
    this.eventsHandler.on('mousemove', e => {
      this.mouse = onMouseMove(e)
      this.handleCameraPositionOnMouseMove(this.mouse)
    })
  }
  
  createScene(){
    const fog = {
      color: 0x004d5f,
      density: 0.000025
    }
    this.scene = new THREE.Scene()
    this.fakeCamera.lookAt( this.scene.position )
    this.scene.fog = new THREE.FogExp2(fog.color, fog.density)

    this.setState({
      scene: this.scene
    })
  }

  createBackgroundWall(){
    const { innerWidth, innerHeight } = this.state
    const scaleFactor = 10
    const color = 0x33717f
    const groundGeometry = new THREE.PlaneBufferGeometry(
      innerWidth * scaleFactor,
      innerHeight * scaleFactor
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

  initRaycaster(){
      this.raycaster = new THREE.Raycaster();
  }

  getIntersectedObject(elements){
    this.raycaster.setFromCamera(this.mouse, this.fakeCamera)
    return this.raycaster.intersectObjects(elements)
  }

  onWindowResize(e) {
    const { innerWidth, innerHeight } = e.target
    this.setState({
      innerWidth,
      innerHeight,
    }, this.resizeCanvas)
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
            fakeCamera: this.fakeCamera,
            frustum: this.frustum,
            scene, 
            renderer: this.renderer,
            raycast: this.getIntersectedObject,
          }) : null
        }
      </React.Fragment>
    )
  }
  
  // update() {  
  //   renderer.clear()
  //   renderer.render(scene, camera, postprocessing.rtTextureColor, true)
  //   scene.overrideMaterial = materialDepth
  //   renderer.render(scene, camera, postprocessing.rtTextureDepth, true)
  //   scene.overrideMaterial = null
  //   renderer.render(postprocessing.scene, postprocessing.camera)
  // }
}

export default SceneManager