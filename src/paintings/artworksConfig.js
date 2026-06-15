export const PAINTING_GROUPS = [
  {
    id: "PaitingsInside",
    meshName: "PaitingsInside_Painting_0",
    validSlots: [2, 8, 14, 20],
  },
  {
    id: "PaitingsInside.001",
    meshName: "PaitingsInside.001_Painting_0",
    validSlots: [],
  },
  {
    id: "PaitingsOutside",
    meshName: "PaitingsOutside_Painting_0",
    validSlots: [6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81],
  },
];

export const IMAGE_BASE = "./obras/image/";
export const FICHA_HTML_BASE = "./obras/html/";

export async function loadArtworksConfig() {
  const res = await fetch("./obras/artworks.json");
  if (!res.ok) throw new Error("Failed to load artworks.json");
  return res.json();
}

export function artworkKey(group, index) {
  return `${group}:${index}`;
}

export function buildArtworkLookup(artworks) {
  const bySlot = new Map();
  for (const artwork of artworks) {
    const key = artworkKey(artwork.slot.group, artwork.slot.index);
    bySlot.set(key, artwork);
  }
  return bySlot;
}

function isSlotInTour(groupDef, index) {
  if (groupDef.validSlots === null) return true;
  return groupDef.validSlots.includes(index);
}

export function buildTourSlots(allSlots) {
  return allSlots.filter((slot) => {
    const groupDef = PAINTING_GROUPS.find((g) => g.id === slot.group);
    if (!groupDef) return false;
    return isSlotInTour(groupDef, slot.index);
  });
}

export function getSlotNavNumber(group, index) {
  const groupDef = PAINTING_GROUPS.find((g) => g.id === group);
  if (!groupDef) return index + 1;
  if (groupDef.validSlots === null) return index + 1;
  const pos = groupDef.validSlots.indexOf(index);
  return pos === -1 ? null : groupDef.validSlots[pos] + 1;
}
