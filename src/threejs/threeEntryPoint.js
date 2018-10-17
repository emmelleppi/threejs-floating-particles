import React from "react"
import Listener from "./Listener";

class ThreeEntryPoint extends React.Component{
  constructor(){
    super()
    this.canvasRef = React.createRef()
    this.eventsHandler = new Listener(document)
    this.containerHandler = new Listener(window)
    this.renderProcess = []
    
    this.resizeCanvas = this.resizeCanvas.bind(this)
    this.update = this.update.bind(this)
    this.addInUpdateProcess = this.addInUpdateProcess.bind(this)
  }

  componentDidMount(){
    console.log('ThreeEntryPoint did mount')

    this.containerHandler.on('resize', this.resizeCanvas)
    this.update()
  }

  resizeCanvas() {
    this.canvasRef.current.style.width = '100%'
    this.canvasRef.current.style.height= '100%'
    this.canvasRef.current.width = this.canvasRef.current.offsetWidth
    this.canvasRef.current.height = this.canvasRef.current.offsetHeight
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
    console.log('ThreeEntryPoint render')

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
            addInUpdateProcess: this.addInUpdateProcess,
          })
        }
      </React.Fragment>
    )
  }
}

export default ThreeEntryPoint