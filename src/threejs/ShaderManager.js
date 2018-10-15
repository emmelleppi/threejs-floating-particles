import * as THREE from "three"
import { BokehDepthShader, BokehShader } from "./BokehShader"

let shaderSettings = {
  rings: 3,
  samples: 4
}


export default ({ 
  materialDepth,
  camera,
  postprocessing,
  innerWidth,
  innerHeight,
}) => {

  initShader()
  initPostprocessing()
  
  function initShader(){
    let depthShader = BokehDepthShader
    materialDepth = new THREE.ShaderMaterial({
      uniforms: depthShader.uniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader
    })
    materialDepth.uniforms["mNear"].value = camera.near
    materialDepth.uniforms["mFar"].value = camera.far
  }

  function initPostprocessing() {
    postprocessing.scene = new THREE.Scene()
    postprocessing.camera = new THREE.OrthographicCamera(
      innerWidth / -2,
      innerWidth / 2,
      innerHeight / 2,
      innerHeight / -2,
      -10000,
      10000
    )
    postprocessing.camera.position.z = 100
    postprocessing.scene.add(postprocessing.camera)

    let pars = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat
    }
    postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(
      innerWidth,
      innerHeight,
      pars
    )
    postprocessing.rtTextureColor = new THREE.WebGLRenderTarget(
      innerWidth,
      innerHeight,
      pars
    )

    let bokeh_shader = BokehShader

    postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone(
      bokeh_shader.uniforms
    )
    postprocessing.bokeh_uniforms["tColor"].value =
      postprocessing.rtTextureColor.texture
    postprocessing.bokeh_uniforms["tDepth"].value =
      postprocessing.rtTextureDepth.texture
    postprocessing.bokeh_uniforms["textureWidth"].value = innerWidth
    postprocessing.bokeh_uniforms["textureHeight"].value = innerHeight
    postprocessing.materialBokeh = new THREE.ShaderMaterial({
      uniforms: postprocessing.bokeh_uniforms,
      vertexShader: bokeh_shader.vertexShader,
      fragmentShader: bokeh_shader.fragmentShader,
      defines: {
        RINGS: shaderSettings.rings,
        SAMPLES: shaderSettings.samples
      }
    })
    postprocessing.quad = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(innerWidth, innerHeight),
      postprocessing.materialBokeh
    )
    postprocessing.quad.position.z = -500
    postprocessing.scene.add(postprocessing.quad)
  }

  function shaderUpdate() {
    postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings
    postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples
    postprocessing.materialBokeh.needsUpdate = true
  }

  return {
    initShader,
    initPostprocessing,
    shaderUpdate,
  }

}