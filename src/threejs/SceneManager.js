import * as THREE from "three";
import { TweenMax, Expo } from "gsap";
import { BokehDepthShader, BokehShader } from "./BokehShader";
import * as dat from "dat.gui";

export default (canvas, innerWidth, innerHeight) => {

  const NUM_OF_PARTICLES = 2000;
  const CAMERA_TO_SCENE_DISTANCE_RATIO = 1.01;
  const Z_BIAS = 2000;
  const SCALE_POINT_LIGHT_VERTICES = 1;
  const SCALE_PARTICLES_VERTICES = 0.1;
  
  let camera, scene, renderer
  let mouse = new THREE.Vector2();
  let raycaster;
  let intersected = {
    object: null,
    currentHex: null,
    currentPosition: new THREE.Vector3(0, 0, 0),
    currentVertices: new THREE.Vector3(0, 0, 0)
  };
  let isParticleOpen = false;
  
  let particles = [],
    lightPoints = [],
    wallLightPoints = [];
  
  let materialDepth;
  let postprocessing = {};
  let shaderSettings = {
    rings: 3,
    samples: 4
  };
  let effectController;
  
  const cubeDimensions = {
    x: innerWidth,
    y: innerHeight,
    z: 1500
  };
    
  function init() {
    const screenRatio = cubeDimensions.x / cubeDimensions.y;
    camera = new THREE.PerspectiveCamera(
      45,
      screenRatio,
      1,
      (cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    );
    camera.position.set(0, 0, cubeDimensions.z + Z_BIAS);
    scene = new THREE.Scene();
    camera.lookAt(scene.position);
    scene.fog = THREE.FogExp2(0x004d5f, 0.0025);
  
    const groundGeometry = new THREE.PlaneBufferGeometry(
      cubeDimensions.x * 10,
      cubeDimensions.y * 10
    );
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: 0x33717f,
      dithering: true
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.set(0, 0, 0);
    ground.receiveShadow = true;
    scene.add(ground);
  
    const frontSpotLight = new THREE.SpotLight(
      0x1b853a,
      0.8,
      cubeDimensions.z * CAMERA_TO_SCENE_DISTANCE_RATIO,
      1,
      1,
      1
    );
    frontSpotLight.position.set(
      0,
      0,
      (cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    );
    frontSpotLight.castShadow = true;
    scene.add(frontSpotLight);
  
    const pointLightsColors = [0xffffff, 0x1b853a, 0x03d4f, 0x106ec6, 0x33619b];
    lightPoints = pointLightsColors.map(color => createRandomPointLight(color));
    lightPoints.forEach(light => scene.add(light));
  
    const wallPointLightsColors = [0xffffff, 0xffffff, 0xffffff];
    wallLightPoints = wallPointLightsColors.map(color =>
      createRandomZAxisFlatPointLight(color)
    );
    wallLightPoints.forEach(light => scene.add(light));
  
    for (let i = 0; i < NUM_OF_PARTICLES; i++) {
      const material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 0x000000
      });
      const geometry = new THREE.CircleGeometry(5, 32);
      const circle = new THREE.Mesh(geometry, material);
      circle.position.x = (randomInUnityRange() * cubeDimensions.x) / 2;
      circle.position.y = (randomInUnityRange() * cubeDimensions.y) / 2;
      circle.position.z = Z_BIAS + Math.random() * cubeDimensions.z;
      circle.vertices = new THREE.Vector3(
        randomInUnityRange(),
        randomInUnityRange(),
        randomInUnityRange()
      ).multiplyScalar(SCALE_PARTICLES_VERTICES);
      scene.add(circle);
      particles.push(circle);
    }
  
    //
  
    renderer = new THREE.WebGLRenderer({ canvas: canvas ,antialias: true });
    renderer.setPixelRatio(1);
    renderer.setSize(cubeDimensions.x, cubeDimensions.y, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
    //
  
    raycaster = new THREE.Raycaster();
  
    document.addEventListener("mousemove", onDocumentMouseMove, false);
    document.addEventListener("mousedown", onDocumentMouseDown, false);
  
    let depthShader = BokehDepthShader;
  
    materialDepth = new THREE.ShaderMaterial({
      uniforms: depthShader.uniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader
    });
    materialDepth.uniforms["mNear"].value = camera.near;
    materialDepth.uniforms["mFar"].value = camera.far;
  
    initPostprocessing();
  
    effectController = {
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
    };
  
    let matChanger = function() {
      for (let e in effectController) {
        if (e in postprocessing.bokeh_uniforms) {
          postprocessing.bokeh_uniforms[e].value = effectController[e];
        }
      }
      postprocessing.bokeh_uniforms["znear"].value = camera.near;
      postprocessing.bokeh_uniforms["zfar"].value = camera.far;
      camera.setFocalLength(effectController.focalLength);
    };
  
    let gui = new dat.GUI();
    gui
      .add(effectController, "focalDepth", 0.0, 200.0)
      .listen()
      .onChange(matChanger);
    gui.add(effectController, "fstop", 0.1, 22, 0.001).onChange(matChanger);
    gui.add(effectController, "maxblur", 0.0, 5.0, 0.025).onChange(matChanger);
    gui.add(effectController, "vignetting").onChange(matChanger);
    gui.add(effectController, "depthblur").onChange(matChanger);
    gui.add(effectController, "threshold", 0, 1, 0.001).onChange(matChanger);
    gui.add(effectController, "gain", 0, 100, 0.001).onChange(matChanger);
    gui.add(effectController, "bias", 0, 3, 0.001).onChange(matChanger);
    gui.add(effectController, "fringe", 0, 5, 0.001).onChange(matChanger);
    gui.add(effectController, "focalLength", 16, 80, 0.001).onChange(matChanger);
    gui.add(effectController, "dithering", 0, 0.001, 0.0001).onChange(matChanger);
    gui.add(effectController, "pentagon").onChange(matChanger);
    gui
      .add(shaderSettings, "rings", 1, 8)
      .step(1)
      .onChange(shaderUpdate);
    gui
      .add(shaderSettings, "samples", 1, 13)
      .step(1)
      .onChange(shaderUpdate);
    matChanger();
  }
  
  function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  }
  
  function randomInUnityRange() {
    return Math.random() * 2 - 1;
  }
  
  function createPointLight({
    color = 0xffffff,
    intensity = 1,
    coords = [0, 0, 0],
    withHelper = false,
    zAxisFlat = false
  }) {
    let pointLight = new THREE.PointLight(color, intensity, 2000);
    pointLight.position.set(coords[0], coords[1], coords[2]);
    pointLight.vertices = new THREE.Vector3(
      randomInUnityRange(),
      randomInUnityRange(),
      zAxisFlat ? 0 : randomInUnityRange()
    ).multiplyScalar(SCALE_POINT_LIGHT_VERTICES);
    return pointLight;
  }
  
  function createRandomPointLight(color) {
    const intensity = 1;
  
    return createPointLight({
      color,
      intensity,
      coords: [
        (randomInUnityRange() * cubeDimensions.x) / 2,
        (randomInUnityRange() * cubeDimensions.y) / 2,
        Math.random() * cubeDimensions.z + Z_BIAS
      ],
      withHelper: false
    });
  }
  
  function createRandomZAxisFlatPointLight(color) {
    const zBiasScale = 0.5;
    const xScale = 1.5;
    const yScale = 1.5;
    const intensity = 0.8;
  
    return createPointLight({
      color,
      intensity,
      coords: [
        randomInUnityRange() * cubeDimensions.x * xScale,
        randomInUnityRange() * cubeDimensions.y * yScale,
        Z_BIAS * zBiasScale
      ],
      withHelper: false,
      zAxisFlat: true
    });
  }
  
  function checkCollision(coords = [0, 0, 0], zFlat = false) {
    const { x, y, z } = coords;
    const prospectiveScaling = zFlat ? z / 300 : 1 / 2;
    if (Math.abs(x) > cubeDimensions.x * prospectiveScaling) {
      return x > 0 ? new THREE.Vector3(-1, 0, 0) : new THREE.Vector3(1, 0, 0);
    }
    if (Math.abs(y) > cubeDimensions.y * prospectiveScaling) {
      return y > 0 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0);
    }
    if (!zFlat) {
      if (z - Z_BIAS > cubeDimensions.z / 2) {
        return new THREE.Vector3(0, 0, -1);
      }
      if (z - Z_BIAS <= 0) {
        return new THREE.Vector3(0, 0, 1);
      }
    }
    return null;
  }
  
  function moveObjects(array = [], zFlat = false) {
    for (let i = 0; i < array.length; i++) {
      const object = array[i];
      const reflectionVector = checkCollision(object.position, zFlat);
      if (reflectionVector) {
        object.vertices.reflect(reflectionVector);
      }
      const { x, y, z } = object.vertices;
      object.position.x += x;
      object.position.y += y;
      object.position.z += z;
    }
  }
  
  function handleCameraPositionOnMouseMove() {
    const scaleX = 1 / 10;
    const scaleY = 20;
    camera.position.set(
      Math.atan(mouse.x * scaleX) * scaleY,
      Math.atan(-mouse.y * scaleX) * scaleY,
      (cubeDimensions.z + Z_BIAS) * CAMERA_TO_SCENE_DISTANCE_RATIO
    );
    camera.updateMatrixWorld();
  }
  
  function handleRaycasterOnParticles() {
    raycaster.setFromCamera(new THREE.Vector2(mouse.x, mouse.y), camera);
    let intersects = raycaster.intersectObjects(particles);
    if (!isParticleOpen) {
      if (intersects.length > 0) {
        if (intersected.object !== intersects[0].object) {
          if (intersected.object) {
            let { object, currentHex } = intersected;
            object.material.emissive.setHex(currentHex);
          }
          intersected.object = intersects[0].object;
          let { object, currentHex } = intersected;
          currentHex = object.material.emissive.getHex();
          object.material.emissive.setHex(0xff0000);
        }
      } else {
        if (intersected.object) {
          let { object, currentHex } = intersected;
          object.material.emissive.setHex(currentHex);
        }
        intersected.object = null;
      }
    }
  }
  
  function onDocumentMouseDown(event) {
    event.preventDefault();
    if (intersected.object) {
      let { object, currentPosition, currentVertices, currentHex } = intersected;
      let { position, vertices } = object;
  
      if (isParticleOpen) {
        TweenMax.to(position, 0.6, {
          x: currentPosition.x,
          y: currentPosition.y,
          z: currentPosition.z,
          ease: Expo.easeOut
        });
        vertices.x = currentVertices.x;
        vertices.y = currentVertices.y;
        vertices.z = currentVertices.z;
  
        isParticleOpen = false;
      } else {
        currentPosition.x = position.x;
        currentPosition.y = position.y;
        currentPosition.z = position.z;
        currentVertices.x = vertices.x;
        currentVertices.y = vertices.y;
        currentVertices.z = vertices.z;
  
        TweenMax.to(position, 0.6, {
          x: 0,
          y: 0,
          z: 3500,
          ease: Expo.easeIn
        });
        vertices.x = 0;
        vertices.y = 0;
        vertices.z = 0;
        object.material.emissive.setHex(currentHex);
        isParticleOpen = true;
      }
    }
  }
  
  function initPostprocessing() {
    postprocessing.scene = new THREE.Scene();
    postprocessing.camera = new THREE.OrthographicCamera(
      innerWidth / -2,
      innerWidth / 2,
      innerHeight / 2,
      innerHeight / -2,
      -10000,
      10000
    );
    postprocessing.camera.position.z = 100;
    postprocessing.scene.add(postprocessing.camera);
  
    let pars = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBFormat
    };
    postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(
      innerWidth,
      innerHeight,
      pars
    );
    postprocessing.rtTextureColor = new THREE.WebGLRenderTarget(
      innerWidth,
      innerHeight,
      pars
    );
  
    let bokeh_shader = BokehShader;
  
    postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone(
      bokeh_shader.uniforms
    );
    postprocessing.bokeh_uniforms["tColor"].value =
      postprocessing.rtTextureColor.texture;
    postprocessing.bokeh_uniforms["tDepth"].value =
      postprocessing.rtTextureDepth.texture;
    postprocessing.bokeh_uniforms["textureWidth"].value = innerWidth;
    postprocessing.bokeh_uniforms["textureHeight"].value = innerHeight;
    postprocessing.materialBokeh = new THREE.ShaderMaterial({
      uniforms: postprocessing.bokeh_uniforms,
      vertexShader: bokeh_shader.vertexShader,
      fragmentShader: bokeh_shader.fragmentShader,
      defines: {
        RINGS: shaderSettings.rings,
        SAMPLES: shaderSettings.samples
      }
    });
    postprocessing.quad = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(innerWidth, innerHeight),
      postprocessing.materialBokeh
    );
    postprocessing.quad.position.z = -500;
    postprocessing.scene.add(postprocessing.quad);
  }
  
  function shaderUpdate() {
    postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings;
    postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples;
    postprocessing.materialBokeh.needsUpdate = true;
  }
  
  function update() {
    moveObjects(particles);
    moveObjects(lightPoints);
    moveObjects(wallLightPoints, true);
    handleCameraPositionOnMouseMove();
    handleRaycasterOnParticles();
  
    //renderer.render( scene, camera );
    renderer.clear();
    renderer.render(scene, camera, postprocessing.rtTextureColor, true);
    scene.overrideMaterial = materialDepth;
    renderer.render(scene, camera, postprocessing.rtTextureDepth, true);
    scene.overrideMaterial = null;
    renderer.render(postprocessing.scene, postprocessing.camera);
  }

  function onWindowResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( innerWidth, innerHeight );
  }

  return {
    init,
    update,
    onWindowResize,
  }

}