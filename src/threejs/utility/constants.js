import * as THREE from 'three'

export const CONTAINER_DEPTH = 1000
export const NUM_OF_PARTICLES = 1
export const SCALE_PARTICLES_VELOCITY = 0.03
export const SCALE_POINT_LIGHT_VELOCITY = 0.01
export const MAX_NUMBER_OF_OPEN_PARICLES = 3

export const TRANSFORMATION_MATRICES = {
  x_L: new THREE.Vector3(-1,0,0),
  x_R: new THREE.Vector3(1,0,0),
  y_L: new THREE.Vector3(0,-1,0),
  y_R: new THREE.Vector3(0,1,0),
  z_L: new THREE.Vector3(0,0,-1),
  z_R: new THREE.Vector3(0,0,1),
}