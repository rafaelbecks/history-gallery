import { HDR_ENVIRONMENTS } from "./hdrEnvironments.generated.js";

export { HDR_ENVIRONMENTS };

export const DEFAULT_HDR_ENV = "qwantani_sunset_puresky_1k";
export const DEFAULT_MODEL = "art_gallery";

export function getEnvOptions() {
  return Object.fromEntries(
    Object.entries(HDR_ENVIRONMENTS).map(([id, { label }]) => [label, id])
  );
}

export function getEnvPath(envId) {
  const env = HDR_ENVIRONMENTS[envId];
  if (!env?.file) return null;
  return `./env/${env.file}`;
}

export const params = {
  lightIntensity: 2.8,
  ambient: 0,
  exposure: 0.7,
  environment: DEFAULT_HDR_ENV,
  bgBlur: 0,
  navigationSensitivity: 7,
  debugCamera: false,
};

/** Camera intro when the gallery loads. startY uses auto-framed height unless set. */
export const CAMERA_INTRO = {
  startY: null,
  startZ: 0,
  endPosition: { x: 0.56, y: -0.99, z: 0.23 },
  endTarget: { x: -4.66, y: -1.01, z: 0.46 },
  delay: 0.7,
  duration: 2.5,
};
