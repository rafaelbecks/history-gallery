import { DEFAULT_HDR_ENV, HDR_ENVIRONMENTS, getEnvOptions, params } from "../config.js";

/**
 * Environment and lighting controls only.
 * @returns {{ setupEnvironmentControl }}
 */
export function setupSceneTabUI(pane, ctx) {
  const { scene, renderer, light, ambient } = ctx;

  let envBinding;

  function reloadEnvironment() {
    ctx.reloadEnvironment();
  }

  function setupEnvironmentControl() {
    if (!HDR_ENVIRONMENTS[params.environment]) {
      params.environment = DEFAULT_HDR_ENV;
    }
    if (envBinding) envBinding.dispose();
    envBinding = envFolder
      .addBinding(params, "environment", { options: getEnvOptions() })
      .on("change", reloadEnvironment);
  }

  const envFolder = pane.addFolder({ title: "Environment", expanded: true });

  setupEnvironmentControl();

  envFolder.addBinding(scene, "environmentIntensity", {
    label: "intensity",
    min: 0,
    max: 5,
    step: 0.01,
  });

  envFolder.addBinding(scene.environmentRotation, "y", {
    label: "rotation Y",
    min: -Math.PI,
    max: Math.PI,
    step: 0.01,
  });

  envFolder.addBinding(params, "bgBlur", { label: "bg blur", min: 0, max: 1, step: 0.01 }).on(
    "change",
    (e) => {
      scene.backgroundBlurriness = e.value;
    }
  );

  const lightingFolder = pane.addFolder({ title: "Lighting", expanded: true });

  lightingFolder.addBinding(params, "lightIntensity", { label: "directional", min: 0, max: 5 }).on(
    "change",
    (e) => {
      light.intensity = e.value;
    }
  );

  lightingFolder.addBinding(params, "ambient", { min: 0, max: 2 }).on("change", (e) => {
    ambient.intensity = e.value;
  });

  lightingFolder.addBinding(params, "exposure", { min: 0.1, max: 3 }).on("change", (e) => {
    renderer.toneMappingExposure = e.value;
  });

  const navigationFolder = pane.addFolder({ title: "Navigation", expanded: true });

  navigationFolder.addBinding(params, "navigationSensitivity", {
    label: "sensitivity",
    min: 1,
    max: 200,
    step: 1,
  });

  const debugFolder = pane.addFolder({ title: "Debug", expanded: false });

  debugFolder.addBinding(params, "debugCamera", { label: "camera position" });

  return { setupEnvironmentControl };
}
