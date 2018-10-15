import React from "react"

import SceneManager from './SceneManager'

class ThreeEntryPoint extends React.Component{
  constructor(){
    super()
    this.state = {}
    this.canvas = null

    this.update = this.update.bind(this)
    this.createCanvas = this.createCanvas.bind(this)

    this.events = {
      mousemove: null
    }
  }

  componentDidMount(){
    this.canvas = createCanvas(this.props.containerElement)
    this.update()
  }

  createCanvas(containerElement) {
    this.canvas = document.createElement('canvas')
    containerElement.appendChild(this.canvas)
  }

  on(event, callback, bubble) {
    this.events[event].push(callback)
  } 

  off(event, callback) {

    this.events[event].filter(ev => ev.callback !== callback)

  }

  handleMouseMove(e) {

    this.events['marcello.mousemove'].forEach(ev => {
      ev.callback(e)
    })

  } 

  bindEventListeners() {
    document.addEventListener("mousemove", sceneManager.onDocumentMouseMove, false)
    document.addEventListener("mousedown", sceneManager.onDocumentMouseDown, false)
    window.onresize = resizeCanvas
    resizeCanvas()
  }

  resizeCanvas() {
    this.canvas.style.width = '100%'
    this.canvas.style.height= '100%'
    this.canvas.width = this.canvas.offsetWidth
    this.canvas.height = this.canvas.offsetHeight
    sceneManager.onWindowResize()
  }

  update() {
    requestAnimationFrame(update, false)
    sceneManager.update()
  }

  render(){

  }
}

function createCanvas(document, containerElement) {
  const canvas = document.createElement('canvas')
  containerElement.appendChild(canvas)
  return canvas
}

export default containerElement => {  
  const canvas = createCanvas(document, containerElement)
  const sceneManager = new SceneManager(canvas, window.innerWidth, window.innerHeight)

  sceneManager.init()
  bindEventListeners()
  render()

  function bindEventListeners() {
    document.addEventListener("mousemove", sceneManager.onDocumentMouseMove, false)
    document.addEventListener("mousedown", sceneManager.onDocumentMouseDown, false)
    window.onresize = resizeCanvas
    resizeCanvas()
  }

  function resizeCanvas() {
    canvas.style.width = '100%'
    canvas.style.height= '100%'
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    sceneManager.onWindowResize()
  }

  function render() {
    requestAnimationFrame(render, false)
    sceneManager.update()
  }

}