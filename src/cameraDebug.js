import { params } from "./config.js";

function fmt(v) {
  return `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`;
}

export function createCameraDebug({ camera, controls }) {
  const el = document.createElement("div");
  el.id = "camera-debug";
  el.hidden = true;
  document.body.appendChild(el);

  function update() {
    if (!params.debugCamera) {
      el.hidden = true;
      return;
    }

    el.hidden = false;
    const p = camera.position;
    const t = controls.target;
    el.innerHTML = `<strong>Camera</strong>
pos: ${fmt(p)}
target: ${fmt(t)}`;
  }

  function dispose() {
    el.remove();
  }

  return { update, dispose };
}
