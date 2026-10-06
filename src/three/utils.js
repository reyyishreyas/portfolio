// Shared helpers for the procedural forest: seeded RNG, value noise,
// the ground-height function (used by both terrain mesh and object
// placement so nothing floats), and device quality detection.

/** Deterministic PRNG so the forest is identical on every visit.
 *  @param {number} seed
 *  @returns {() => number}
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 *  @param {number} v
 *  @param {number} min
 *  @param {number} max
 *  @returns {number}
 */
export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/**
 *  @param {number} edge0
 *  @param {number} edge1
 *  @param {number} x
 *  @returns {number}
 */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 *  @param {number} x
 *  @param {number} y
 *  @returns {number}
 */
function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/** Smooth 2D value noise in [0, 1].
 *  @param {number} x
 *  @param {number} y
 *  @returns {number}
 */
export function valueNoise2(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Fractal noise in [0, 1].
 * @param {number} x
 * @param {number} y
 * @param {number} octaves
 * @returns {number}
 */
export function fbm2(x, y, octaves = 3) {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise2(x * freq, y * freq) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return value / norm;
}

/**
 * Terrain height at any world position. The corridor around x = 0 is
 * flattened so the camera path never clips through the ground.
 *
 * @param {number} x
 * @param {number} z
 * @returns {number}
 */
export function groundHeight(x, z) {
  const base = fbm2(x * 0.045, z * 0.045, 3) * 2.4 - 1.0;
  const micro = (fbm2(x * 0.19, z * 0.19, 2) - 0.5) * 0.5;
  const corridor = smoothstep(1.2, 5.5, Math.abs(x));
  return (base + micro) * corridor;
}

/**
 * Pick rendering quality for the current device.
 *
 * @returns {{mode: 'fallback'} | {mode: 'full'|'lite', dpr: number[], shadows: boolean, grass: number, ferns: number, motes: number, treeFactor: number}}
 */
export function detectForestQuality() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let webgl = false;
  try {
    const probe = document.createElement('canvas');
    webgl = Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    // no WebGL available: webgl stays false
  }
  if (reduced || !webgl) return { mode: 'fallback' };

  const mobile = window.matchMedia('(max-width: 768px)').matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4;
  if (mobile || weak) {
    return { mode: 'lite', dpr: [1, 1.3], shadows: false, grass: 2600, ferns: 36, motes: 70, treeFactor: 0.45 };
  }
  return { mode: 'full', dpr: [1, 2], shadows: true, grass: 9000, ferns: 96, motes: 220, treeFactor: 1 };
}
