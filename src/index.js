import React from 'react'
import ReactDOM from "react-dom"

import { WEBGL } from "./webgl"
import SceneManager from './threejs/SceneManager'
import ParticlesManager from './threejs/ParticlesManager'
import SpotLight from './threejs/SpotLight'
import PointLightsManager from './threejs/PointLightsManager'
import { NUM_OF_PARTICLES } from "./threejs/utility/constants";

const App = ({ container }) => WEBGL.isWebGLAvailable() 
  ?  <SceneManager container={container} >
      {
        (props) => 
        (
          <React.Fragment>
            <ParticlesManager
              numOfParticles={NUM_OF_PARTICLES}
              {...props}
            />
            <SpotLight
              color={0x1b853a}
              intensity={1}
              angle={1}
              penumbra={0}
              decay={1}
              {...props}
            />
            {/* <PointLightsManager
              colors={[0xffffff, 0x1b853a, 0x03d4f, 0x106ec6, 0x33619b]}
              intensity={0.5}
              radius={4000}
              zFlat={false}
              {...props}
            />
            <PointLightsManager
              colors={[0xFFFFFF,0xFFFFFF,0xFFFFFF]}
              intensity={0.5}
              radius={2000}
              zFlat={true}
              {...props}
            /> */}
          </React.Fragment>
        )
      }
      </SceneManager>
  : <React.Fragment>{ WEBGL.getWebGLErrorMessage() }</React.Fragment>

const rootElement = document.getElementById("root")
ReactDOM.render(<App container={window} />, rootElement)
