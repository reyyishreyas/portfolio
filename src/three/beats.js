// Event curves along the journey: named 0..1 amounts every world
// system reads. Kept out of component files so they can be exported
// without tripping fast-refresh rules, and so weather, water and
// audio all share the exact same timings.
import { smoothstep } from './utils';

/**
 * How hard it is raining: builds slowly after the clearing, holds
 * through storm and flood, stops the moment the water closes over.
 *
 * @param {number} p journey progress
 * @returns {number} 0..1
 */
export function rainAmount(p) {
  return smoothstep(0.185, 0.235, p) * (1 - smoothstep(0.362, 0.375, p));
}

/**
 * Storm severity (thunder, hard wind): a hump inside the rain.
 *
 * @param {number} p journey progress
 * @returns {number} 0..1
 */
export function stormAmount(p) {
  return smoothstep(0.26, 0.3, p) * (1 - smoothstep(0.355, 0.375, p));
}

/**
 * How soaked the world is: rain lingers through the flood, dries
 * only when the world transforms.
 *
 * @param {number} p journey progress
 * @returns {number} 0..1
 */
export function wetAmount(p) {
  return smoothstep(0.2, 0.27, p) * (1 - smoothstep(0.45, 0.5, p));
}

/**
 * Water level through the flood: rises from below the ground past
 * the visitor's eyes, holds while submerged, drains as the world
 * transforms.
 *
 * @param {number} p journey progress
 * @returns {number} world y of the surface
 */
export function waterLevel(p) {
  const rise = smoothstep(0.31, 0.358, p);
  const drain = smoothstep(0.44, 0.492, p);
  return -1.8 + rise * 5.2 - drain * 5.2;
}

/**
 * How submerged the view is (0 dry → 1 fully under).
 *
 * @param {number} p journey progress
 * @returns {number} 0..1
 */
export function submergedAmount(p) {
  return smoothstep(0.335, 0.362, p) * (1 - smoothstep(0.44, 0.478, p));
}
