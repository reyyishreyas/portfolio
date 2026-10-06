/**
 * Shared state between the scroll trigger and the camera: the pinned
 * forest section maps its travel to progress 0 → 1, the camera reads
 * it every frame. pathAt() is the single source of truth for the walk
 * so later beats (tech emergence, the clearing) can line up with it.
 */

/** @type {{progress: number}} written by ScrollTrigger, read per frame */
export const journeyState = { progress: 0 };

const START_Z = 16;
const END_Z = -46;

/**
 * Camera path through the corridor at scroll progress t.
 * Clamped: beyond either end the position holds (tangent sampling
 * relies on that).
 *
 * @param {number} t scroll progress (0..1, safe outside for derivatives)
 * @returns {{x: number, z: number}}
 */
export function pathAt(t) {
  const c = Math.max(0, Math.min(1, t));
  const e = c * c * (3 - 2 * c);
  const z = START_Z + (END_Z - START_Z) * e;
  // S-curve drift that eases to dead centre with zero slope at the end,
  // so the walk finishes facing straight down the corridor
  const x = Math.sin(c * Math.PI * 1.8) * (1 - c) * (1 - c) * 1.6;
  return { x, z };
}
