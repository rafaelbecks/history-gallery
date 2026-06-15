import { TextureLoader, SRGBColorSpace } from "three";
import { IMAGE_BASE } from "./artworksConfig.js";

const loader = new TextureLoader();

export function loadArtworkTexture(filename) {
  return new Promise((resolve, reject) => {
    loader.load(
      `${IMAGE_BASE}${filename}`,
      (texture) => {
        texture.colorSpace = SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

export async function applyArtworkTextures(slots, artworkBySlot) {
  const pending = [];

  for (const slot of slots) {
    const key = `${slot.group}:${slot.index}`;
    const artwork = artworkBySlot.get(key);
    if (!artwork) continue;

    slot.artwork = artwork;
    pending.push(
      loadArtworkTexture(artwork.image).then((texture) => {
        slot.mesh.material.map = texture;
        slot.mesh.material.needsUpdate = true;
      })
    );
  }

  await Promise.all(pending);
}
