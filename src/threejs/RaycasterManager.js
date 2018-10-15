import * as THREE from "three"

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
  
  return {
    handleRaycasterOnParticles
  }

}