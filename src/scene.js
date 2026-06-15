import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { params } from "./config.js";

export function createSceneSystem({ loading } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 240, 120);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.physicallyCorrectLights = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = params.exposure;
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 0);
  light.position.set(50, 100, 50);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0);
  scene.add(ambient);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const hdrLoader = new HDRLoader();
  let currentEnvMap = null;

  function applyEnvironmentTexture(texture) {
    const envMap = pmrem.fromEquirectangular(texture).texture;

    scene.environment = envMap;
    scene.background = envMap;
    scene.backgroundBlurriness = params.bgBlur;
    scene.backgroundIntensity = 1;

    if (currentEnvMap) currentEnvMap.dispose();
    currentEnvMap = envMap;
    light.intensity = 0;
    ambient.intensity = 0;
    texture.dispose();
  }

  let envLoadId = 0;

  function loadEnvironment(path, { silent = false } = {}) {
    if (!path) return Promise.resolve();

    const id = ++envLoadId;

    return new Promise((resolve, reject) => {
      if (!silent) loading?.begin("environment");

      hdrLoader.load(
        path,
        (texture) => {
          if (id !== envLoadId) {
            if (!silent) loading?.end("environment");
            resolve(null);
            return;
          }
          applyEnvironmentTexture(texture);
          if (!silent) loading?.end("environment");
          resolve(texture);
        },
        (xhr) => {
          if (!silent && xhr.total) {
            loading?.setProgress(xhr.loaded / xhr.total);
          }
        },
        (err) => {
          if (id === envLoadId && !silent) loading?.end("environment");
          console.error(err);
          reject(err);
        }
      );
    });
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener("resize", onResize);

  return {
    scene,
    camera,
    renderer,
    controls,
    light,
    ambient,
    loadEnvironment,
  };
}
