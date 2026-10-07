import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { groundHeight, mulberry32, smoothstep } from './utils';

/**
 * Where the roots become networks: arcs of root-line climbing out of
 * the floor into a sparse graph of nodes, with fields of vector
 * spikes beside the path — an embedding plot read as landscape.
 *
 * Spans z −226 … −292 (research beat).
 *
 * @returns {JSX.Element}
 */
export default function RootNetwork() {
  const groupRef = useRef(null);
  const nodeRef = useRef(null);
  const nodeMatRef = useRef(null);
  const edgeMatRef = useRef(null);
  const rootMatRef = useRef(null);
  const spikeMatRef = useRef(null);

  const net = useMemo(() => {
    const rnd = mulberry32(77113);
    const nodes = [];
    for (let i = 0; i < 44; i += 1) {
      const z = -226 - rnd() * 66;
      const side = rnd() < 0.5 ? -1 : 1;
      const x = side * (3.5 + rnd() * 12.5);
      nodes.push({
        x,
        z,
        y: groundHeight(x, z) + 0.4 + rnd() * 3.6,
        s: 0.07 + rnd() * 0.11,
      });
    }

    // graph edges: each node links to its two nearest later neighbours
    const edges = [];
    for (let i = 0; i < nodes.length; i += 1) {
      const near = [];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        near.push({ j, d: dx * dx + dy * dy + dz * dz });
      }
      near.sort((a, b) => a.d - b.d);
      for (const { j, d } of near.slice(0, 2)) {
        if (d < 500) {
          edges.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    // root arcs: quadratic beacons from floor anchors up into the graph
    const roots = [];
    for (let k = 0; k < 16; k += 1) {
      const anchor = nodes[Math.floor(rnd() * nodes.length)];
      const ax = anchor.x * 0.8 + (rnd() - 0.5) * 3;
      const az = anchor.z + (rnd() - 0.5) * 6;
      const ay = groundHeight(ax, az);
      const cx = (ax + anchor.x) / 2 + (rnd() - 0.5) * 2;
      const cy = (ay + anchor.y) / 2 + 1.2;
      const cz = (az + anchor.z) / 2;
      // sample the bezier into short segments (one LineSegments buffer)
      let px = ax;
      let py = ay;
      let pz = az;
      for (let s = 1; s <= 14; s += 1) {
        const t = s / 14;
        const it = 1 - t;
        const x = it * it * ax + 2 * it * t * cx + t * t * anchor.x;
        const y = it * it * ay + 2 * it * t * cy + t * t * anchor.y;
        const z = it * it * az + 2 * it * t * cz + t * t * anchor.z;
        roots.push(px, py, pz, x, y, z);
        px = x;
        py = y;
        pz = z;
      }
    }

    // vector spikes: thin vertical lines rising from the floor in
    // clusters, the raw coordinates of the plot
    const spikes = [];
    for (let c = 0; c < 7; c += 1) {
      const cz = -230 - c * 9 - rnd() * 4;
      const side = c % 2 === 0 ? 1 : -1;
      const cx = side * (4 + rnd() * 4);
      for (let s = 0; s < 10; s += 1) {
        const x = cx + (rnd() - 0.5) * 3.4;
        const z = cz + (rnd() - 0.5) * 5;
        const h = 0.5 + rnd() * 2.6;
        const y = groundHeight(x, z);
        spikes.push(x, y, z, x, y + h, z);
      }
    }

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges), 3));
    const rootGeo = new THREE.BufferGeometry();
    rootGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(roots), 3));
    const spikeGeo = new THREE.BufferGeometry();
    spikeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(spikes), 3));
    return { nodes, edgeGeo, rootGeo, spikeGeo };
  }, []);

  useLayoutEffect(() => {
    const mesh = nodeRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    net.nodes.forEach((n, i) => {
      p.set(n.x, n.y, n.z);
      s.setScalar(n.s);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [net]);

  useFrame(() => {
    const p = journeyState.progress;
    const active = p > 0.58 && p < 0.9;
    if (groupRef.current) groupRef.current.visible = active;
    if (!active) return;

    const fade = smoothstep(0.6, 0.68, p) * (1 - smoothstep(0.84, 0.89, p));
    if (edgeMatRef.current) edgeMatRef.current.opacity = fade * 0.45;
    if (nodeMatRef.current) nodeMatRef.current.opacity = fade;
    if (rootMatRef.current) rootMatRef.current.opacity = fade * 0.5;
    if (spikeMatRef.current) spikeMatRef.current.opacity = fade * 0.35;
  });

  return (
    <group ref={groupRef} name="RootNetwork" visible={false}>
      <instancedMesh
        ref={nodeRef}
        args={[undefined, undefined, net.nodes.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          ref={nodeMatRef}
          color="#2a3c42"
          emissive="#123c44"
          emissiveIntensity={0.9}
          transparent
          opacity={0}
        />
      </instancedMesh>

      <lineSegments geometry={net.edgeGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={edgeMatRef}
          color="#3f9a9a"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <lineSegments geometry={net.rootGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={rootMatRef}
          color="#8a7a5c"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </lineSegments>

      <lineSegments geometry={net.spikeGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={spikeMatRef}
          color="#9fd8e0"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
