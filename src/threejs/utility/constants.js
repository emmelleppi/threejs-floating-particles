import * as THREE from 'three'

export const CAMERA_TO_SCENE_DISTANCE_RATIO = 1.01
export const CONTAINER_DEPTH = 1500
export const Z_BIAS = 2000
export const NUM_OF_PARTICLES = 2000
export const SCALE_PARTICLES_VELOCITY = 0.1
export const SCALE_POINT_LIGHT_VELOCITY = 1

export const TRANSFORMATION_MATRICES = {
  x_L: new THREE.Vector3(-1,0,0),
  x_R: new THREE.Vector3(1,0,0),
  y_L: new THREE.Vector3(0,-1,0),
  y_R: new THREE.Vector3(0,1,0),
  z_L: new THREE.Vector3(0,0,-1),
  z_R: new THREE.Vector3(0,0,1),
}