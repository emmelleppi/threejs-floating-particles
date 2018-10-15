import React from "react"
import Listener from "./Listener";
import SceneManager from './SceneManager'

class ThreeEntryPoint extends React.Component{
  constructor(){
    super()
    this.canvasRef = React.createRef()
    this.sceneRef = React.createRef()
    this.eventsHandler = new Listener(document)
    this.containerHandler = new Listener(this.props.container)
    this.renderProcess = []
    
    this.resizeCanvas = this.resizeCanvas.bind(this)
    this.update = this.update.bind(this)
    this.addInUpdateProcess = this.addInUpdateProcess.bind(this)
  }

  componentDidMount(){
    this.containerHandler.on('resize', this.resizeCanvas)
    this.addInUpdateProcess(this.sceneRef.current.update)
    this.update()
  }

  resizeCanvas() {
    this.canvasRef.current.style.width = '100%'
    this.canvasRef.current.style.height= '100%'
    this.canvasRef.current.width = this.canvasRef.current.offsetWidth
    this.canvasRef.current.height = this.canvasRef.current.offsetHeight
  }

  update() {
    requestAnimationFrame(update, false)
    for(let i=0; i<this.renderProcess.length; i++){
      this.renderProcess[i]()
    }
  }

  addInUpdateProcess(fn){
    this.renderProcess.push(fn)
  }

  render(){
    const { container } = this.props
    return ( 
      <React.Fragment>
        <canvas ref={ this.canvasRef } ></canvas>
        {
          this.props.children({
            container,
            canvas: this.canvasRef,
            eventsHandler: this.eventsHandler,
            containerHandler: this.containerHandler,
            addInUpdateProcess,
          })
        }
      </React.Fragment>
    )
  }
}

export default ThreeEntryPoint