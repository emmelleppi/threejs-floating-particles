import { useState, useEffect } from "react"
import workerContext from './worker'
import WebWorker from "./WebWorker"
import Particle from "./Particle"
import { MAX_NUMBER_OF_OPEN_PARICLES } from "./utility/constants"

// const deafultState = {
//   color: 0xFFFFFF,
//   numOfParticles: NUM_OF_PARTICLES,
//   scaleVelocity: SCALE_PARTICLES_VELOCITY,
// }

const ParticlesManager = props => {
  const {
    fakeCamera,
    numOfParticles,
    raycast,
    scene,
    addInUpdateProcess,
    removeInUpdateProcess,
    eventsHandler,
  } = props    

  // const [ worker, setWorker ] = useState(() => {
  //   if(window.Worker){
  //     return new WebWorker(workerContext)
  //   }
  //   return null
  // })
  // useEffect(() => {
  //   if(worker){
  //     worker.onmessage = event => {
  //       // console.log(event)
  //     }
  //     return () => {
  //       // TODO
  //     }
  //   }
  // },[])

  const [ particles, setParticles ] = useState([])
  const [ particlesMesh, setParticlesMesh ] = useState([])
  
  useEffect(() => {    
    const particlesArray = []
    const particleMeshesArray = []
    for(let i = 0; i < numOfParticles; i++){
      const particle = new Particle({ fakeCamera })
      particlesArray.push(particle)
      particleMeshesArray.push(particle.mesh)
      scene.add(particle.mesh)
    }    
    setParticles(particlesArray)
    setParticlesMesh(particleMeshesArray)
    return () => {
      setParticles([])
      setParticlesMesh([])
    }
  },[])
  useEffect(() => {  
    addInUpdateProcess({
      fn: () => update(particles),
      id: 'particles-update',
    })
    return () => {
      removeInUpdateProcess('particles-update')
    }
  }, [particles])

  const clickedParticles = []
  const [ intersected, setIntersected ] = useState({
    object: null,
    currentHex: null,
  })
  const [ isParticleOpen, setIsParticleOpen ] = useState(false)

  useEffect(() => {
    addInUpdateProcess({
      fn: () => handleRaycasterOnParticles({
        raycast,
        isParticleOpen,
        particlesMesh,
        intersected,
        setIntersected,
      }),
      id: 'particles-raycaster',
    })
    return () => {
      removeInUpdateProcess('particles-raycaster')
    }
  })

  useEffect(() => {
    const onClickParticle = e => onDocumentMouseDown(e, {
      intersected,
      particles,
      clickedParticles,
    })    
    eventsHandler.on('mousedown', onClickParticle)
    return () => {
      eventsHandler.off('mousedown', onClickParticle)
    }
  })

  return null
}

const update = particles => {  
  //this.worker.postMessage(this.particles)  
  for(let i = 0; i < particles.length; i++ ){
    particles[i].update()
    
  }
}

const handleRaycasterOnParticles = ({
  raycast,
  isParticleOpen,
  particlesMesh,
  intersected,
  setIntersected,
}) => {  
  if (!isParticleOpen && raycast) {
    const intersects = raycast(particlesMesh)
    const { object, currentHex } = intersected
    if (intersects.length > 0) {
      if (object !== intersects[0].object) {
        if (object) {
          object.material.emissive.setHex(currentHex)
        }
        const newObject = intersects[0].object
        const prevHex = newObject.material.emissive.getHex()
        newObject.material.emissive.setHex(0x222222)
        setIntersected({
          object: newObject,
          currentHex: prevHex,
        })
      }
    } else {
      if (object) {
        object.material.emissive.setHex(currentHex)
      }
      setIntersected({
        object: null,
        currentHex: null,
      })
    }
  }
}

const onDocumentMouseDown = (event, { intersected, particles, clickedParticles }) => {
  event.preventDefault()  
  const { object } = intersected
  
  if (object) {
    const particle = particles.find( particle => particle.id === object.uuid )      
    if(particle){
      particle.onClick()        
      const index = clickedParticles.findIndex( item => item.id === particle.id )        
      if(index >= 0){
        clickedParticles.splice(index, 1)
      } else {
        clickedParticles.push(particle)
        if(clickedParticles.length > MAX_NUMBER_OF_OPEN_PARICLES){
          const removed = clickedParticles.shift()
          removed.onClick()
        }
      }
    }
  }
}

// class ParticlesMansacdscager extends React.Component{
//   constructor(props){
//     super(props)
//     const { camera, fakeCamera, frustum } = props    
//     this.state = {
//       ...deafultState,
//     }
//     this.particles = []
//     this.particlesMesh = []
//     this.clickedParticles = []
//     this.camera = camera
//     this.fakeCamera = fakeCamera
//     this.frustum = frustum
//     this.worker = null

//     this.intersected = {
//       object: null,
//       currentHex: null,
//     }
//     this.isParticleOpen = false

//     this.update = this.update.bind(this)
//     this.handleRaycasterOnParticles = this.handleRaycasterOnParticles.bind(this)
//     this.onDocumentMouseDown = this.onDocumentMouseDown.bind(this)
//   }

//   componentDidMount(){    
//     const { color,  scaleVelocity } = this.state
    
//     for(let i = 0; i < this.state.numOfParticles; i++){
//       const particle = new Particle({ 
//         fakeCamera: this.fakeCamera,
//       })
//       this.particles.push(particle)
//       this.particlesMesh.push(particle.mesh)
//       this.props.scene.add(particle.mesh)
//     }
//     this.props.addInUpdateProcess(this.update)
//     this.props.addInUpdateProcess(this.handleRaycasterOnParticles)
//     this.props.eventsHandler.on('mousedown',this.onDocumentMouseDown)

//     if(window.Worker){
//       this.worker = new WebWorker(worker)
//       this.worker.onmessage = event => {
//           // console.log(event)
//       }
//     }

//   }

//   update(){
//     //this.worker.postMessage(this.particles)  
//     for(let i = 0; i < this.particles.length; i++ ){
//       this.particles[i].update()
//     }
//   }

//   handleRaycasterOnParticles() {
//     const { raycast } = this.props    
//     if (!this.isParticleOpen && raycast) {
//       const intersects = this.props.raycast(this.particlesMesh)
//       if (intersects.length > 0) {
//         if (this.intersected.object !== intersects[0].object) {
//           if (this.intersected.object) {
//             let { object, currentHex } = this.intersected
//             object.material.emissive.setHex(currentHex)
//           }
//           this.intersected.object = intersects[0].object
//           let { object, currentHex } = this.intersected
//           currentHex = object.material.emissive.getHex()
//           object.material.emissive.setHex(0x222222)
//         }
//       } else {
//         if (this.intersected.object) {
//           let { object, currentHex } = this.intersected
//           object.material.emissive.setHex(currentHex)
//         }
//         this.intersected.object = null
//       }
//     }
//   }

//   onDocumentMouseDown(event) {
//     event.preventDefault()
    
//     if (this.intersected.object) {
//       let { object } = this.intersected
//       const particle = this.particles.find( particle => particle.id === object.uuid )      
//       if(particle){
//         particle.onClick()        
//         const index = this.clickedParticles.findIndex( item => item.id === particle.id )        
//         if(index >= 0){
//           this.clickedParticles.splice(index, 1)
//         } else {
//           this.clickedParticles.push(particle)
//           if(this.clickedParticles.length > MAX_NUMBER_OF_OPEN_PARICLES){
//             const removed = this.clickedParticles.shift()
//             removed.onClick()
//           }
//         }
//       }
//     }
//   }

//   render(){
//     return null
//   }
// }

export default ParticlesManager