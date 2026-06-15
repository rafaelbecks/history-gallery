import * as THREE from "three";

function extractQuadGeometry(sourceGeom, quadIndex) {
  const indexAttr = sourceGeom.index;
  if (!indexAttr) throw new Error("Painting geometry must be indexed");

  const posAttr = sourceGeom.attributes.position;
  const uvAttr = sourceGeom.attributes.uv;
  const normalAttr = sourceGeom.attributes.normal;
  const triStart = quadIndex * 2;

  const vertexIndices = new Set();
  for (let t = 0; t < 2; t++) {
    for (let v = 0; v < 3; v++) {
      vertexIndices.add(indexAttr.getX((triStart + t) * 3 + v));
    }
  }

  const oldToNew = new Map();
  const positions = [];
  const uvs = [];
  const normals = [];
  const newIndices = [];
  let next = 0;

  for (const vi of [...vertexIndices].sort((a, b) => a - b)) {
    oldToNew.set(vi, next++);
    positions.push(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi));
    if (uvAttr) uvs.push(uvAttr.getX(vi), uvAttr.getY(vi));
    if (normalAttr) normals.push(normalAttr.getX(vi), normalAttr.getY(vi), normalAttr.getZ(vi));
  }

  for (let t = 0; t < 2; t++) {
    for (let v = 0; v < 3; v++) {
      const vi = indexAttr.getX((triStart + t) * 3 + v);
      newIndices.push(oldToNew.get(vi));
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (uvs.length) geom.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  if (normals.length) geom.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geom.setIndex(newIndices);
  geom.computeBoundingBox();
  geom.computeBoundingSphere();
  return geom;
}

export function splitPaintingMesh(mesh, groupId, validSlots) {
  const triCount = mesh.geometry.index.count / 3;
  const quadCount = triCount / 2;
  const showAll = validSlots === null;
  const validSet = showAll ? null : new Set(validSlots);
  const slots = [];

  for (let i = 0; i < quadCount; i++) {
    const geom = extractQuadGeometry(mesh.geometry, i);
    const material = mesh.material.clone();
    const slotMesh = new THREE.Mesh(geom, material);
    slotMesh.name = `${mesh.name}_slot_${i}`;
    slotMesh.userData.paintingGroup = groupId;
    slotMesh.userData.paintingIndex = i;
    slotMesh.visible = showAll || validSet.has(i);
    slots.push(slotMesh);
  }

  return slots;
}

export function replacePaintingMeshes(model, groups) {
  const allSlots = [];

  for (const group of groups) {
    const sourceMesh = model.getObjectByName(group.meshName);
    if (!sourceMesh?.isMesh) {
      console.warn(`Painting mesh not found: ${group.meshName}`);
      continue;
    }

    const parent = sourceMesh.parent ?? model;
    const slots = splitPaintingMesh(sourceMesh, group.id, group.validSlots);

    parent.remove(sourceMesh);
    sourceMesh.geometry.dispose();

    for (const slot of slots) {
      parent.add(slot);
      allSlots.push({
        group: group.id,
        index: slot.userData.paintingIndex,
        mesh: slot,
        artwork: null,
      });
    }
  }

  return allSlots;
}
