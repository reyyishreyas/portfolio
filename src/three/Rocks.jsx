import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { groundHeight, mulberry32, valueNoise2 } from './utils';

/**
 * Scatter rocks and an authored fallen log with a few bare branches —
 * the close-range detail that stops the floor reading as empty.
 *
 * @param {{quality: {treeFactor: number}}} props
 * @returns {JSX.Element}
 */
export default function Rocks({ quality }) {
  const rockRef = useRef();

  const rockGeo = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 1);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      const n = 0.75 + valueNoise2(v.x * 3 + 11, v.z * 3 - v.y) * 0.5;
      pos.setXYZ(i, v.x * n, v.y * n * 0.72, v.z * n);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const rocks = useMemo(() => {
    const rnd = mulberry32(9091);
    const out = [];
    const n = Math.round(56 * quality.treeFactor);
    for (let i = 0; i < n; i += 1) {
      const x = (rnd() - 0.5) * 60;
      const z = rnd() < 0.72 ? 20 - rnd() * 198 : -320 - rnd() * 54;
      out.push({
        x, z,
        s: 0.14 + rnd() * 0.6,
        yaw: rnd() * Math.PI * 2,
        tint: rnd(),
      });
    }
    return out;
  }, [quality.treeFactor]);

  useLayoutEffect(() => {
    const mesh = rockRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const sc = new THREE.Vector3();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    const base = new THREE.Color('#4a4a45');
    rocks.forEach((r, i) => {
      e.set(r.tint * 0.6, r.yaw, r.tint * 0.4);
      q.setFromEuler(e);
      p.set(r.x, groundHeight(r.x, r.z) - r.s * 0.25, r.z);
      sc.setScalar(r.s);
      m.compose(p, q, sc);
      mesh.setMatrixAt(i, m);
      col.copy(base).offsetHSL(0.03 * (r.tint - 0.5), 0.05 * (r.tint - 0.5), (r.tint - 0.5) * 0.18);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [rocks]);

  // authored floor detail near the start of the path
  const fallen = useMemo(() => {
    const rnd = mulberry32(31337);
    return [
      { x: -4.2, z: 7.5, len: 3.4, r: 0.26, yaw: 1.15, lift: 0.16 },
      { x: 5.6, z: -6, len: 2.6, r: 0.2, yaw: -0.6, lift: 0.12 },
      { x: -6.8, z: -16, len: 3.9, r: 0.3, yaw: 0.3, lift: 0.2 },
      { x: 3.1, z: 3.2, len: 0.9, r: 0.05, yaw: 2.2, lift: 0.03 },
      { x: -2.9, z: -3.5, len: 1.2, r: 0.06, yaw: -1.4, lift: 0.04 },
      { x: 4.8, z: 12.4, len: 1.0, r: 0.05, yaw: 0.9, lift: 0.03 },
    ].map((l) => ({ ...l, tint: rnd() }));
  }, []);

  return (
    <group>
      <instancedMesh
        ref={rockRef}
        args={[rockGeo, undefined, Math.max(1, rocks.length)]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.95} metalness={0} />
      </instancedMesh>

      {fallen.map((log, i) => (
        <group key={i} position={[log.x, groundHeight(log.x, log.z) + log.lift, log.z]} rotation={[0, log.yaw, Math.PI / 2 - 0.06]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[log.r * 0.8, log.r, log.len, 7, 1]} />
            <meshStandardMaterial color="#4c3d2d" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
