import React, { Component } from 'react';
import ReactDOM from "react-dom";
import ThreeEntryPoint from './threejs/ThreeEntryPoint';
import { WEBGL } from "./webgl";
import SceneManager from './threejs/SceneManager';

class App extends Component {

  render () {    
    return WEBGL.isWebGLAvailable() 
      ? <ThreeEntryPoint container={window} >
        {
          ({ container, canvas, eventsHandler, containerHandler, addInUpdateProcess, }) => (
            <SceneManager
              canvas = {canvas}
              innerWidth = {container.innerWidth}
              innerHeight = {container.innerHeight}
              eventsHandler = {eventsHandler}
              containerHandler = {containerHandler}
              addInUpdateProcess = {addInUpdateProcess}
            >
            {
              ({ camera, scene, renderer }) => (
                <div></div>
              )
            }
            </SceneManager>
          )
        }
        </ThreeEntryPoint>
      : <React.Fragment>{ WEBGL.getWebGLErrorMessage() }</React.Fragment>
  }

}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);