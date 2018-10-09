import React, { Component } from 'react';
import ReactDOM from "react-dom";
import threeEntryPoint from './threejs/threeEntryPoint';
import { WEBGL } from "./webgl";

class App extends Component {

  componentDidMount() {
    console.log(this.threeRootElement);
    
    threeEntryPoint(this.threeRootElement);
  }

  render () {    
    return WEBGL.isWebGLAvailable() 
      ? <div ref={element => this.threeRootElement = element} />
      : <React.Fragment>{ WEBGL.getWebGLErrorMessage() }</React.Fragment>
  }

}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);