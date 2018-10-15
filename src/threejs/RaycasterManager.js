import * as THREE from "three"
import { TweenMax, Expo } from "gsap"

let intersected = {
  object: null,
  currentHex: null,
  currentPosition: new THREE.Vector3(0, 0, 0),
  currentVertices: new THREE.Vector3(0, 0, 0),
}
let isParticleOpen = false

export default ({ 
  raycaster,
  mouse,
  camera,
  particles,
  isParticleOpen,
 }) => {

  function handleRaycasterOnParticles() {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera)
    let intersects = raycaster.intersectObjects(particles)
    if (!isParticleOpen) {
      if (intersects.length > 0) {
        if (intersected.object !== intersects[0].object) {
          if (intersected.object) {
            let { object, currentHex } = intersected
            object.material.emissive.setHex(currentHex)
          }
          intersected.object = intersects[0].object
          let { object, currentHex } = intersected
          currentHex = object.material.emissive.getHex()
          object.material.emissive.setHex(0xff0000)
        }
      } else {
        if (intersected.object) {
          let { object, currentHex } = intersected
          object.material.emissive.setHex(currentHex)
        }
        intersected.object = null
      }
    }
  }

  function onDocumentMouseDown(event) {
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
  
  return {
    handleRaycasterOnParticles
  }

}