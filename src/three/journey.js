/**
 * Shared state between the scroll trigger and the camera, plus the
 * narrative timeline. The pinned section maps its travel to progress
 * 0 → 1; every world system (weather, water, structures, typography)
 * reads that single number and resolves it through named BEATS, so
 * the whole site stays in sync without events or React re-renders.
 */

/** @type {{progress: number}} written by ScrollTrigger, read per frame */
export const journeyState = { progress: 0 };

// dev hook: QA scripts read the live progress directly
if (import.meta.env.DEV) {
  window.__journey = journeyState;
}

const START_Z = 16;
const END_Z = -365;

/**
 * Narrative beats as [start, end] fractions of the journey. World
 * zones are positioned so a beat boundary in scroll time is also a
 * boundary in world space (see PATH_KEYS).
 */
export const BEATS = {
  intro: [0, 0.03],        // entry push into the forest
  alive: [0.03, 0.13],     // wildlife, exploration
  clearing: [0.13, 0.18],  // identity reveal
  rain: [0.18, 0.26],      // weather turns, rain builds
  storm: [0.26, 0.31],     // full storm, thunder
  flood: [0.31, 0.36],     // water rises to the camera
  underwater: [0.36, 0.44], // submerged, dreamlike
  transform: [0.44, 0.5],  // nature → intelligence
  projects: [0.5, 0.63],   // computation world, discoveries
  research: [0.63, 0.7],   // roots become networks
  astra: [0.7, 0.82],      // organic → engineered
  human: [0.82, 0.9],      // quiet, nature returns
  ending: [0.9, 1],        // calm forest, final reveal
};

/**
 * Progress → local 0..1 within a beat. Outside the beat it clamps
 * (0 before, 1 after), so systems can also test "have we passed it".
 *
 * @param {keyof typeof BEATS} name
 * @param {number} [p] journey progress
 * @returns {number}
 */
export function beat(name, p = journeyState.progress) {
  const [a, b] = BEATS[name];
  return Math.max(0, Math.min(1, (p - a) / (b - a)));
}

/**
 * 1 inside the beat, falling to 0 at both edges over `soft` travel —
 * for overlays that should only exist while a beat is on screen.
 *
 * @param {keyof typeof BEATS} name
 * @param {number} [soft] fade width in journey fractions
 * @param {number} [p]
 * @returns {number}
 */
export function inBeat(name, soft = 0.012, p = journeyState.progress) {
  const [a, b] = BEATS[name];
  const inS = a === 0 ? 1 : Math.min(1, (p - a) / soft);
  const outS = b === 1 ? 1 : Math.min(1, (b - p) / soft);
  return Math.max(0, Math.min(Math.min(inS, outS), 1));
}

// world z at each beat boundary: piecewise linear so scroll time and
// world distance stay proportional per beat (holds come from the
// beat's share of the scroll, not from camera easing)
const PATH_KEYS = [
  [0, START_Z],
  [0.03, 6],
  [0.13, -55],
  [0.18, -70],
  [0.26, -95],
  [0.31, -115],
  [0.36, -135],
  [0.44, -165],
  [0.5, -185],
  [0.63, -225],
  [0.7, -250],
  [0.82, -300],
  [0.9, -335],
  [1, END_Z],
];

/**
 * Camera z at scroll progress t (piecewise linear, clamped).
 *
 * @param {number} t scroll progress (0..1)
 * @returns {number}
 */
export function pathZ(t) {
  const c = Math.max(0, Math.min(1, t));
  for (let i = 1; i < PATH_KEYS.length; i += 1) {
    const [p1, z1] = PATH_KEYS[i];
    if (c <= p1) {
      const [p0, z0] = PATH_KEYS[i - 1];
      const u = (c - p0) / (p1 - p0);
      return z0 + (z1 - z0) * u;
    }
  }
  return END_Z;
}

/**
 * Camera path through the world at scroll progress t. The walk
 * wanders on an S-curve through the living forest, straightens as the
 * world turns engineered (precision), and drifts again when nature
 * returns at the end. Clamped: tangent sampling relies on the holds.
 *
 * @param {number} t scroll progress (0..1, safe outside for derivatives)
 * @returns {{x: number, z: number}}
 */
export function pathAt(t) {
  const c = Math.max(0, Math.min(1, t));
  const z = pathZ(c);

  // forest wander: authored S-curve over the first half of the walk
  const forest = Math.sin(c * Math.PI * 1.8) * (1 - c) * (1 - c) * 1.6;
  // engineered zones: dead centre (paths become geometric)
  const straight = 1 - smooth(0.44, 0.6, c) + 0.15 * smooth(0.68, 0.74, c);
  // nature returns: the path breathes again
  const returnDrift =
    Math.sin((c - 0.84) * Math.PI * 2.4) * smooth(0.84, 0.9, c) * (1 - smooth(0.97, 1, c)) * 1.1;

  const x = forest * Math.max(0, Math.min(1, straight)) + returnDrift;
  return { x, z };
}

/**
 * Smoothstep — local copy so journey.js stays dependency-free of the
 * render utils (both must agree; see utils.smoothstep).
 *
 * @param {number} e0
 * @param {number} e1
 * @param {number} x
 * @returns {number}
 */
function smooth(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
