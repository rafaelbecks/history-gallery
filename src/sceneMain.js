import * as THREE from "three";
import { createSceneSystem } from "./scene.js";
import { createModelLoader } from "./modelLoader.js";
import { createUI } from "./ui.js";
import { createLoading } from "./ui/loading.js";
import { createNavigation } from "./navigation.js";
import { createCameraDebug } from "./cameraDebug.js";
import { createPaintingSystem } from "./paintings/paintingSystem.js";
import { createArtworkNav } from "./ui/artworkNav.js";
import { createArtworkFicha } from "./ui/artworkFicha.js";
import { getSlotNavNumber } from "./paintings/artworksConfig.js";
import { DEFAULT_MODEL } from "./config.js";

export async function bootGalleryViewer() {
  const loading = createLoading();
  const sceneSystem = createSceneSystem({ loading });
  const { scene, camera, renderer, controls, light, ambient, loadEnvironment } = sceneSystem;

  const paintingSystem = createPaintingSystem({
    camera,
    controls,
    domElement: renderer.domElement,
  });

  const modelLoader = createModelLoader({
    scene,
    camera,
    controls,
    loading,
    onModelLoaded: (model) => paintingSystem.init(model),
  });

  const ui = createUI({
    loadEnvironment,
    scene,
    renderer,
    light,
    ambient,
  });

  const ficha = createArtworkFicha();

  const nav = createArtworkNav({
    onPrev: () => {
      if (!modelLoader.isIntroActive()) paintingSystem.goPrev();
    },
    onNext: () => {
      if (!modelLoader.isIntroActive()) paintingSystem.goNext();
    },
  });

  paintingSystem.on("slotChange", ({ index, slot }) => {
    ficha.hide();

    const total = paintingSystem.getSlots().length;
    const title = slot?.artwork?.title;
    const wallNum = slot ? getSlotNavNumber(slot.group, slot.index) : null;
    const wallLabel = wallNum ? `#${wallNum}` : "";
    if (title) {
      nav.setLabel(`${title} (${index + 1}/${total})`);
    } else {
      nav.setLabel(wallLabel ? `${wallLabel} · ${index + 1} / ${total}` : `${index + 1} / ${total}`);
    }
  });

  paintingSystem.on("arrived", ({ slot }) => {
    if (slot?.artwork) ficha.show(slot.artwork);
    else ficha.hide();
  });

  paintingSystem.on("select", ({ artwork }) => {
    ficha.show(artwork);
  });

  const clock = new THREE.Clock();
  const navigation = createNavigation({ camera, controls });
  const cameraDebug = createCameraDebug({ camera, controls });

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    modelLoader.updateIntro();
    paintingSystem.update();
    if (!paintingSystem.isTransitioning()) navigation.update(delta);
    controls.update();
    cameraDebug.update();
    renderer.render(scene, camera);
  }

  await Promise.all([modelLoader.loadModel(DEFAULT_MODEL), ui.reloadEnvironment()]);

  const total = paintingSystem.getSlots().length;
  if (total) nav.setLabel(`— / ${total}`);

  animate();
}
