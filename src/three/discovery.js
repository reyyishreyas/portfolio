// Trail-side discoveries: the set pieces that stand beside a story
// card. Every piece shares its card's progress window, so the thing you
// read and the thing standing in the forest are the same moment — it
// rises out of the ground as the card arrives and sinks back once the
// visitor has walked on.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { groundHeight, smoothstep } from './utils';

/**
 * Where a set piece stands and how it disappears. x is signed so a
 * piece always sits opposite its card: cards on the left of the screen
 * get a piece on the visitor's right, and the other way round.
 *
 * @typedef {object} Site
 * @property {number} from card window start (journey progress)
 * @property {number} to card window end
 * @property {number} x lateral position, + right of the path, − left
 * @property {number} z world depth
 * @property {number} depth travel it needs to bury itself completely
 * @property {number} gy ground height under the piece centre
 */

/**
 * @param {number} from card window start
 * @param {number} to card window end
 * @param {number} x lateral position
 * @param {number} z world depth
 * @param {number} depth piece height plus a burial margin
 * @returns {Site} placement for useDiscovery
 */
export function makeSite(from, to, x, z, depth) {
  return { from, to, x, z, depth, gy: groundHeight(x, z) };
}

/**
 * Raises and lowers one set piece against the journey. The group is
 * hidden outside its own window, so a discovery never lingers into a
 * card it does not belong to.
 *
 * @param {Site} site placement from makeSite
 * @param {(rise: number, camZ: number, p: number, t: number) => void} [update]
 *   per-frame animation for the piece itself; rise is 0 buried, 1 standing
 * @returns {{current: import('three').Object3D | null}} ref for the piece group
 */
export function useDiscovery(site, update) {
  const groupRef = useRef(null);
  const onUpdate = useRef(update);
  useFrame((state) => {
    const p = journeyState.progress;
    const active = p > site.from - 0.03 && p < site.to + 0.024;
    const group = groupRef.current;
    if (group) group.visible = active;
    if (!active) return;

    // rises across the card's opening, settles back after it has gone
    const rise =
      smoothstep(site.from - 0.026, site.from + 0.008, p) *
      (1 - smoothstep(site.to - 0.006, site.to + 0.02, p));
    group.position.y = site.gy - (1 - rise) * site.depth;
    if (onUpdate.current) {
      onUpdate.current(rise, state.camera.position.z, p, state.clock.elapsedTime);
    }
  });
  return groupRef;
}
