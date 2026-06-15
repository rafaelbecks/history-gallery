import * as THREE from "three";
import {
  PAINTING_GROUPS,
  buildArtworkLookup,
  buildTourSlots,
  getSlotNavNumber,
  loadArtworksConfig,
} from "./artworksConfig.js";
import { replacePaintingMeshes } from "./splitPaintings.js";
import { applyArtworkTextures } from "./paintingTextures.js";
import { easeInOutCubic, getPaintingCameraPose } from "./paintingCamera.js";

const TOUR_DURATION = 1.4;

export function createPaintingSystem({ camera, controls, domElement }) {
  let slots = [];
  let currentIndex = -1;
  let transition = null;
  let enabled = false;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const listeners = { slotChange: [], arrived: [] };

  function emit(event, payload) {
    for (const fn of listeners[event] ?? []) fn(payload);
  }

  function on(event, fn) {
    listeners[event].push(fn);
    return () => {
      listeners[event] = listeners[event].filter((f) => f !== fn);
    };
  }

  function getMeshes() {
    return slots.map((s) => s.mesh);
  }

  function getCurrentSlot() {
    if (currentIndex < 0) return null;
    return slots[currentIndex] ?? null;
  }

  function isTransitioning() {
    return transition !== null;
  }

  function setControlsEnabled(value) {
    controls.enabled = value;
  }

  function getArtworkMeshes() {
    return slots.filter((s) => s.artwork).map((s) => s.mesh);
  }

  function finishTransition() {
    const slot = slots[currentIndex];
    emit("arrived", { index: currentIndex, slot });
  }

  function goToIndex(index, { smooth = true } = {}) {
    if (!slots.length) return;
    const next = ((index % slots.length) + slots.length) % slots.length;
    currentIndex = next;
    const slot = slots[currentIndex];
    slot.mesh.updateWorldMatrix(true, false);
    emit("slotChange", { index: currentIndex, slot });

    const pose = getPaintingCameraPose(slot.mesh);
    if (!smooth) {
      camera.position.copy(pose.position);
      controls.target.copy(pose.target);
      camera.lookAt(pose.target);
      finishTransition();
      return;
    }

    transition = {
      startPos: camera.position.clone(),
      endPos: pose.position,
      startTarget: controls.target.clone(),
      endTarget: pose.target,
      startedAt: performance.now(),
      duration: TOUR_DURATION * 1000,
    };
    setControlsEnabled(false);
  }

  function goNext() {
    if (isTransitioning()) return;
    goToIndex(currentIndex + 1);
  }

  function goPrev() {
    if (isTransitioning()) return;
    goToIndex(currentIndex - 1);
  }

  function update() {
    if (!transition) return;

    const t = Math.min(1, (performance.now() - transition.startedAt) / transition.duration);
    const eased = easeInOutCubic(t);

    camera.position.lerpVectors(transition.startPos, transition.endPos, eased);
    controls.target.lerpVectors(transition.startTarget, transition.endTarget, eased);
    camera.lookAt(controls.target);

    if (t >= 1) {
      transition = null;
      setControlsEnabled(true);
      finishTransition();
    }
  }

  function updateHoverCursor(clientX, clientY) {
    if (!enabled || isTransitioning()) {
      domElement.style.cursor = "";
      return;
    }

    const rect = domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(getArtworkMeshes(), false);
    domElement.style.cursor = hits.length ? "pointer" : "";
  }

  function onPointerMove(e) {
    updateHoverCursor(e.clientX, e.clientY);
  }

  function pick(clientX, clientY) {
    if (!enabled || !slots.length || isTransitioning()) return null;

    const rect = domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(getArtworkMeshes(), false);
    if (!hits.length) return null;

    const mesh = hits[0].object;
    const index = slots.findIndex((s) => s.mesh === mesh);
    if (index === -1) return null;

    const slot = slots[index];
    if (index === currentIndex && !isTransitioning()) {
      emit("arrived", { index, slot });
      return slot;
    }

    goToIndex(index);
    return slot;
  }

  function onPointerDown(e) {
    if (e.button !== 0) return;
    const slot = pick(e.clientX, e.clientY);
    if (slot) e.preventDefault();
  }

  async function init(model) {
    const config = await loadArtworksConfig();
    const artworkBySlot = buildArtworkLookup(config.artworks);

    const allSlots = replacePaintingMeshes(model, PAINTING_GROUPS);
    await applyArtworkTextures(allSlots, artworkBySlot);
    slots = buildTourSlots(allSlots);
    enabled = true;

    domElement.addEventListener("pointerdown", onPointerDown);
    domElement.addEventListener("pointermove", onPointerMove);
    return slots;
  }

  function dispose() {
    domElement.removeEventListener("pointerdown", onPointerDown);
    domElement.removeEventListener("pointermove", onPointerMove);
    domElement.style.cursor = "";
    slots = [];
    enabled = false;
    transition = null;
  }

  return {
    init,
    update,
    goNext,
    goPrev,
    goToIndex,
    getCurrentSlot,
    getSlots: () => slots,
    isTransitioning,
    on,
    dispose,
  };
}
