import { Pane } from "tweakpane";
import { getEnvPath, params } from "./config.js";
import { setupSceneTabUI } from "./ui/sceneTabUI.js";
import { setupPaneToggle } from "./ui/paneToggle.js";
import { createSidePanel } from "./ui/sidePanel.js";

export function createUI(ctx) {
  const { loadEnvironment, scene, renderer, light, ambient } = ctx;

  function reloadEnvironment(opts) {
    const path = getEnvPath(params.environment);
    if (path) return loadEnvironment(path, opts);
    return Promise.resolve();
  }

  const { panel, scroll, toggleBtn } = createSidePanel();
  const pane = new Pane({ title: "Controls", container: scroll });
  setupPaneToggle({ panel, toggleBtn });

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (isMobile) pane.expanded = false;

  const sceneTab = setupSceneTabUI(pane, {
    loadEnvironment,
    scene,
    renderer,
    light,
    ambient,
    reloadEnvironment,
  });

  function refresh() {
    pane.refresh();
    sceneTab.setupEnvironmentControl();
  }

  return { pane, refresh, reloadEnvironment };
}
