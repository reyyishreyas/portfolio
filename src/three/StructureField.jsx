import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { groundHeight, mulberry32, smoothstep } from './utils';

// scratch objects for the per-frame matrix writes (no allocation in the loop)
const scratch = {
  m: new THREE.Matrix4(),
  q: new THREE.Quaternion(),
  p: new THREE.Vector3(),
  s: new THREE.Vector3(),
  e: new THREE.Euler(),
};

/**
 * The first structures of the computation world: angular slabs that
 * rise out of the floor as the visitor approaches, strung together by
 * a sparse graph of nodes and links — the forest becoming network,
 * still rooted in the ground it grew from.
 *
 * Spans z −178 … −245 (transform + projects beats).
 *
 * @returns {JSX.Element}
 */
export default function StructureField() {
  const groupRef = useRef(null);
  const slabRef = useRef(null);
  const nodeRef = useRef(null);
  const linkMatRef = useRef(null);

  const field = useMemo(() => {
    const rnd = mulberry32(4241);
    const slabs = [];
    for (let i = 0; i < 64; i += 1) {
      const z = -178 - rnd() * 67;
      const side = rnd() < 0.5 ? -1 : 1;
      let x = side * (4.5 + rnd() * 22);
      // keep clear of the chessboard clearing (ChessMachine sits there)
      if (z < -208 && z > -216 && x > 1.5 && x < 8.5) x = -x;
      const h = 2 + rnd() * 7;
      slabs.push({
        x,
        z,
        h,
        w: 0.4 + rnd() * 0.7,
        yaw: (rnd() - 0.5) * 0.5,
        y0: groundHeight(x, z),
      });
    }

    // nodes cluster around slab tops and float in mid-air lanes
    const nodes = [];
    for (let i = 0; i < 56; i += 1) {
      const s = slabs[Math.floor(rnd() * slabs.length)];
      const nearTop = rnd() < 0.6;
      nodes.push({
        x: s.x + (rnd() - 0.5) * 6,
        y: nearTop ? s.y0 + s.h : s.y0 + 1 + rnd() * 6,
        z: s.z + (rnd() - 0.5) * 8,
        s: 0.08 + rnd() * 0.1,
      });
    }

    // link each node to its nearest later neighbour: a sparse graph
    const segs = [];
    for (let i = 0; i < nodes.length; i += 1) {
      let best = -1;
      let bd = Infinity;
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const d = dx * dx + dy * dy + dz * dz;
        if (d < bd) {
          bd = d;
          best = j;
        }
      }
      if (best >= 0 && bd < 400) {
        segs.push(
          nodes[i].x, nodes[i].y, nodes[i].z,
          nodes[best].x, nodes[best].y, nodes[best].z,
        );
      }
    }
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs), 3));
    return { slabs, nodes, linkGeo };
  }, []);

  // static matrices: graph nodes never move
  useLayoutEffect(() => {
    const mesh = nodeRef.current;
    if (!mesh) return;
    field.nodes.forEach((n, i) => {
      scratch.e.set(0, i * 0.7, 0);
      scratch.q.setFromEuler(scratch.e);
      scratch.p.set(n.x, n.y, n.z);
      scratch.s.setScalar(n.s);
      scratch.m.compose(scratch.p, scratch.q, scratch.s);
      mesh.setMatrixAt(i, scratch.m);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [field]);

  // slabs rise from the floor as the camera closes in; the whole
  // field sleeps once the visitor has walked past it
  useFrame((state) => {
    const p = journeyState.progress;
    const active = p > 0.42 && p < 0.74;
    if (groupRef.current) groupRef.current.visible = active;
    if (!active) return;

    const camZ = state.camera.position.z;
    const mesh = slabRef.current;
    if (mesh) {
      field.slabs.forEach((s, i) => {
        const ahead = camZ - s.z;
        const rise = smoothstep(30, 12, ahead);
        // constant scale, sink instead: a zero-scale instance matrix is
        // singular and its ground-coplanar sheet blackens the frame on
        // some rasterizers — a buried full-size box never does
        scratch.e.set(0, s.yaw, 0);
        scratch.q.setFromEuler(scratch.e);
        scratch.p.set(s.x, s.y0 - s.h * (1 - rise) + (s.h * rise) / 2, s.z);
        scratch.s.set(s.w, s.h, s.w);
        scratch.m.compose(scratch.p, scratch.q, scratch.s);
        mesh.setMatrixAt(i, scratch.m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    }
    const lm = linkMatRef.current;
    if (lm) lm.opacity = smoothstep(0.45, 0.55, p) * 0.5;
  });

  return (
    <group ref={groupRef} name="StructureField" visible={false}>
      <instancedMesh
        ref={slabRef}
        args={[undefined, undefined, field.slabs.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#333b42" metalness={0.3} roughness={0.45} />
      </instancedMesh>

      <instancedMesh
        ref={nodeRef}
        args={[undefined, undefined, field.nodes.length]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#7fd8cc" />
      </instancedMesh>

      <lineSegments geometry={field.linkGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={linkMatRef}
          color="#4fb3ae"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
