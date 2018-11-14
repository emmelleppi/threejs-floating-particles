import * as THREE from "three"
import { TweenMax, Expo } from "gsap"

import * as ObjectManager from "./generalObjectManager";
import { SCALE_PARTICLES_VELOCITY } from './utility/constants'

const defaultState = {
  color: 0xFFFFFF,
  emissive: 0x000000,
  radius: 5,
  segments: 32,
  scaleVelocity: SCALE_PARTICLES_VELOCITY,
}

const Particle = ({ fakeCamera }) => {
  let updateFlag = true
  let isInTheFrustum = true
  const currentPosition = new THREE.Vector3(0,0,0)

  const {
    id,
    mesh,
    position,
    velocity,
  } = createParticle({ ...defaultState })

  return {
    id,
    mesh,
    startMovement,
    stopMovement,
    update: () => {
      console.log(isInTheFrustum);
      
      isInTheFrustum = ObjectManager.updatePosition({
        object: mesh,
        position,
        velocity,
        updateFlag,
        fakeCamera,
        isInTheFrustum,
      })
    },
    onClick: () => onClick({
      updateFlag,
      currentPosition,
      position,
    }),
  }
}

const createParticle = ({ color, emissive, radius, segments, scaleVelocity }) => {
  const zFlat = false
  const material = new THREE.MeshLambertMaterial({
    color,
    emissive,
  })
  const geometry = new THREE.CircleGeometry(radius, segments)
  const mesh = new THREE.Mesh(geometry, material)
  const id = mesh.uuid
  const position = ObjectManager.getRandomPosition(zFlat)
  const velocity = ObjectManager.getRandomVelocity({ scaleVelocity, zFlat })
  
  return {
    id,
    mesh,
    position,
    velocity,
  }
}

const startMovement = updateFlag => updateFlag = true

const stopMovement = updateFlag => updateFlag = false

const onClick = ({ updateFlag, currentPosition, position }) => {
  if (!updateFlag) {
    const { x, y, z } = currentPosition
    TweenMax.to(position, 0.6, {
      x,
      y,
      z,
      ease: Expo.easeOut
    })
    startMovement(updateFlag)
  } else {
    currentPosition = position.clone()
    
    TweenMax.to(position, 0.6, {
      z: 0.96,
      ease: Expo.easeIn
    })
    stopMovement(updateFlag)
  }
}

export default Particle