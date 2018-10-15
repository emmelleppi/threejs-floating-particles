import * as dat from "dat.gui"

let effectController = {
  fstop: 2.2,
  maxblur: 1.0,
  focalDepth: 2.8,
  vignetting: false,
  depthblur: false,
  threshold: 0.5,
  gain: 2.0,
  bias: 0.5,
  fringe: 0.7,
  focalLength: 35,
  pentagon: false,
  dithering: 0.0001
}

export default ({ 
  postprocessing,
  camera,
  shaderSettings,
  shaderManager
}) => { 
    let matChanger = function() {
      for (let e in effectController) {
        if (e in postprocessing.bokeh_uniforms) {
          postprocessing.bokeh_uniforms[e].value = effectController[e]
        }
      }
      postprocessing.bokeh_uniforms["znear"].value = camera.near
      postprocessing.bokeh_uniforms["zfar"].value = camera.far
      camera.setFocalLength(effectController.focalLength)
    }

    let gui = new dat.GUI()
    gui
      .add(effectController, "focalDepth", 0.0, 200.0)
      .listen()
      .onChange(matChanger)
    gui.add(effectController, "fstop", 0.1, 22, 0.001).onChange(matChanger)
    gui.add(effectController, "maxblur", 0.0, 5.0, 0.025).onChange(matChanger)
    gui.add(effectController, "vignetting").onChange(matChanger)
    gui.add(effectController, "depthblur").onChange(matChanger)
    gui.add(effectController, "threshold", 0, 1, 0.001).onChange(matChanger)
    gui.add(effectController, "gain", 0, 100, 0.001).onChange(matChanger)
    gui.add(effectController, "bias", 0, 3, 0.001).onChange(matChanger)
    gui.add(effectController, "fringe", 0, 5, 0.001).onChange(matChanger)
    gui.add(effectController, "focalLength", 16, 80, 0.001).onChange(matChanger)
    gui.add(effectController, "dithering", 0, 0.001, 0.0001).onChange(matChanger)
    gui.add(effectController, "pentagon").onChange(matChanger)
    gui
      .add(shaderSettings, "rings", 1, 8)
      .step(1)
      .onChange(shaderManager.shaderUpdate)
    gui
      .add(shaderSettings, "samples", 1, 13)
      .step(1)
      .onChange(shaderManager.shaderUpdate)
    matChanger()
}
