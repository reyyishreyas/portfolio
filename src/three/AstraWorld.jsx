import { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { groundHeight } from './utils';
import { makeSite, useDiscovery } from './discovery';

const GATE_Z = -296;
const LOGO_SRC = '/assets/images/astra_logo.jpeg';

// right-hand slab (visitor's right while facing down the path)
const GATE = { left: -3.6, right: 3.6, w: 2.4, h: 7.2, d: 0.6 };

// which card each discovery belongs to: the team forms before the gate,
// the manuscripts stand beyond it
const SQUAD = { from: 0.734, to: 0.767, side: 1, z: -289 };
const MANUSCRIPTS = { from: 0.77, to: 0.817, side: 1, z: -307.5 };
const SIDE_X = 4.0;

/**
 * @param {number[]} size [width, height, depth]
 * @param {number[]} pos [x, y, z]
 * @returns {THREE.BufferGeometry}
 */
function box(size, pos) {
  return new THREE.BoxGeometry(size[0], size[1], size[2]).translate(pos[0], pos[1], pos[2]);
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
 * The thirty-member team, read as a formation: a lit pad, a mast on
 * the path side and thirty lights hovering in rank above it — the
 * squad mustering in front of the gate.
 *
 * @param {{from: number, to: number, side: number, z: number}} spec card
 * @returns {JSX.Element}
 */
function SquadFormation({ spec }) {
  const lightsRef = useRef(null);
  const site = useMemo(
    () => makeSite(spec.from, spec.to, spec.side * SIDE_X, spec.z, 10.4),
    [spec],
  );

  const part = useMemo(() => {
    const hard = [
      box([0.24, 8.6, 0.24], [-1.35, 4.65, 0]),
      box([0.6, 0.14, 0.6], [-1.35, 9.0, 0]),
      new THREE.CylinderGeometry(1.45, 1.55, 0.5, 24).translate(0, -0.1, 0),
    ];
    // one light per member, in five ranks of six
    const lights = [];
    for (let r = 0; r < 5; r += 1) {
      for (let c = 0; c < 6; c += 1) {
        lights.push([-1.15 + c * 0.49, 5.4 + r * 0.8, 0.6]);
      }
    }
    return {
      hard: merge(hard),
      lights,
      ringGeo: new THREE.TorusGeometry(1.45, 0.05, 6, 40),
    };
  }, []);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    const mesh = lightsRef.current;
    if (!mesh || rise < 0.04) return;
    // the formation breathes: each light drifts a little out of phase
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    const v = new THREE.Vector3();
    part.lights.forEach((l, i) => {
      v.set(l[0], l[1] + Math.sin(t * 1.1 + i * 0.42) * 0.1, l[2]);
      m.compose(v, q, s);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="SquadFormation">
      <mesh geometry={part.hard}>
        <meshStandardMaterial color="#3b454d" metalness={0.5} roughness={0.34} />
      </mesh>
      <mesh geometry={part.ringGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
        <meshBasicMaterial color="#6fd3c8" transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <instancedMesh
        ref={lightsRef}
        args={[undefined, undefined, part.lights.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[0.085, 8, 6]} />
        <meshBasicMaterial color="#bfeef7" />
      </instancedMesh>
    </group>
  );
}

/**
 * The research output: a mast carrying six manuscript sheets, three of
 * them lit — the three abstracts accepted at SICE 2026 — hanging above
 * the path where the visitor walks under them.
 *
 * @param {{from: number, to: number, side: number, z: number}} spec card
 * @returns {JSX.Element}
 */
function ManuscriptMast({ spec }) {
  const glowRef = useRef(null);
  const site = useMemo(
    () => makeSite(spec.from, spec.to, spec.side * SIDE_X, spec.z, 11.4),
    [spec],
  );

  const part = useMemo(() => {
    const hard = [
      box([2.8, 2.5, 2.0], [0, -0.9, 0]),
      box([0.26, 9.5, 0.26], [-1.35, 5.1, -0.3]),
      box([0.66, 0.14, 0.66], [-1.35, 9.95, -0.3]),
    ];
    const sheets = [];
    const lit = [];
    const links = [];
    const rows = [
      { y: 1.6, x: 0.35, z: 0.55, yaw: 0.14 },
      { y: 2.9, x: 0.1, z: 0.7, yaw: -0.1 },
      { y: 4.2, x: 0.4, z: 0.5, yaw: 0.18 },
      { y: 5.5, x: 0.15, z: 0.65, yaw: -0.14 },
      { y: 6.8, x: 0.35, z: 0.55, yaw: 0.12 },
      { y: 8.1, x: 0.2, z: 0.6, yaw: -0.16 },
    ];
    rows.forEach((r, i) => {
      // every other sheet is one of the three accepted abstracts
      const target = i % 2 === 1 ? lit : sheets;
      target.push(box([1.5, 2.0, 0.07], [r.x, r.y, r.z], r.yaw));
      // arm back to the mast, in the plane of the sheet
      hard.push(box([r.x + 1.35, 0.07, 0.09], [(r.x - 1.35) / 2, r.y, r.z - 0.06], r.yaw * 0.3));
      if (i % 2 === 1) links.push(r.x, r.y, r.z + 0.05, -1.35, r.y, -0.3);
    });
    const linkGeo = new THREE.BufferGeometry();
    linkGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(links), 3));
    return { hard: merge(hard), sheets: merge(sheets), lit: merge(lit), linkGeo };
  }, []);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = rise * (1.15 + 0.4 * Math.sin(t * 1.5));
    }
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="ManuscriptMast">
      <mesh geometry={part.hard}>
        <meshStandardMaterial color="#3b454d" metalness={0.5} roughness={0.34} />
      </mesh>
      <mesh geometry={part.sheets}>
        <meshStandardMaterial color="#7f8a93" metalness={0.25} roughness={0.5} />
      </mesh>
      <mesh geometry={part.lit}>
        <meshStandardMaterial
          ref={glowRef}
          color="#d7f4fa"
          emissive="#59d6e6"
          emissiveIntensity={1.15}
          roughness={0.25}
        />
      </mesh>
      <lineSegments geometry={part.linkGeo} frustumCulled={false}>
        <lineBasicMaterial
          color="#8fe6d8"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/**
 * The engineered world: precision rows of pylons flank the path, then
 * a gateway of two machined slabs — the ASTRA mark cut into the right
 * one — that the visitor walks straight through. Repetition reads as
 * engineering; passing the threshold reads as entering. Two
 * discoveries stand beside that approach: the squad before the gate,
 * the manuscripts after it.
 *
 * Spans z −266 … −316 (astra beat).
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
    for (let i = 0; i < 21; i += 1) {
      const z = -266 - i * 2.48;
      for (const side of [-1, 1]) {
        const x = side * 5.6;
        pylons.push({ x, z, y0: groundHeight(x, z) });
      }
    }

    // floor inlays: pale guidance strips beside the path, following
    // the ground so they never float or bury
    const inlay = [];
    for (const side of [-1, 1]) {
      for (let z = -264; z > -318; z -= 3) {
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

      {/* the discovery that belongs to the leadership card */}
      <SquadFormation spec={SQUAD} />

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

      {/* the discovery that belongs to the working card */}
      <ManuscriptMast spec={MANUSCRIPTS} />

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
