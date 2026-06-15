import * as THREE from "three";
import { params } from "./config.js";

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _move = new THREE.Vector3();

function isTyping() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function createNavigation({ camera, controls }) {
  const keys = { w: false, a: false, s: false, d: false, shift: false };

  function onKeyDown(e) {
    if (isTyping()) return;

    if (e.key === "Shift") {
      keys.shift = true;
      return;
    }

    const key = e.key.toLowerCase();
    if (!(key in keys)) return;

    keys[key] = true;
    e.preventDefault();
  }

  function onKeyUp(e) {
    if (e.key === "Shift") {
      keys.shift = false;
      return;
    }

    const key = e.key.toLowerCase();
    if (!(key in keys)) return;

    keys[key] = false;
    e.preventDefault();
  }

  function onBlur() {
    for (const key in keys) keys[key] = false;
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);

  function update(delta) {
    const speed = params.navigationSensitivity * delta;
    const moveHorizontal =
      (keys.w && !keys.shift) || (keys.s && !keys.shift) || keys.a || keys.d;
    const moveUp = keys.w && keys.shift;
    const moveDown = keys.s && keys.shift;

    if (!moveHorizontal && !moveUp && !moveDown) return;

    if (moveHorizontal) {
      camera.getWorldDirection(_forward);
      _forward.y = 0;
      if (_forward.lengthSq() >= 1e-6) {
        _forward.normalize();
        _right.crossVectors(_forward, camera.up).normalize();

        _move.set(0, 0, 0);
        if (keys.w && !keys.shift) _move.add(_forward);
        if (keys.s && !keys.shift) _move.sub(_forward);
        if (keys.d) _move.add(_right);
        if (keys.a) _move.sub(_right);

        if (_move.lengthSq() > 0) {
          _move.normalize().multiplyScalar(speed);
          camera.position.add(_move);
          controls.target.add(_move);
        }
      }
    }

    if (moveUp || moveDown) {
      const dy = (moveUp ? 1 : 0) + (moveDown ? -1 : 0);
      camera.position.y += dy * speed;
      controls.target.y += dy * speed;
    }
  }

  function dispose() {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  }

  return { update, dispose };
}
