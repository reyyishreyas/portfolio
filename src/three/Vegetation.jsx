import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { groundHeight, mulberry32, smoothstep } from './utils';
import { windMaterial } from './wind';

/** Single tapered blade with bend segments, origin at the root.
 *  @returns {THREE.BufferGeometry}
 */
function makeBlade() {
  const geo = new THREE.PlaneGeometry(0.05, 0.55, 1, 4);
  geo.translate(0, 0.275, 0);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i);
    const t = y / 0.55;
    pos.setX(i, pos.getX(i) * (1 - t * 0.88));
    pos.setZ(i, pos.getZ(i) + t * t * 0.1); // gentle outward bend
  }
  geo.computeVertexNormals();
  return geo;
}

/** Fern frond: a fan of wide blades sharing one origin.
 *  @returns {THREE.BufferGeometry}
 */
function makeFern() {
  const blades = [];
  for (let i = 0; i < 6; i += 1) {
    const blade = new THREE.PlaneGeometry(0.09, 0.8, 1, 4).toNonIndexed();
    blade.translate(0, 0.4, 0);
    const pos = blade.attributes.position;
    for (let j = 0; j < pos.count; j += 1) {
      const y = pos.getY(j);
      const t = y / 0.8;
      pos.setX(j, pos.getX(j) * (1 - t * 0.92));
      pos.setZ(j, pos.getZ(j) + t * t * 0.34);
    }
    blade.rotateX(-0.5 - (i % 2) * 0.35);
    blade.rotateY((i / 6) * Math.PI * 2);
    blades.push(blade);
  }
  const merged = mergeGeometries(blades);
  merged.computeVertexNormals();
  return merged;
}

/**
 * Ground cover: an instanced grass field along the path edges plus
 * scattered fern fronds in the shaded understory.
 *
 * @param {{quality: {grass: number, ferns: number}}} props
 * @returns {JSX.Element}
 */
export default function Vegetation({ quality }) {
  const grassRef = useRef();
  const fernRef = useRef();

  const grassGeo = useMemo(() => makeBlade(), []);
  const fernGeo = useMemo(() => makeFern(), []);
  const grassMat = useMemo(
    () => windMaterial({ amp: 0.1, height: 0.55, speed: 1.15 }, { roughness: 1, side: THREE.DoubleSide }),
    []
  );
  const fernMat = useMemo(
    () => windMaterial({ amp: 0.14, height: 0.8, speed: 1.0 }, { roughness: 1, side: THREE.DoubleSide }),
    []
  );

  const grassPlaces = useMemo(() => {
    const rnd = mulberry32(777001);
    const out = [];
    let guard = 0;
    while (out.length < quality.grass && guard < quality.grass * 6) {
      guard += 1;
      const x = (rnd() - 0.5) * 70;
      const z = 22 - rnd() * 95;
      // denser at path edges, absent from the worn centre line
      const edge = smoothstep(0.6, 2.6, Math.abs(x + Math.sin(z * 0.11) * 1.4));
      if (rnd() > 0.25 + edge * 0.75) continue;
      out.push({
        x,
        z,
        s: 0.6 + rnd() * 1.1,
        yaw: rnd() * Math.PI * 2,
        lean: (rnd() - 0.5) * 0.4,
        tint: rnd(),
      });
    }
    return out;
  }, [quality.grass]);

  const fernPlaces = useMemo(() => {
    const rnd = mulberry32(4242);
    const out = [];
    for (let i = 0; i < quality.ferns; i += 1) {
      const x = (rnd() - 0.5) * 56;
      const z = 18 - rnd() * 85;
      if (Math.abs(x) < 2.6) continue;
      out.push({ x, z, s: 0.55 + rnd() * 0.7, yaw: rnd() * Math.PI * 2, tint: rnd() });
    }
    return out;
  }, [quality.ferns]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    const baseGrass = new THREE.Color('#3f5426');
    const baseFern = new THREE.Color('#2c4520');

    const g = grassRef.current;
    if (g) {
      grassPlaces.forEach((t, i) => {
        e.set(t.lean, t.yaw, t.lean * 0.6);
        q.setFromEuler(e);
        p.set(t.x, groundHeight(t.x, t.z) - 0.03, t.z);
        sc.set(t.s, t.s * (0.8 + t.tint * 0.6), t.s);
        m.compose(p, q, sc);
        g.setMatrixAt(i, m);
        col.copy(baseGrass).offsetHSL((t.tint - 0.5) * 0.05, 0, (t.tint - 0.5) * 0.16);
        g.setColorAt(i, col);
      });
      g.instanceMatrix.needsUpdate = true;
      if (g.instanceColor) g.instanceColor.needsUpdate = true;
      g.computeBoundingSphere();
    }

    const f = fernRef.current;
    if (f) {
      fernPlaces.forEach((t, i) => {
        e.set(0, t.yaw, 0);
        q.setFromEuler(e);
        p.set(t.x, groundHeight(t.x, t.z), t.z);
        sc.setScalar(t.s);
        m.compose(p, q, sc);
        f.setMatrixAt(i, m);
        col.copy(baseFern).offsetHSL((t.tint - 0.5) * 0.04, 0, (t.tint - 0.5) * 0.12);
        f.setColorAt(i, col);
      });
      f.instanceMatrix.needsUpdate = true;
      if (f.instanceColor) f.instanceColor.needsUpdate = true;
      f.computeBoundingSphere();
    }
  }, [grassPlaces, fernPlaces]);

  return (
    <group>
      <instancedMesh
        ref={grassRef}
        args={[grassGeo, grassMat, Math.max(1, grassPlaces.length)]}
        castShadow={false}
        receiveShadow
        frustumCulled={false}
      />
      <instancedMesh
        ref={fernRef}
        args={[fernGeo, fernMat, Math.max(1, fernPlaces.length)]}
        castShadow
        receiveShadow
        frustumCulled={false}
      />
    </group>
  );
}
