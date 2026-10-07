import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { groundHeight, mulberry32, valueNoise2 } from './utils';
import { windMaterial } from './wind';

/**
 * Merge helper: mergeGeometries needs a consistent index state, but
 * toNonIndexed() warns when the geometry is already non-indexed.
 *
 * @param {THREE.BufferGeometry} geo
 * @returns {THREE.BufferGeometry}
 */
function flat(geo) {
  return geo.index ? geo.toNonIndexed() : geo;
}

/**
 * Push every vertex of a geometry around with noise so merged primitives
 * stop reading as primitives.
 *
 * @param {THREE.BufferGeometry} geo
 * @param {number} amp
 * @param {number} seed
 * @returns {THREE.BufferGeometry}
 */
function roughen(geo, amp, seed) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i += 1) {
    v.fromBufferAttribute(pos, i);
    const n =
      (valueNoise2(v.x * 2.4 + seed, v.y * 2.4 + v.z) - 0.5) * amp +
      (valueNoise2(v.y * 3.1 + v.z * 2.7 + seed, v.x + seed) - 0.5) * amp * 0.6;
    pos.setXYZ(i, v.x + n, v.y + n * 0.5, v.z + n);
  }
  geo.computeVertexNormals();
  return geo;
}

/** @returns {THREE.BufferGeometry} layered conifer, ~7-10m tall */
function makeConifer(rnd) {
  const parts = [];
  const trunkH = 6.5 + rnd() * 3.5;
  const trunk = new THREE.CylinderGeometry(0.08, 0.24, trunkH, 7, 4);
  trunk.translate(0, trunkH / 2, 0);
  parts.push(roughen(flat(trunk), 0.05, rnd() * 10));

  const layers = 4 + Math.floor(rnd() * 3);
  for (let i = 0; i < layers; i += 1) {
    const t = i / layers;
    const r = (1.75 - t * 1.15) * (0.85 + rnd() * 0.45);
    const h = 1.7 + rnd() * 0.9;
    const cone = new THREE.ConeGeometry(r, h, 9, 2);
    cone.translate((rnd() - 0.5) * 0.3, trunkH * (0.34 + t * 0.62), (rnd() - 0.5) * 0.3);
    parts.push(roughen(flat(cone), 0.22, rnd() * 10));
  }
  return mergeGeometries(parts);
}

/** @returns {THREE.BufferGeometry} broadleaf with branch-supported canopy */
function makeBroadleaf(rnd) {
  const parts = [];
  const trunkH = 3.6 + rnd() * 1.8;
  const trunk = new THREE.CylinderGeometry(0.11, 0.3, trunkH, 7, 4);
  trunk.translate(0, trunkH / 2, 0);
  trunk.rotateZ((rnd() - 0.5) * 0.16);
  parts.push(roughen(flat(trunk), 0.06, rnd() * 10));

  const branches = 3 + Math.floor(rnd() * 2);
  const tips = [];
  for (let i = 0; i < branches; i += 1) {
    const yaw = (i / branches) * Math.PI * 2 + rnd();
    const tilt = 0.55 + rnd() * 0.5;
    const len = 1.6 + rnd() * 1.4;
    const branch = new THREE.CylinderGeometry(0.04, 0.11, len, 5, 2);
    branch.translate(0, len / 2, 0);
    branch.rotateZ(tilt);
    branch.rotateY(yaw);
    branch.translate(0, trunkH * (0.72 + rnd() * 0.25), 0);
    parts.push(flat(branch));
    tips.push({
      x: Math.sin(-tilt) * Math.cos(yaw) * len * 1.05,
      y: trunkH * 0.85 + Math.cos(tilt) * len * 0.9,
      z: Math.sin(-tilt) * Math.sin(yaw) * len * 1.05,
    });
  }

  // canopy blobs around the branch tips plus a crown
  const blobs = [...tips, { x: 0, y: trunkH + 0.9, z: 0 }];
  blobs.forEach((tip) => {
    const r = 1.0 + rnd() * 0.8;
    const blob = new THREE.IcosahedronGeometry(r, 1);
    blob.translate(tip.x, tip.y, tip.z);
    parts.push(roughen(flat(blob), 0.3, rnd() * 10));
  });
  return mergeGeometries(parts);
}

/** @returns {THREE.BufferGeometry} young tree, thin with a small crown */
function makeSapling(rnd) {
  const parts = [];
  const h = 2.2 + rnd() * 1.4;
  const trunk = new THREE.CylinderGeometry(0.035, 0.075, h, 5, 2);
  trunk.translate(0, h / 2, 0);
  trunk.rotateZ((rnd() - 0.5) * 0.3);
  parts.push(flat(trunk));
  const crown = new THREE.IcosahedronGeometry(0.7 + rnd() * 0.4, 1);
  crown.translate(0, h + 0.3, 0);
  parts.push(roughen(flat(crown), 0.22, rnd() * 10));
  return mergeGeometries(parts);
}

// authored cluster centres: framing trees near the path, mid-depth groups
// and a distant wall of silhouettes the fog swallows. The list spans the
// whole journey: living forest through the flood, a thinning edge where
// the world turns to computation, and the forest returning at the end.
const CLUSTERS = [
  { x: -7.5, z: 14, r: 3.2, n: 5, s: 1.35 },
  { x: 8, z: 11, r: 3.6, n: 6, s: 1.3 },
  { x: -11, z: 4, r: 5, n: 7, s: 1.1 },
  { x: 12, z: 2, r: 5, n: 7, s: 1.15 },
  { x: -6, z: -8, r: 4.5, n: 6, s: 1.0 },
  { x: 7, z: -14, r: 4.5, n: 6, s: 1.05 },
  { x: -14, z: -22, r: 6, n: 8, s: 1.1 },
  { x: 15, z: -28, r: 6, n: 8, s: 1.05 },
  { x: -9, z: -38, r: 6, n: 7, s: 1.0 },
  { x: 10, z: -48, r: 6, n: 7, s: 1.0 },
  { x: -16, z: -56, r: 7, n: 8, s: 1.1 },
  { x: 17, z: -62, r: 7, n: 8, s: 1.1 },
  { x: 0, z: -74, r: 12, n: 12, s: 1.2 },
  // deeper forest: the walk through weather
  { x: -8, z: -86, r: 6, n: 7, s: 1.05 },
  { x: 9, z: -95, r: 6, n: 7, s: 1.0 },
  { x: -12, z: -108, r: 7, n: 8, s: 1.1 },
  { x: 13, z: -120, r: 7, n: 8, s: 1.05 },
  { x: -9, z: -133, r: 6, n: 7, s: 1.0 },
  { x: 10, z: -146, r: 7, n: 7, s: 1.05 },
  { x: -13, z: -158, r: 7, n: 8, s: 1.0 },
  { x: 0, z: -174, r: 10, n: 9, s: 1.1 },
  // thinning edge where nature gives way to structure
  { x: -16, z: -192, r: 8, n: 4, s: 0.95 },
  { x: 17, z: -204, r: 8, n: 4, s: 0.9 },
  // the forest returns: human quiet and the closing clearing
  { x: -10, z: -318, r: 7, n: 7, s: 1.05 },
  { x: 11, z: -332, r: 7, n: 7, s: 1.0 },
  { x: -12, z: -346, r: 7, n: 7, s: 1.1 },
  { x: 13, z: -358, r: 7, n: 6, s: 1.0 },
  { x: 0, z: -378, r: 13, n: 12, s: 1.15 },
];

// silhouette walls for depth: one per living-forest span
const WALLS = [
  { cz: -20, rad: [34, 54], zCap: 20 },
  { cz: -110, rad: [38, 56], zCap: -56 },
  { cz: -350, rad: [30, 46], zCap: -314 },
];

/**
 * Three instanced tree archetypes placed in authored clusters with
 * per-instance scale, rotation and tint variation.
 *
 * @param {{quality: {treeFactor: number}}} props
 * @returns {JSX.Element}
 */
export default function TreeCluster({ quality }) {
  const coniferRef = useRef();
  const broadleafRef = useRef();
  const saplingRef = useRef();

  const geos = useMemo(
    () => ({
      conifer: makeConifer(mulberry32(101)),
      broadleaf: makeBroadleaf(mulberry32(202)),
      sapling: makeSapling(mulberry32(303)),
    }),
    []
  );
  const material = useMemo(
    () => windMaterial({ amp: 0.06, height: 8, speed: 0.55 }, { roughness: 0.92 }),
    []
  );

  const placements = useMemo(() => {
    const rnd = mulberry32(20261006);
    const placements = { conifer: [], broadleaf: [], sapling: [] };
    const gauss = () => (rnd() + rnd() + rnd() - 1.5) * 0.7;

    CLUSTERS.forEach((c) => {
      const count = Math.max(2, Math.round(c.n * quality.treeFactor));
      for (let i = 0; i < count; i += 1) {
        const x = c.x + gauss() * c.r;
        const z = c.z + gauss() * c.r;
        if (Math.abs(x) < 3.4) continue; // keep the path open everywhere
        const roll = rnd();
        const kind = roll < 0.52 ? 'conifer' : roll < 0.85 ? 'broadleaf' : 'sapling';
        placements[kind].push({
          x,
          z,
          s: (0.7 + rnd() * 0.75) * c.s,
          yaw: rnd() * Math.PI * 2,
          tilt: (rnd() - 0.5) * 0.06,
          tint: rnd(),
        });
      }
    });

    // distant silhouette walls for depth, one per forest span
    WALLS.forEach((w) => {
      const wallN = Math.round(48 * quality.treeFactor);
      for (let i = 0; i < wallN; i += 1) {
        const a = rnd() * Math.PI * 2;
        const rad = w.rad[0] + rnd() * (w.rad[1] - w.rad[0]);
        const x = Math.cos(a) * rad;
        const z = w.cz + Math.sin(a) * rad;
        if (z > w.zCap) continue;
        if (Math.abs(x) < 4) continue; // never across the path
        const kind = rnd() < 0.75 ? 'conifer' : 'broadleaf';
        placements[kind].push({
          x, z, s: 1.3 + rnd() * 0.8, yaw: rnd() * Math.PI * 2, tilt: 0, tint: rnd(),
        });
      }
    });

    return placements;
  }, [quality.treeFactor]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const e = new THREE.Euler();
    const base = { conifer: '#2f4526', broadleaf: '#3a5230', sapling: '#405c2c' };
    const col = new THREE.Color();

    [
      ['conifer', coniferRef],
      ['broadleaf', broadleafRef],
      ['sapling', saplingRef],
    ].forEach(([kind, ref]) => {
      const mesh = ref.current;
      if (!mesh) return;
      placements[kind].forEach((t, i) => {
        const y = groundHeight(t.x, t.z) - 0.08;
        e.set(t.tilt, t.yaw, t.tilt * 0.7);
        q.setFromEuler(e);
        p.set(t.x, y, t.z);
        sc.setScalar(t.s);
        m.compose(p, q, sc);
        mesh.setMatrixAt(i, m);
        col.set(base[kind]);
        col.offsetHSL((t.tint - 0.5) * 0.04, (t.tint - 0.5) * 0.12, (t.tint - 0.5) * 0.1);
        mesh.setColorAt(i, col);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.count = placements[kind].length;
      mesh.computeBoundingSphere();
    });
  }, [placements, quality.treeFactor]);

  return (
    <group>
      {['conifer', 'broadleaf', 'sapling'].map((kind) => {
        const ref = kind === 'conifer' ? coniferRef : kind === 'broadleaf' ? broadleafRef : saplingRef;
        return (
          <instancedMesh
            key={kind}
            ref={ref}
            args={[geos[kind], material, Math.max(1, placements[kind].length)]}
            castShadow
            receiveShadow
            frustumCulled={false}
          />
        );
      })}
    </group>
  );
}
