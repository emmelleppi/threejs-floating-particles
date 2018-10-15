import * as THREE from "three"
import { randomInUnityRange } from "./utility/general"

const SCALE_POINT_LIGHT_VERTICES = 1

export default ({ 
  cubeDimensions,
  CAMERA_TO_SCENE_DISTANCE_RATIO,
  scene,
  lightPoints,
  wallLightPoints,
  Z_BIAS,
 }) => {

  function createLights(){
    const frontSpotLight = new THREE.SpotLight(
      0x1b853a,
      0.8,
      cubeDimensions.z * CAMERA_TO_SCENE_DISTANCE_RATIO,
      1,
      1,
      1
    )
    frontSpotLight.position.set(
      0,
      0,
      (cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    )
    frontSpotLight.castShadow = true
    scene.add(frontSpotLight)
  
    const pointLightsColors = [0xffffff, 0x1b853a, 0x03d4f, 0x106ec6, 0x33619b]
    lightPoints = pointLightsColors.map(color => createRandomPointLight(color))
    lightPoints.forEach(light => scene.add(light))
  
    const wallPointLightsColors = [0xffffff, 0xffffff, 0xffffff]
    wallLightPoints = wallPointLightsColors.map(color =>
      createRandomZAxisFlatPointLight(color)
    )
    wallLightPoints.forEach(light => scene.add(light))
  }
   
  function createPointLight({
    color = 0xffffff,
    intensity = 1,
    coords = [0, 0, 0],
    zAxisFlat = false
  }) {
    let pointLight = new THREE.PointLight(color, intensity, 2000)
    pointLight.position.set(coords[0], coords[1], coords[2])
    pointLight.vertices = new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      zAxisFlat ? 0 : randomInUnityRange()
    ).multiplyScalar(SCALE_POINT_LIGHT_VERTICES)
    return pointLight
  }
  
  function createRandomPointLight(color) {
    const intensity = 1
  
    return createPointLight({
      color,
      intensity,
      coords: [
        (randomInUnityRange() * cubeDimensions.x) / 2,
        (randomInUnityRange() * cubeDimensions.y) / 2,
        Math.random() * cubeDimensions.z + Z_BIAS
      ],
    })
  }
  
  function createRandomZAxisFlatPointLight(color) {
    const zBiasScale = 0.5
    const xScale = 1.5
    const yScale = 1.5
    const intensity = 0.8
  
    return createPointLight({
      color,
      intensity,
      coords: [
        randomInUnityRange() * cubeDimensions.x * xScale,
        randomInUnityRange() * cubeDimensions.y * yScale,
        Z_BIAS * zBiasScale
      ],
      zAxisFlat: true
    })
  } 

  return {
    createLights,
  }
}