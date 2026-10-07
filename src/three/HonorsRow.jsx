import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { makeSite, useDiscovery } from './discovery';

// the recognition card sits on the right of the screen, so the honours
// stand to the left of the path — and z keeps them ~20 units ahead of it
const SITE = { from: 0.93, to: 0.952, side: -1, z: -371 };
const SIDE_X = 4.0;

// order matches the card: three service recommendations, then the expo win
const TOTEMS = [
  { x: -1.35, h: 7.2 },
  { x: -0.45, h: 7.2 },
  { x: 0.45, h: 7.2 },
  { x: 1.35, h: 8.2, prize: true },
];

/**
 * @param {number[]} size [width, height, depth]
 * @param {number[]} pos [x, y, z]
 * @returns {THREE.BufferGeometry}
 */
function box(size, pos) {
  return new THREE.BoxGeometry(size[0], size[1], size[2]).translate(pos[0], pos[1], pos[2]);
}

/**
 * A medallion lying in the vertical plane, so it faces the walker.
 *
 * @param {number} r radius
 * @param {number} d thickness
 * @param {number[]} pos [x, y, z]
 * @returns {THREE.BufferGeometry}
 */
function disc(r, d, pos) {
  const g = new THREE.CylinderGeometry(r, r, d, 22);
  g.rotateX(Math.PI / 2);
  g.translate(pos[0], pos[1], pos[2]);
  return g;
}

/**
 * Merge a list of parts into one geometry and free the sources.
 *
 * @param {THREE.BufferGeometry[]} list
 * @returns {THREE.BufferGeometry}
 */
function merge(list) {
  const geo = mergeGeometries(list, false);
  list.forEach((g) => g.dispose());
  return geo;
}

/**
 * Four honours standing at the end of the walk: three identical
 * recommendation totems, each carrying a medallion, and — set nearest
 * the path because it is the one that put him on a stage — the expo
 * win, taller and crowned with a ring.
 *
 * @returns {JSX.Element}
 */
export default function HonorsRow() {
  const glowRef = useRef(null);
  const site = useMemo(() => makeSite(SITE.from, SITE.to, SITE.side * SIDE_X, SITE.z, 11), []);

  const part = useMemo(() => {
    const hard = [box([3.4, 2.5, 2.2], [0, -0.9, 0])];
    const medals = [];
    const crown = [];
    for (const t of TOTEMS) {
      hard.push(box([t.prize ? 0.66 : 0.5, t.h, 0.5], [t.x, 0.35 + t.h / 2, 0]));
      // lit strip up the face of every totem
      hard.push(box([0.1, t.h - 0.7, 0.06], [t.x, 0.35 + t.h / 2, 0.26]));
      if (t.prize) {
        crown.push(box([0.94, 0.34, 0.94], [t.x, 0.52, 0]));
      } else {
        medals.push(disc(0.36, 0.12, [t.x, 0.35 + t.h + 0.42, 0.04]));
      }
    }
    return {
      hard: merge(hard),
      medals: merge(medals),
      crown: merge(crown),
      ringGeo: new THREE.TorusGeometry(0.56, 0.07, 8, 30),
    };
  }, []);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = rise * (1.3 + 0.35 * Math.sin(t * 1.3));
    }
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="HonorsRow">
      <mesh geometry={part.hard}>
        <meshStandardMaterial color="#463f33" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh geometry={part.medals}>
        <meshStandardMaterial
          color="#ffd9a0"
          emissive="#8a5f22"
          emissiveIntensity={0.9}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh geometry={part.crown}>
        <meshStandardMaterial
          ref={glowRef}
          color="#ffe6b8"
          emissive="#ffb54d"
          emissiveIntensity={1.3}
          metalness={0.55}
          roughness={0.25}
        />
      </mesh>
      <mesh geometry={part.ringGeo} position={[1.35, 9.15, 0]}>
        <meshStandardMaterial
          color="#fff3d6"
          emissive="#ffcf7a"
          emissiveIntensity={1.6}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
