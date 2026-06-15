import * as THREE from "three";

const _center = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _v0 = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

export function getPaintingCameraPose(mesh, distance = 2.2) {
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
  mesh.geometry.boundingBox.getCenter(_center);
  mesh.localToWorld(_center);

  const pos = mesh.geometry.attributes.position;
  const idx = mesh.geometry.index;
  _v0.fromBufferAttribute(pos, idx.getX(0));
  _v1.fromBufferAttribute(pos, idx.getX(1));
  _v2.fromBufferAttribute(pos, idx.getX(2));
  _normal.subVectors(_v1, _v0).cross(new THREE.Vector3().subVectors(_v2, _v0)).normalize();
  _normal.transformDirection(mesh.matrixWorld);

  const position = _center.clone().add(_normal.multiplyScalar(distance));
  return {
    position,
    target: _center.clone(),
  };
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
