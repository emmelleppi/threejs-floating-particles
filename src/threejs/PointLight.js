import * as THREE from "three"

import * as ObjectManager from "./generalObjectManager";
import { SCALE_POINT_LIGHT_VELOCITY } from './utility/constants'

const PointLight = props => {
  let isInTheFrustum = true

  const {
    zFlat,
    color,
    fakeCamera,
    radius,
    intensity,
  } = props

  const {
    pointLight,
    position,
    velocity,
  } = createPointLight({
    zFlat,
    color,
    radius,
    intensity,
    scaleVelocity: SCALE_POINT_LIGHT_VELOCITY,
  })

  return {
    pointLight,
    update: () => {
      isInTheFrustum = ObjectManager.updatePosition({
        object: pointLight,
        position,
        velocity,
        fakeCamera,
        updateFlag: true,
        isInTheFrustum,
      })
    },
  }
}

const createPointLight = ({ color, intensity, radius, scaleVelocity, zFlat }) => {
  const pointLight = new THREE.PointLight(color, intensity, radius, 1)
  const position = ObjectManager.getRandomPosition(zFlat)
  const velocity = ObjectManager.getRandomVelocity({ scaleVelocity, zFlat })

  return {
    pointLight,
    position,
    velocity,
  }
}

export default PointLight