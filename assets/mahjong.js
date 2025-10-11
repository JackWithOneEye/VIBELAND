// ======================== UTILITIES ========================
function mulberry32(seed) {
  return function () {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ======================== LAYOUTS ========================
const LAYOUTS = {
  easy: [
    // Simple pyramid - 72 tiles
    { x: 7, y: 0, z: 0 }, { x: 9, y: 0, z: 0 }, { x: 11, y: 0, z: 0 }, { x: 13, y: 0, z: 0 }, { x: 15, y: 0, z: 0 }, { x: 17, y: 0, z: 0 },
    { x: 5, y: 2, z: 0 }, { x: 7, y: 2, z: 0 }, { x: 9, y: 2, z: 0 }, { x: 11, y: 2, z: 0 }, { x: 13, y: 2, z: 0 }, { x: 15, y: 2, z: 0 }, { x: 17, y: 2, z: 0 }, { x: 19, y: 2, z: 0 },
    { x: 5, y: 4, z: 0 }, { x: 7, y: 4, z: 0 }, { x: 9, y: 4, z: 0 }, { x: 11, y: 4, z: 0 }, { x: 13, y: 4, z: 0 }, { x: 15, y: 4, z: 0 }, { x: 17, y: 4, z: 0 }, { x: 19, y: 4, z: 0 },
    { x: 5, y: 6, z: 0 }, { x: 7, y: 6, z: 0 }, { x: 9, y: 6, z: 0 }, { x: 11, y: 6, z: 0 }, { x: 13, y: 6, z: 0 }, { x: 15, y: 6, z: 0 }, { x: 17, y: 6, z: 0 }, { x: 19, y: 6, z: 0 },
    { x: 7, y: 8, z: 0 }, { x: 9, y: 8, z: 0 }, { x: 11, y: 8, z: 0 }, { x: 13, y: 8, z: 0 }, { x: 15, y: 8, z: 0 }, { x: 17, y: 8, z: 0 },
    { x: 7, y: 2, z: 1 }, { x: 9, y: 2, z: 1 }, { x: 11, y: 2, z: 1 }, { x: 13, y: 2, z: 1 }, { x: 15, y: 2, z: 1 }, { x: 17, y: 2, z: 1 },
    { x: 7, y: 4, z: 1 }, { x: 9, y: 4, z: 1 }, { x: 11, y: 4, z: 1 }, { x: 13, y: 4, z: 1 }, { x: 15, y: 4, z: 1 }, { x: 17, y: 4, z: 1 },
    { x: 7, y: 6, z: 1 }, { x: 9, y: 6, z: 1 }, { x: 11, y: 6, z: 1 }, { x: 13, y: 6, z: 1 }, { x: 15, y: 6, z: 1 }, { x: 17, y: 6, z: 1 },
    { x: 9, y: 3, z: 2 }, { x: 11, y: 3, z: 2 }, { x: 13, y: 3, z: 2 }, { x: 15, y: 3, z: 2 },
    { x: 9, y: 5, z: 2 }, { x: 11, y: 5, z: 2 }, { x: 13, y: 5, z: 2 }, { x: 15, y: 5, z: 2 },
    { x: 11, y: 3, z: 3 }, { x: 13, y: 3, z: 3 },
    { x: 11, y: 5, z: 3 }, { x: 13, y: 5, z: 3 },
    { x: 12, y: 4, z: 4 }
  ],
  normal: [
    // Classic turtle layout - 144 tiles
    { x: 0, y: 7, z: 0 }, { x: 2, y: 7, z: 0 }, { x: 28, y: 7, z: 0 }, { x: 30, y: 7, z: 0 },
    { x: 4, y: 1, z: 0 }, { x: 6, y: 1, z: 0 }, { x: 8, y: 1, z: 0 }, { x: 10, y: 1, z: 0 }, { x: 12, y: 1, z: 0 }, { x: 14, y: 1, z: 0 }, { x: 16, y: 1, z: 0 }, { x: 18, y: 1, z: 0 }, { x: 20, y: 1, z: 0 }, { x: 22, y: 1, z: 0 }, { x: 24, y: 1, z: 0 }, { x: 26, y: 1, z: 0 },
    { x: 6, y: 3, z: 0 }, { x: 8, y: 3, z: 0 }, { x: 10, y: 3, z: 0 }, { x: 12, y: 3, z: 0 }, { x: 14, y: 3, z: 0 }, { x: 16, y: 3, z: 0 }, { x: 18, y: 3, z: 0 }, { x: 20, y: 3, z: 0 }, { x: 22, y: 3, z: 0 }, { x: 24, y: 3, z: 0 },
    { x: 6, y: 5, z: 0 }, { x: 8, y: 5, z: 0 }, { x: 10, y: 5, z: 0 }, { x: 12, y: 5, z: 0 }, { x: 14, y: 5, z: 0 }, { x: 16, y: 5, z: 0 }, { x: 18, y: 5, z: 0 }, { x: 20, y: 5, z: 0 }, { x: 22, y: 5, z: 0 }, { x: 24, y: 5, z: 0 },
    { x: 6, y: 7, z: 0 }, { x: 8, y: 7, z: 0 }, { x: 10, y: 7, z: 0 }, { x: 12, y: 7, z: 0 }, { x: 14, y: 7, z: 0 }, { x: 16, y: 7, z: 0 }, { x: 18, y: 7, z: 0 }, { x: 20, y: 7, z: 0 }, { x: 22, y: 7, z: 0 }, { x: 24, y: 7, z: 0 },
    { x: 6, y: 9, z: 0 }, { x: 8, y: 9, z: 0 }, { x: 10, y: 9, z: 0 }, { x: 12, y: 9, z: 0 }, { x: 14, y: 9, z: 0 }, { x: 16, y: 9, z: 0 }, { x: 18, y: 9, z: 0 }, { x: 20, y: 9, z: 0 }, { x: 22, y: 9, z: 0 }, { x: 24, y: 9, z: 0 },
    { x: 6, y: 11, z: 0 }, { x: 8, y: 11, z: 0 }, { x: 10, y: 11, z: 0 }, { x: 12, y: 11, z: 0 }, { x: 14, y: 11, z: 0 }, { x: 16, y: 11, z: 0 }, { x: 18, y: 11, z: 0 }, { x: 20, y: 11, z: 0 }, { x: 22, y: 11, z: 0 }, { x: 24, y: 11, z: 0 },
    { x: 4, y: 13, z: 0 }, { x: 6, y: 13, z: 0 }, { x: 8, y: 13, z: 0 }, { x: 10, y: 13, z: 0 }, { x: 12, y: 13, z: 0 }, { x: 14, y: 13, z: 0 }, { x: 16, y: 13, z: 0 }, { x: 18, y: 13, z: 0 }, { x: 20, y: 13, z: 0 }, { x: 22, y: 13, z: 0 }, { x: 24, y: 13, z: 0 }, { x: 26, y: 13, z: 0 },
    { x: 8, y: 3, z: 1 }, { x: 10, y: 3, z: 1 }, { x: 12, y: 3, z: 1 }, { x: 14, y: 3, z: 1 }, { x: 16, y: 3, z: 1 }, { x: 18, y: 3, z: 1 }, { x: 20, y: 3, z: 1 }, { x: 22, y: 3, z: 1 },
    { x: 8, y: 5, z: 1 }, { x: 10, y: 5, z: 1 }, { x: 12, y: 5, z: 1 }, { x: 14, y: 5, z: 1 }, { x: 16, y: 5, z: 1 }, { x: 18, y: 5, z: 1 }, { x: 20, y: 5, z: 1 }, { x: 22, y: 5, z: 1 },
    { x: 8, y: 7, z: 1 }, { x: 10, y: 7, z: 1 }, { x: 12, y: 7, z: 1 }, { x: 14, y: 7, z: 1 }, { x: 16, y: 7, z: 1 }, { x: 18, y: 7, z: 1 }, { x: 20, y: 7, z: 1 }, { x: 22, y: 7, z: 1 },
    { x: 8, y: 9, z: 1 }, { x: 10, y: 9, z: 1 }, { x: 12, y: 9, z: 1 }, { x: 14, y: 9, z: 1 }, { x: 16, y: 9, z: 1 }, { x: 18, y: 9, z: 1 }, { x: 20, y: 9, z: 1 }, { x: 22, y: 9, z: 1 },
    { x: 8, y: 11, z: 1 }, { x: 10, y: 11, z: 1 }, { x: 12, y: 11, z: 1 }, { x: 14, y: 11, z: 1 }, { x: 16, y: 11, z: 1 }, { x: 18, y: 11, z: 1 }, { x: 20, y: 11, z: 1 }, { x: 22, y: 11, z: 1 },
    { x: 10, y: 5, z: 2 }, { x: 12, y: 5, z: 2 }, { x: 14, y: 5, z: 2 }, { x: 16, y: 5, z: 2 }, { x: 18, y: 5, z: 2 }, { x: 20, y: 5, z: 2 },
    { x: 10, y: 7, z: 2 }, { x: 12, y: 7, z: 2 }, { x: 14, y: 7, z: 2 }, { x: 16, y: 7, z: 2 }, { x: 18, y: 7, z: 2 }, { x: 20, y: 7, z: 2 },
    { x: 10, y: 9, z: 2 }, { x: 12, y: 9, z: 2 }, { x: 14, y: 9, z: 2 }, { x: 16, y: 9, z: 2 }, { x: 18, y: 9, z: 2 }, { x: 20, y: 9, z: 2 },
    { x: 12, y: 5, z: 3 }, { x: 14, y: 5, z: 3 }, { x: 16, y: 5, z: 3 }, { x: 18, y: 5, z: 3 },
    { x: 12, y: 7, z: 3 }, { x: 14, y: 7, z: 3 }, { x: 16, y: 7, z: 3 }, { x: 18, y: 7, z: 3 },
    { x: 12, y: 9, z: 3 }, { x: 14, y: 9, z: 3 }, { x: 16, y: 9, z: 3 }, { x: 18, y: 9, z: 3 },
    { x: 14, y: 7, z: 4 }, { x: 16, y: 7, z: 4 }
  ],
  hard: [
    // Extended pyramid - 144 tiles
    { x: 8, y: 0, z: 0 }, { x: 10, y: 0, z: 0 }, { x: 12, y: 0, z: 0 }, { x: 14, y: 0, z: 0 }, { x: 16, y: 0, z: 0 }, { x: 18, y: 0, z: 0 }, { x: 20, y: 0, z: 0 }, { x: 22, y: 0, z: 0 },
    { x: 6, y: 2, z: 0 }, { x: 8, y: 2, z: 0 }, { x: 10, y: 2, z: 0 }, { x: 12, y: 2, z: 0 }, { x: 14, y: 2, z: 0 }, { x: 16, y: 2, z: 0 }, { x: 18, y: 2, z: 0 }, { x: 20, y: 2, z: 0 }, { x: 22, y: 2, z: 0 }, { x: 24, y: 2, z: 0 },
    { x: 6, y: 4, z: 0 }, { x: 8, y: 4, z: 0 }, { x: 10, y: 4, z: 0 }, { x: 12, y: 4, z: 0 }, { x: 14, y: 4, z: 0 }, { x: 16, y: 4, z: 0 }, { x: 18, y: 4, z: 0 }, { x: 20, y: 4, z: 0 }, { x: 22, y: 4, z: 0 }, { x: 24, y: 4, z: 0 },
    { x: 6, y: 6, z: 0 }, { x: 8, y: 6, z: 0 }, { x: 10, y: 6, z: 0 }, { x: 12, y: 6, z: 0 }, { x: 14, y: 6, z: 0 }, { x: 16, y: 6, z: 0 }, { x: 18, y: 6, z: 0 }, { x: 20, y: 6, z: 0 }, { x: 22, y: 6, z: 0 }, { x: 24, y: 6, z: 0 },
    { x: 6, y: 8, z: 0 }, { x: 8, y: 8, z: 0 }, { x: 10, y: 8, z: 0 }, { x: 12, y: 8, z: 0 }, { x: 14, y: 8, z: 0 }, { x: 16, y: 8, z: 0 }, { x: 18, y: 8, z: 0 }, { x: 20, y: 8, z: 0 }, { x: 22, y: 8, z: 0 }, { x: 24, y: 8, z: 0 },
    { x: 8, y: 10, z: 0 }, { x: 10, y: 10, z: 0 }, { x: 12, y: 10, z: 0 }, { x: 14, y: 10, z: 0 }, { x: 16, y: 10, z: 0 }, { x: 18, y: 10, z: 0 }, { x: 20, y: 10, z: 0 }, { x: 22, y: 10, z: 0 },
    { x: 8, y: 2, z: 1 }, { x: 10, y: 2, z: 1 }, { x: 12, y: 2, z: 1 }, { x: 14, y: 2, z: 1 }, { x: 16, y: 2, z: 1 }, { x: 18, y: 2, z: 1 }, { x: 20, y: 2, z: 1 }, { x: 22, y: 2, z: 1 },
    { x: 8, y: 4, z: 1 }, { x: 10, y: 4, z: 1 }, { x: 12, y: 4, z: 1 }, { x: 14, y: 4, z: 1 }, { x: 16, y: 4, z: 1 }, { x: 18, y: 4, z: 1 }, { x: 20, y: 4, z: 1 }, { x: 22, y: 4, z: 1 },
    { x: 8, y: 6, z: 1 }, { x: 10, y: 6, z: 1 }, { x: 12, y: 6, z: 1 }, { x: 14, y: 6, z: 1 }, { x: 16, y: 6, z: 1 }, { x: 18, y: 6, z: 1 }, { x: 20, y: 6, z: 1 }, { x: 22, y: 6, z: 1 },
    { x: 8, y: 8, z: 1 }, { x: 10, y: 8, z: 1 }, { x: 12, y: 8, z: 1 }, { x: 14, y: 8, z: 1 }, { x: 16, y: 8, z: 1 }, { x: 18, y: 8, z: 1 }, { x: 20, y: 8, z: 1 }, { x: 22, y: 8, z: 1 },
    { x: 10, y: 3, z: 2 }, { x: 12, y: 3, z: 2 }, { x: 14, y: 3, z: 2 }, { x: 16, y: 3, z: 2 }, { x: 18, y: 3, z: 2 }, { x: 20, y: 3, z: 2 },
    { x: 10, y: 5, z: 2 }, { x: 12, y: 5, z: 2 }, { x: 14, y: 5, z: 2 }, { x: 16, y: 5, z: 2 }, { x: 18, y: 5, z: 2 }, { x: 20, y: 5, z: 2 },
    { x: 10, y: 7, z: 2 }, { x: 12, y: 7, z: 2 }, { x: 14, y: 7, z: 2 }, { x: 16, y: 7, z: 2 }, { x: 18, y: 7, z: 2 }, { x: 20, y: 7, z: 2 },
    { x: 12, y: 3, z: 3 }, { x: 14, y: 3, z: 3 }, { x: 16, y: 3, z: 3 }, { x: 18, y: 3, z: 3 },
    { x: 12, y: 5, z: 3 }, { x: 14, y: 5, z: 3 }, { x: 16, y: 5, z: 3 }, { x: 18, y: 5, z: 3 },
    { x: 12, y: 7, z: 3 }, { x: 14, y: 7, z: 3 }, { x: 16, y: 7, z: 3 }, { x: 18, y: 7, z: 3 },
    { x: 14, y: 4, z: 4 }, { x: 16, y: 4, z: 4 },
    { x: 14, y: 6, z: 4 }, { x: 16, y: 6, z: 4 }
  ]
};

// ======================== SLOT LOGIC ========================
function precomputeRelations(slots) {
  for (let i = 0; i < slots.length; i++) {
    const a = slots[i];
    a.above = [];
    a.leftBlocking = [];
    a.rightBlocking = [];

    for (let j = 0; j < slots.length; j++) {
      if (i === j) continue;
      const b = slots[j];

      if (b.z === a.z + 1) {
        const overlaps = !(b.x + 2 <= a.x || b.x >= a.x + 2 || b.y + 2 <= a.y || b.y >= a.y + 2);
        if (overlaps) a.above.push(j);
      }

      if (b.z === a.z && !(b.y + 2 <= a.y || b.y >= a.y + 2)) {
        if (b.x === a.x - 2) a.leftBlocking.push(j);
        if (b.x === a.x + 2) a.rightBlocking.push(j);
      }
    }
  }
  return slots;
}

function isFreeSlot(idx, occupied, slots) {
  // occupied should be array-like where truthy means tile present
  if (!occupied[idx]) return false;
  const slot = slots[idx];
  if (slot.above.some(i => occupied[i])) return false;
  const leftBlocked = slot.leftBlocking.some(i => occupied[i]);
  const rightBlocked = slot.rightBlocking.some(i => occupied[i]);
  return !leftBlocked || !rightBlocked;
}

function generateBoard(slots, difficulty, seed) {
  const rng = mulberry32(seed);
  const n = slots.length;

  const standardFaces = [
    ...Array.from({ length: 9 }, (_, i) => `bamboo-${i + 1}`),
    ...Array.from({ length: 9 }, (_, i) => `char-${i + 1}`),
    ...Array.from({ length: 9 }, (_, i) => `circle-${i + 1}`),
    "wind-east", "wind-south", "wind-west", "wind-north",
    "dragon-red", "dragon-green", "dragon-white"
  ];

  const tiles = [];
  const faceDeck = [];

  for (const face of standardFaces) {
    for (let i = 0; i < 4; i++) {
      faceDeck.push({ face, matchKey: face });
    }
  }

  const flowers = ["flower-1", "flower-2", "flower-3", "flower-4"];
  const extraTiles = n - 136;
  if (extraTiles > 0) {
    for (let i = 0; i < extraTiles; i++) {
      // use common flower match key so flowers can pair if needed
      faceDeck.push({ face: flowers[i % 4], matchKey: "flower" });
    }
  }

  for (let i = faceDeck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [faceDeck[i], faceDeck[j]] = [faceDeck[j], faceDeck[i]];
  }

  for (let i = 0; i < n; i++) {
    const { face, matchKey } = faceDeck[i];
    tiles.push({ slotId: i, face, matchKey });
  }

  return { tiles };
}

// ======================== SOLVER (kept but expensive) ========================
function solver(state, slots) {
  const visited = new Set();

  function dfs(occupied, tiles) {
    if (occupied.every(o => !o)) return [];

    const key = occupied.join("");
    if (visited.has(key)) return null;
    visited.add(key);

    const pairs = getAvailablePairs(occupied, tiles, slots);
    if (pairs.length === 0) return null;

    // Pick first matchKey with minimum pairs (MRV heuristic)
    const grouped = {};
    for (const [a, b] of pairs) {
      const mk = tiles.find(t => t.slotId === a).matchKey;
      if (!grouped[mk]) grouped[mk] = [];
      grouped[mk].push([a, b]);
    }

    const sortedKeys = Object.keys(grouped).sort((a, b) => grouped[a].length - grouped[b].length);

    for (const key of sortedKeys) {
      for (const [a, b] of grouped[key]) {
        const newOccupied = [...occupied];
        newOccupied[a] = 0;
        newOccupied[b] = 0;

        const result = dfs(newOccupied, tiles);
        if (result !== null) {
          return [[a, b], ...result];
        }
      }
    }

    return null;
  }

  const occupied = new Uint8Array(slots.length);
  state.tiles.forEach(t => occupied[t.slotId] = 1);

  return dfs(Array.from(occupied), state.tiles);
}

function getAvailablePairs(occupied, tiles, slots, slotToTileMap = null) {
  const free = [];
  for (let i = 0; i < slots.length; i++) {
    if (isFreeSlot(i, occupied, slots)) {
      free.push(i);
    }
  }

  const tileMap = slotToTileMap || new Map(tiles.map(t => [t.slotId, t]));

  const grouped = {};
  for (const slotId of free) {
    const tile = tileMap.get(slotId);
    if (!tile) continue;
    const mk = tile.matchKey;
    if (!grouped[mk]) grouped[mk] = [];
    grouped[mk].push(slotId);
  }

  const pairs = [];
  for (const mk in grouped) {
    const list = grouped[mk];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        pairs.push([list[i], list[j]]);
      }
    }
  }

  return pairs;
}

// ======================== FAST GREEDY SOLVER (used by hint/shuffle) ========================
// Try to construct a full removal plan quickly by randomized greedy selection.
// Returns an array of pairs [[a,b],...] or null if unable to find a full plan after attempts.
function findGreedySolution(state, slots, tries = 300) {
  const n = slots.length;
  // Build initial face inventory for quick tile lookup by slot
  const slotToTile = new Map();
  for (const t of state.tiles) slotToTile.set(t.slotId, { face: t.face, matchKey: t.matchKey });

  for (let attempt = 0; attempt < tries; attempt++) {
    // Create occupied array copy
    const occupied = new Array(n).fill(0);
    for (const t of state.tiles) occupied[t.slotId] = 1;

    const remainingMap = new Map(slotToTile); // clone
    const plan = [];
    // Use a simple RNG per attempt to randomize tie-breaking
    const seed = (Date.now() + attempt) & 0xFFFFFFFF;
    const rng = mulberry32(seed);

    let stuck = false;
    while (remainingMap.size > 0) {
      const pairs = getAvailablePairs(occupied, state.tiles, slots)
        .filter(([a, b]) => remainingMap.has(a) && remainingMap.has(b));

      if (pairs.length === 0) { stuck = true; break; }

      // group pairs by matchKey for variety (but pick uniformly among current pairs)
      const idx = Math.floor(rng() * pairs.length);
      const [a, b] = pairs[idx];

      plan.push([a, b]);

      // remove from occupied and map
      occupied[a] = 0;
      occupied[b] = 0;
      remainingMap.delete(a);
      remainingMap.delete(b);
    }

    if (!stuck) {
      // success
      return plan;
    }
    // otherwise try again
  }
  return null;
}

// ======================== GAME STATE ========================
let gameState = {
  tiles: [],
  slots: [],
  occupied: null,
  score: 0,
  moves: 0,
  selected: null,
  undoStack: [],
  startTime: Date.now(),
  timerInterval: null,
  difficulty: "easy",
  hintPair: null, // <-- persistent hint pair stored here (null when none)
  isAnimating: false
};

// ======================== RENDERING ========================
function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  const minX = Math.min(...gameState.slots.map(s => s.x));
  const maxX = Math.max(...gameState.slots.map(s => s.x));
  const minY = Math.min(...gameState.slots.map(s => s.y));
  const maxY = Math.max(...gameState.slots.map(s => s.y));

  const tileW = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tile-w"));
  const tileH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--tile-h"));
  const elevX = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--z-elev-x"));
  const elevY = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--z-elev-y"));

  const boardW = (maxX - minX) * (tileW / 2) + tileW + 100;
  const boardH = (maxY - minY) * (tileH / 2) + tileH + 100;

  board.style.width = boardW + "px";
  board.style.height = boardH + "px";

  const sortedTiles = [...gameState.tiles].sort((a, b) => {
    const slotA = gameState.slots[a.slotId];
    const slotB = gameState.slots[b.slotId];
    return (slotA.z * 10000 + slotA.y * 100 + slotA.x) - (slotB.z * 10000 + slotB.y * 100 + slotB.x);
  });

  for (const tile of sortedTiles) {
    const slot = gameState.slots[tile.slotId];
    const div = document.createElement("div");
    div.className = "tile";
    div.dataset.slotId = tile.slotId;

    const x = (slot.x - minX) * (tileW / 2) + slot.z * elevX;
    const y = (slot.y - minY) * (tileH / 2) - slot.z * elevY;
    const z = slot.z * 10000 + slot.y * 100 + slot.x;

    div.style.left = x + "px";
    div.style.top = y + "px";
    div.style.zIndex = z;

    const inner = document.createElement("div");
    inner.className = "tile-inner";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "tile-face");
    svg.setAttribute("viewBox", "0 0 100 120");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${tile.face}`);
    svg.appendChild(use);

    inner.appendChild(svg);
    div.appendChild(inner);
    board.appendChild(div);

    div.addEventListener("click", () => handleTileClick(tile.slotId));
  }

  // Re-apply hint visuals if a persistent hint is active and tiles still exist
  if (gameState.hintPair && Array.isArray(gameState.hintPair)) {
    const [hA, hB] = gameState.hintPair;
    const existsA = gameState.tiles.some(t => t.slotId === hA);
    const existsB = gameState.tiles.some(t => t.slotId === hB);
    if (existsA && existsB) {
      document.querySelectorAll(".tile.hint").forEach(t => t.classList.remove("hint"));
      document.querySelector(`.tile[data-slot-id="${hA}"]`)?.classList.add("hint");
      document.querySelector(`.tile[data-slot-id="${hB}"]`)?.classList.add("hint");
    } else {
      // If either tile no longer exists, clear the stored hint
      clearHintPair();
    }
  }

  updateFreeStatus();
  updateHUD();
}

function updateFreeStatus() {
  const n = gameState.slots.length;
  const occupied = new Uint8Array(n);
  gameState.tiles.forEach(t => occupied[t.slotId] = 1);

  document.querySelectorAll(".tile").forEach(tile => {
    const slotId = parseInt(tile.dataset.slotId);
    const free = isFreeSlot(slotId, occupied, gameState.slots);
    tile.classList.toggle("free", free);
    tile.classList.toggle("blocked", !free);
  });
}

function handleTileClick(slotId) {
  const tile = document.querySelector(`.tile[data-slot-id="${slotId}"]`);
  if (!tile || tile.classList.contains("blocked")) return;

  // If the player clicks one of the hinted tiles, we'll let normal selection/match logic run.
  // Persistent hint will be cleared automatically when the tiles are removed by matchTiles().

  if (gameState.selected === null) {
    gameState.selected = slotId;
    tile.classList.add("selected");
  } else if (gameState.selected === slotId) {
    gameState.selected = null;
    tile.classList.remove("selected");
  } else {
    const tile1 = gameState.tiles.find(t => t.slotId === gameState.selected);
    const tile2 = gameState.tiles.find(t => t.slotId === slotId);

    if (tile1.matchKey === tile2.matchKey) {
      matchTiles(gameState.selected, slotId);
    } else {
      document.querySelector(`.tile[data-slot-id="${gameState.selected}"]`).classList.remove("selected");
      gameState.selected = slotId;
      tile.classList.add("selected");
    }
  }
}

function matchTiles(slotA, slotB) {
  const tileA = document.querySelector(`.tile[data-slot-id="${slotA}"]`);
  const tileB = document.querySelector(`.tile[data-slot-id="${slotB}"]`);

  gameState.undoStack.push({
    tiles: [
      gameState.tiles.find(t => t.slotId === slotA),
      gameState.tiles.find(t => t.slotId === slotB)
    ],
    score: gameState.score,
    moves: gameState.moves
  });

  gameState.isAnimating = true;
  const undoBtn = document.getElementById("undo");
  if (undoBtn) undoBtn.disabled = true;

  tileA.classList.add("matching");
  tileB.classList.add("matching");

  setTimeout(() => {
    gameState.tiles = gameState.tiles.filter(t => t.slotId !== slotA && t.slotId !== slotB);
    gameState.selected = null;
    gameState.score += 100;
    gameState.moves++;

    // If these were the hinted tiles, clear the hint
    if (gameState.hintPair) {
      const [hA, hB] = gameState.hintPair;
      if (hA === slotA || hA === slotB || hB === slotA || hB === slotB) {
        clearHintPair();
      }
    }

    gameState.isAnimating = false;

    renderBoard();
    checkWinCondition();
  }, 400);
}

function clearHintPair() {
  gameState.hintPair = null;
  document.querySelectorAll(".tile.hint").forEach(t => t.classList.remove("hint"));
}

function checkWinCondition() {
  if (gameState.tiles.length === 0) {
    showMessage("🎉 You Win! 🎉<br>Score: " + gameState.score);
    if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  } else {
    const pairs = getAvailablePairs(
      gameState.tiles.reduce((acc, t) => {
        acc[t.slotId] = 1;
        return acc;
      }, new Array(gameState.slots.length).fill(0)),
      gameState.tiles,
      gameState.slots
    );

    if (pairs.length === 0) {
      showMessage("No more moves! Try shuffling or start a new game.");
    }
  }
}

function showMessage(text) {
  const msg = document.getElementById("message");
  if (!msg) return;
  msg.innerHTML = text;
  msg.classList.add("show");
  setTimeout(() => msg.classList.remove("show"), 3000);
}

function updateHUD() {
  const scoreEl = document.getElementById("score");
  const movesEl = document.getElementById("moves");
  const pairsLeftEl = document.getElementById("pairs-left");
  const availablePairsEl = document.getElementById("available-pairs");
  const undoBtn = document.getElementById("undo");
  if (scoreEl) scoreEl.textContent = gameState.score;
  if (movesEl) movesEl.textContent = gameState.moves;
  if (pairsLeftEl) pairsLeftEl.textContent = Math.floor(gameState.tiles.length / 2);
  
  if (availablePairsEl) {
    const occupied = new Array(gameState.slots.length).fill(0);
    gameState.tiles.forEach(t => occupied[t.slotId] = 1);
    const availablePairs = getAvailablePairs(occupied, gameState.tiles, gameState.slots);
    availablePairsEl.textContent = availablePairs.length;
  }
  
  if (undoBtn) undoBtn.disabled = gameState.undoStack.length === 0;
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timerEl = document.getElementById("timer");
  if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ======================== CONTROLS ========================
const newGameBtn = document.getElementById("new-game");
if (newGameBtn) {
  newGameBtn.addEventListener("click", () => {
    initGame(gameState.difficulty);
  });
}

const hintBtn = document.getElementById("hint");
if (hintBtn) {
  hintBtn.addEventListener("click", () => {
  if (gameState.tiles.length === 0) return;

  // If we already have a persistent hint and both tiles still exist, keep it (do nothing).
  if (gameState.hintPair) {
    const [hA, hB] = gameState.hintPair;
    const existsA = gameState.tiles.some(t => t.slotId === hA);
    const existsB = gameState.tiles.some(t => t.slotId === hB);
    if (existsA && existsB) {
      // refresh visuals (reapply classes) and return
      document.querySelectorAll(".tile.hint").forEach(t => t.classList.remove("hint"));
      document.querySelector(`.tile[data-slot-id="${hA}"]`)?.classList.add("hint");
      document.querySelector(`.tile[data-slot-id="${hB}"]`)?.classList.add("hint");
      // optionally penalize again? we'll not penalize twice for repeated clicks
      return;
    } else {
      // Clear invalid stored hint and continue to produce a new one
      clearHintPair();
    }
  }

  // FAST immediate hint: pick ANY available matching pair
  const occupied = new Array(gameState.slots.length).fill(0);
  gameState.tiles.forEach(t => occupied[t.slotId] = 1);

  const pairs = getAvailablePairs(occupied, gameState.tiles, gameState.slots);
  if (pairs.length === 0) {
    showMessage("No available pairs for a hint.");
    return;
  }

  // Prefer to highlight a random available pair
  const idx = Math.floor(Math.random() * pairs.length);
  const [a, b] = pairs[idx];

  // Store persistent hint
  gameState.hintPair = [a, b];

  document.querySelectorAll(".tile.hint").forEach(t => t.classList.remove("hint"));
  document.querySelector(`.tile[data-slot-id="${a}"]`)?.classList.add("hint");
  document.querySelector(`.tile[data-slot-id="${b}"]`)?.classList.add("hint");

  gameState.score = Math.max(0, gameState.score - 50);
  updateHUD();
  });
}

const shuffleBtn = document.getElementById("shuffle");
if (shuffleBtn) {
  shuffleBtn.addEventListener("click", () => {
  if (gameState.tiles.length === 0) return;

  // Try to get a fast removal plan using greedy randomized attempts
  const plan = findGreedySolution(gameState, gameState.slots, 400);

  if (!plan || plan.length === 0) {
    showMessage("Cannot shuffle - no quick solvable plan found!");
    return;
  }

  // Collect current face inventory
  const faceInventory = {};
  gameState.tiles.forEach(t => {
    if (!faceInventory[t.matchKey]) faceInventory[t.matchKey] = [];
    faceInventory[t.matchKey].push(t.face);
  });

  // Reassign faces based on the solution pairs
  const rng = Math.random;
  const newTiles = [];
  for (const [slotA, slotB] of plan) {
    // Find a matchKey with at least 2 tiles left
    const availableKeys = Object.keys(faceInventory).filter(k => faceInventory[k].length >= 2);
    if (availableKeys.length === 0) break;

    const matchKey = availableKeys[Math.floor(rng() * availableKeys.length)];
    const face1 = faceInventory[matchKey].pop();
    const face2 = faceInventory[matchKey].pop();

    newTiles.push({ slotId: slotA, face: face1, matchKey });
    newTiles.push({ slotId: slotB, face: face2, matchKey });
  }

  // If reassigning failed to assign all tiles (shouldn't often happen), fallback: preserve old tiles
  if (newTiles.length !== gameState.tiles.length) {
    showMessage("Shuffle incomplete; keeping previous tile faces.");
    return;
  }

  // Clear any persistent hint when shuffling
  clearHintPair();

  gameState.tiles = newTiles;
  gameState.score = Math.max(0, gameState.score - 100);
  gameState.selected = null;
  renderBoard();
  showMessage("Tiles shuffled!");
  });
}

const undoBtn = document.getElementById("undo");
if (undoBtn) {
  undoBtn.addEventListener("click", () => {
  if (gameState.isAnimating) return;
  if (gameState.undoStack.length === 0) return;

  const prev = gameState.undoStack.pop();
  gameState.tiles.push(...prev.tiles);
  gameState.score = prev.score;
  gameState.moves = prev.moves;
  gameState.selected = null;

  // After undo, previously cleared hint probably invalid — clear it to avoid misleading highlight
  clearHintPair();

  renderBoard();
  });
}

document.querySelectorAll(".diff-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    initGame(btn.dataset.diff);
  });
});

// ======================== INITIALIZATION ========================
function initGame(difficulty) {
  gameState.difficulty = difficulty;
  const layout = LAYOUTS[difficulty];
  gameState.slots = precomputeRelations(JSON.parse(JSON.stringify(layout)));

  const seed = Math.floor(Math.random() * 1000000);
  const result = generateBoard(gameState.slots, difficulty, seed);

  if (!result) {
    console.error("Failed to generate board");
    return;
  }

  gameState.tiles = result.tiles;
  gameState.score = 0;
  gameState.moves = 0;
  gameState.selected = null;
  gameState.undoStack = [];
  gameState.startTime = Date.now();
  gameState.hintPair = null; // clear any hint when starting a new game

  if (gameState.timerInterval) clearInterval(gameState.timerInterval);
  gameState.timerInterval = setInterval(updateTimer, 1000);

  renderBoard();
}

// Wait for SVG to load before starting game
window.addEventListener("load", () => {
  initGame("easy");
});

