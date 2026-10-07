import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { groundHeight } from './utils';

const GATE_Z = -284;
const LOGO_SRC = '/assets/images/astra_logo.jpeg';

// right-hand slab (visitor's right while facing down the path)
const GATE = { left: -3.6, right: 3.6, w: 2.4, h: 7.2, d: 0.6 };

/**
 * The engineered world: precision rows of pylons flank the path, then
 * a gateway of two machined slabs — the ASTRA mark cut into the right
 * one — that the visitor walks straight through. Repetition reads as
 * engineering; passing the threshold reads as entering.
 *
 * Spans z −254 … −318 (astra beat).
 *
 * @returns {JSX.Element}
 */
export default function AstraWorld() {
  const groupRef = useRef(null);
  const pylonRef = useRef(null);
  const capRef = useRef(null);

  const world = useMemo(() => {
    // pylon rows: strict spacing, no organic jitter in the placement
    const pylons = [];
    for (let i = 0; i < 26; i += 1) {
      const z = -254 - i * 2.48;
      for (const side of [-1, 1]) {
        const x = side * 5.6;
        pylons.push({ x, z, y0: groundHeight(x, z) });
      }
    }

    // floor inlays: pale guidance strips beside the path, following
    // the ground so they never float or bury
    const inlay = [];
    for (const side of [-1, 1]) {
      for (let z = -252; z > -318; z -= 3) {
        const x = side * 2.9;
        inlay.push(
          x, groundHeight(x, z) + 0.03, z,
          x, groundHeight(x, z - 3) + 0.03, z - 3,
        );
      }
    }
    const inlayGeo = new THREE.BufferGeometry();
    inlayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(inlay), 3));

    const logoTex = new THREE.TextureLoader().load(LOGO_SRC);
    logoTex.colorSpace = THREE.SRGBColorSpace;

    return { pylons, inlayGeo, logoTex };
  }, []);

  // one-time instance matrices: placement is the animation here
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    const py = pylonRef.current;
    if (py) {
      s.set(0.26, 3.4, 0.26);
      world.pylons.forEach((pl, i) => {
        p.set(pl.x, pl.y0 + 1.7, pl.z);
        m.compose(p, q, s);
        py.setMatrixAt(i, m);
      });
      py.instanceMatrix.needsUpdate = true;
      py.computeBoundingSphere();
    }
    const caps = capRef.current;
    if (caps) {
      s.set(0.32, 0.1, 0.32);
      world.pylons.forEach((pl, i) => {
        p.set(pl.x, pl.y0 + 3.45, pl.z);
        m.compose(p, q, s);
        caps.setMatrixAt(i, m);
      });
      caps.instanceMatrix.needsUpdate = true;
      caps.computeBoundingSphere();
    }
  }, [world]);

  useFrame(() => {
    const p = journeyState.progress;
    if (groupRef.current) groupRef.current.visible = p > 0.64 && p < 0.92;
  });

  const gateY = groundHeight(0, GATE_Z);

  return (
    <group ref={groupRef} name="AstraWorld" visible={false}>
      {/* pylon rows (static instancing: placement is the animation) */}
      <instancedMesh
        ref={pylonRef}
        args={[undefined, undefined, world.pylons.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#3b454d" metalness={0.45} roughness={0.36} />
      </instancedMesh>

      {/* emissive caps on every pylon */}
      <instancedMesh
        ref={capRef}
        args={[undefined, undefined, world.pylons.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#9fe2ef" />
      </instancedMesh>

      {/* the gateway: two slabs the camera walks between */}
      <group position={[0, gateY, GATE_Z]}>
        <mesh position={[GATE.left, GATE.h / 2, 0]}>
          <boxGeometry args={[GATE.w, GATE.h, GATE.d]} />
          <meshStandardMaterial color="#454f57" metalness={0.55} roughness={0.3} />
        </mesh>
        <mesh position={[GATE.right, GATE.h / 2, 0]}>
          <boxGeometry args={[GATE.w, GATE.h, GATE.d]} />
          <meshStandardMaterial color="#454f57" metalness={0.55} roughness={0.3} />
        </mesh>

        {/* light strips on the inner edges */}
        <mesh position={[-(GATE.w / 2) + 0.03, GATE.h / 2 - 0.3, 0]}>
          <boxGeometry args={[0.06, GATE.h - 0.6, 0.06]} />
          <meshBasicMaterial color="#bfeef7" />
        </mesh>
        <mesh position={[GATE.w / 2 - 0.03, GATE.h / 2 - 0.3, 0]}>
          <boxGeometry args={[0.06, GATE.h - 0.6, 0.06]} />
          <meshBasicMaterial color="#bfeef7" />
        </mesh>

        {/* ASTRA mark on the right slab, facing the approaching visitor */}
        <mesh position={[GATE.right, 3.4, GATE.d / 2 + 0.02]}>
          <planeGeometry args={[1.7, 1.7]} />
          <meshBasicMaterial map={world.logoTex} fog={false} />
        </mesh>
      </group>

      {/* precision inlays along the approach */}
      <lineSegments geometry={world.inlayGeo} frustumCulled={false}>
        <lineBasicMaterial
          color="#7fb9c4"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
