import React from 'react'
import ReactDOM from "react-dom"
import * as THREE from "three";

import { WEBGL } from "./webgl"
import SceneManager from './threejs/SceneManager'
import ParticlesManager from './threejs/ParticlesManager'
import SpotLight from './threejs/SpotLight'
import PointLightsManager from './threejs/PointLightsManager'
import { SCALE_POINT_LIGHT_VELOCITY, SCALE_PARTICLES_VELOCITY, NUM_OF_PARTICLES } from "./threejs/utility/constants";

class App extends React.Component {


  render () {    
    return WEBGL.isWebGLAvailable() 
      ?  <SceneManager container={window} >
          {
            ({ frustum, camera, scene, renderer, container, eventsHandler, containerHandler, addInUpdateProcess, raycast }) => 
            (
              <React.Fragment>
                <ParticlesManager
                  scaleFactor={new THREE.Vector3(0.5,0.5,1)}
                  scene={scene}
                  addInUpdateProcess={addInUpdateProcess}
                  numOfParticles={NUM_OF_PARTICLES}
                  scaleVelocity={SCALE_PARTICLES_VELOCITY}
                  color={0xFFFFFF}
                  raycast={raycast}
                  eventsHandler={eventsHandler}
                  camera={camera}
                  frustum={frustum}
                />
                <SpotLight
                  scene={scene}
                  color={0x1b853a}
                  intensity={1}
                  angle={1}
                  penumbra={0}
                  decay={1}
                  camera={camera}
                  frustum={frustum}
                />
                <PointLightsManager
                  scaleFactor={new THREE.Vector3(0.5,0.5,1)}
                  scaleVelocity={SCALE_POINT_LIGHT_VELOCITY}
                  scene={scene}
                  camera={camera}
                  frustum={frustum}
                  colors={[0xffffff, 0x1b853a, 0x03d4f, 0x106ec6, 0x33619b]}
                  intensity={0.5}
                  radius={1500}
                  zFlat={false}
                  addInUpdateProcess={addInUpdateProcess}
                />
                <PointLightsManager
                  scaleFactor={new THREE.Vector3(1,1,0.5)}
                  scaleVelocity={SCALE_POINT_LIGHT_VELOCITY}
                  scene={scene}
                  camera={camera}
                  frustum={frustum}
                  colors={[0xFFFFFF,0xFFFFFF,0xFFFFFF]}
                  intensity={0.5}
                  radius={2000}
                  zFlat={true}
                  addInUpdateProcess={addInUpdateProcess}
                />
              </React.Fragment>
            )
          }
          </SceneManager>
      : <React.Fragment>{ WEBGL.getWebGLErrorMessage() }</React.Fragment>
  }

}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);