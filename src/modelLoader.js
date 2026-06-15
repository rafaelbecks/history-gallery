import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CAMERA_INTRO } from "./config.js";

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function disposeModel(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.geometry.dispose();
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((mat) => {
      for (const key in mat) {
        const value = mat[key];
        if (value && value.isTexture) value.dispose();
      }
      mat.dispose();
    });
  });
}

export function createModelLoader({ scene, camera, controls, onModelLoaded, loading }) {
  const loader = new GLTFLoader();

  let currentModel = null;
  let loadId = 0;
  let introAnimation = null;

  function frameCamera(size) {
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let framedY = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    framedY *= 1.4;
    controls.maxDistance = framedY * 10;
    controls.update();
    return framedY;
  }

  function startIntroAnimation(framedY) {
    const startY = CAMERA_INTRO.startY ?? framedY;
    const startZ = CAMERA_INTRO.startZ ?? 0;
    const startLookAt = new THREE.Vector3(0, 0, 0);
    const endPos = new THREE.Vector3(
      CAMERA_INTRO.endPosition.x,
      CAMERA_INTRO.endPosition.y,
      CAMERA_INTRO.endPosition.z
    );
    const endLookAt = new THREE.Vector3(
      CAMERA_INTRO.endTarget.x,
      CAMERA_INTRO.endTarget.y,
      CAMERA_INTRO.endTarget.z
    );

    camera.position.set(0, startY, startZ);
    camera.lookAt(startLookAt);
    controls.target.copy(startLookAt);

    introAnimation = {
      startPos: new THREE.Vector3(0, startY, startZ),
      endPos,
      startLookAt,
      endLookAt,
      createdAt: performance.now(),
      delay: CAMERA_INTRO.delay * 1000,
      duration: CAMERA_INTRO.duration * 1000,
    };
  }

  function loadModel(name, { silent = false } = {}) {
    const id = ++loadId;

    return new Promise((resolve, reject) => {
      if (!silent) loading?.begin("model");

      loader.load(
        `./glb/${name}.glb`,
        (gltf) => {
          if (id !== loadId) {
            if (!silent) loading?.end("model");
            resolve(null);
            return;
          }

          if (currentModel) {
            scene.remove(currentModel);
            disposeModel(currentModel);
            currentModel = null;
          }

          const model = gltf.scene;
          currentModel = model;
          scene.add(model);

          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          model.position.sub(center);

          model.traverse((o) => {
            if (o.isMesh && o.material) {
              o.material.envMapIntensity = 1.0;
              o.material.needsUpdate = true;
            }
          });

          onModelLoaded?.(model);
          const framedY = frameCamera(size);
          startIntroAnimation(framedY);

          if (!silent) loading?.end("model");
          resolve(model);
        },
        (xhr) => {
          if (!silent && xhr.total) {
            loading?.setProgress(xhr.loaded / xhr.total);
          }
        },
        (err) => {
          if (id === loadId && !silent) loading?.end("model");
          console.error(err);
          reject(err);
        }
      );
    });
  }

  function updateIntro() {
    if (!introAnimation) return;
    const { startPos, endPos, startLookAt, endLookAt, createdAt, delay, duration } =
      introAnimation;
    const elapsed = performance.now() - createdAt;

    if (elapsed < delay) {
      camera.position.copy(startPos);
      controls.target.copy(startLookAt);
      camera.lookAt(startLookAt);
      return;
    }

    const t = Math.min(1, (elapsed - delay) / duration);
    const eased = easeOutCubic(t);

    camera.position.lerpVectors(startPos, endPos, eased);
    controls.target.lerpVectors(startLookAt, endLookAt, eased);
    camera.lookAt(controls.target);

    if (t >= 1) introAnimation = null;
  }

  return {
    loadModel,
    updateIntro,
    isIntroActive: () => introAnimation !== null,
    getCurrentModel: () => currentModel,
  };
}
