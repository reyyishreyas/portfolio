import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { groundHeight, mulberry32, smoothstep } from './utils';

// module-scope uniforms: mutable outside render, shared with the ring material
const ringUniforms = {
  uTime: { value: 0 },
  uOpacity: { value: 0 },
  uColor: { value: new THREE.Color('#6fd3c8') },
};

const ringVertex = /* glsl */ `
  attribute float aU;
  varying float vU;
  void main() {
    vU = aU;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vU;
  void main() {
    // two comet pulses racing the perimeter over a faint base glow
    float head = fract(vU * 2.0 - uTime * 0.22);
    float pulse = smoothstep(0.1, 0.0, head);
    float alpha = (0.16 + pulse * 0.85) * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const BOARD_X = 4.2;
const BOARD_Z = -212;
const TILE = 0.55;
const BOARD_TOP = 0.45; // local y of the playing surface

// board-relative placement: (col, row) 0..7, row 0 is the far side
const PIECE_LAYOUT = [
  { arch: 'rook', side: 'light', col: 0, row: 7 },
  { arch: 'queen', side: 'light', col: 4, row: 7 },
  { arch: 'pawn', side: 'light', col: 1, row: 5 },
  { arch: 'pawn', side: 'light', col: 6, row: 5 },
  { arch: 'pawn', side: 'light', col: 3, row: 4 },
  { arch: 'rook', side: 'dark', col: 7, row: 0 },
  { arch: 'queen', side: 'dark', col: 3, row: 1 },
  { arch: 'pawn', side: 'dark', col: 2, row: 2 },
  { arch: 'pawn', side: 'dark', col: 5, row: 3 },
  { arch: 'pawn', side: 'dark', col: 0, row: 3 },
];

/**
 * Builds one stylized chess piece as a single merged geometry:
 * primitives composed into a silhouette (no imported models).
 *
 * @param {'pawn'|'rook'|'queen'} kind which archetype to build
 * @returns {THREE.BufferGeometry} merged piece geometry, base at y=0
 */
function makePiece(kind) {
  const parts = [];
  const add = (geo, y) => {
    geo.translate(0, y, 0);
    parts.push(geo);
  };

  if (kind === 'pawn') {
    add(new THREE.CylinderGeometry(0.13, 0.16, 0.06, 12), 0.03);
    add(new THREE.CylinderGeometry(0.05, 0.09, 0.22, 10), 0.17);
    add(new THREE.CylinderGeometry(0.09, 0.06, 0.05, 10), 0.3);
    add(new THREE.SphereGeometry(0.075, 10, 8), 0.4);
  } else if (kind === 'rook') {
    add(new THREE.CylinderGeometry(0.14, 0.17, 0.07, 12), 0.035);
    add(new THREE.CylinderGeometry(0.1, 0.13, 0.3, 12), 0.22);
    add(new THREE.CylinderGeometry(0.15, 0.13, 0.09, 12), 0.415);
    for (let k = 0; k < 4; k += 1) {
      const notch = new THREE.BoxGeometry(0.05, 0.06, 0.05);
      const a = (k / 4) * Math.PI * 2;
      notch.translate(Math.cos(a) * 0.11, 0.48, Math.sin(a) * 0.11);
      parts.push(notch);
    }
  } else {
    add(new THREE.CylinderGeometry(0.15, 0.18, 0.07, 12), 0.035);
    add(new THREE.CylinderGeometry(0.07, 0.13, 0.38, 12), 0.26);
    add(new THREE.CylinderGeometry(0.13, 0.08, 0.05, 12), 0.47);
    add(new THREE.CylinderGeometry(0.12, 0.05, 0.1, 10), 0.545);
    add(new THREE.SphereGeometry(0.05, 8, 6), 0.64);
  }
  return mergeGeometries(parts);
}

/**
 * A chess machine half-buried beside the path: the board rises out of
 * the forest floor as the visitor approaches, pieces emerge onto it
 * one by one, and data pulses race around its edge. The project
 * discovered as a place, not a card. z ≈ −212 (projects beat).
 *
 * @returns {JSX.Element}
 */
export default function ChessMachine() {
  const groupRef = useRef(null);
  const boardRef = useRef(null);
  const ringMatRef = useRef(null);
  const pieceRefs = useRef([]);

  const machine = useMemo(() => {
    // 64 tiles, alternating colours, on a heavy base slab
    const rnd = mulberry32(90210);
    const tiles = [];
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        tiles.push({
          x: (col - 3.5) * TILE,
          z: (row - 3.5) * TILE,
          dark: (row + col) % 2 === 1,
          lift: rnd() * 0.008,
        });
      }
    }

    const geoms = {
      pawn: makePiece('pawn'),
      rook: makePiece('rook'),
      queen: makePiece('queen'),
    };
    const pieces = PIECE_LAYOUT.map((q, i) => ({
      ...q,
      i,
      geo: geoms[q.arch],
      x: (q.col - 3.5) * TILE,
      z: (q.row - 3.5) * TILE,
      yaw: rnd() * 0.6 - 0.3,
    }));

    // closed rectangular loop just outside the board, u along perimeter
    const HALF = 2.65;
    const pts = [];
    const u = [];
    const CORNERS = [
      [-HALF, -HALF],
      [HALF, -HALF],
      [HALF, HALF],
      [-HALF, HALF],
    ];
    const PER_SIDE = 44;
    for (let s = 0; s < 4; s += 1) {
      const a = CORNERS[s];
      const b = CORNERS[(s + 1) % 4];
      for (let k = 0; k < PER_SIDE; k += 1) {
        const t = k / PER_SIDE;
        // y 0.47: just above the tile surface, clear of the base slab
        pts.push(a[0] + (b[0] - a[0]) * t, 0.47, a[1] + (b[1] - a[1]) * t);
        u.push((s + t) / 4);
      }
    }
    const ringGeo = new THREE.BufferGeometry();
    ringGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    ringGeo.setAttribute('aU', new THREE.BufferAttribute(new Float32Array(u), 1));

    return { tiles, pieces, ringGeo };
  }, []);

  useFrame((state) => {
    const p = journeyState.progress;
    const active = p > 0.46 && p < 0.7;
    if (groupRef.current) groupRef.current.visible = active;
    if (!active) return;

    const ahead = state.camera.position.z - BOARD_Z;
    if (boardRef.current) {
      // the slab lifts out of the floor as the visitor closes in —
      // completes at ~19 units so the whole emergence stays inside a
      // phone's narrow horizontal FOV, not just a desktop's
      const rise = smoothstep(36, 19, ahead);
      boardRef.current.position.y = -(1 - rise) * 1.7;
    }
    // pieces surface in sequence once the board is in place
    machine.pieces.forEach((q, i) => {
      const ref = pieceRefs.current[i];
      if (!ref) return;
      const rise = smoothstep(32 - i * 1.0, 21 - i * 0.6, ahead);
      ref.position.y = BOARD_TOP - (1 - rise) * 0.9;
    });

    ringUniforms.uTime.value = state.clock.elapsedTime;
    // pulse only while the board is still ahead of the camera
    ringUniforms.uOpacity.value =
      smoothstep(0.5, 0.53, p) * (1 - smoothstep(0.56, 0.585, p));
    if (ringMatRef.current) ringMatRef.current.visible = ringUniforms.uOpacity.value > 0.01;
  });

  const y0 = groundHeight(BOARD_X, BOARD_Z);

  return (
    <group ref={groupRef} name="ChessMachine" visible={false} position={[BOARD_X, y0, BOARD_Z]}>
      <group ref={boardRef}>
        {/* base slab: bottom edge sinks below the floor so the seam never shows */}
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[4.9, 0.5, 4.9]} />
          <meshStandardMaterial color="#22272c" metalness={0.2} roughness={0.6} />
        </mesh>

        {machine.tiles.map((t, i) => (
          <mesh key={i} position={[t.x, 0.42 + t.lift, t.z]}>
            <boxGeometry args={[TILE - 0.02, 0.06, TILE - 0.02]} />
            <meshStandardMaterial
              color={t.dark ? '#161a1e' : '#7b766a'}
              metalness={0.15}
              roughness={0.55}
            />
          </mesh>
        ))}

        {machine.pieces.map((q, i) => (
          <mesh
            key={i}
            ref={(el) => {
              pieceRefs.current[i] = el;
            }}
            geometry={q.geo}
            position={[q.x, BOARD_TOP, q.z]}
            rotation={[0, q.yaw, 0]}
          >
            <meshStandardMaterial
              color={q.side === 'light' ? '#b9b2a2' : '#1d2226'}
              metalness={0.35}
              roughness={0.4}
            />
          </mesh>
        ))}

        <lineLoop geometry={machine.ringGeo} frustumCulled={false}>
          <shaderMaterial
            ref={ringMatRef}
            uniforms={ringUniforms}
            vertexShader={ringVertex}
            fragmentShader={ringFragment}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineLoop>
      </group>
    </group>
  );
}
