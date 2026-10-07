import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mulberry32 } from './utils';
import { makeSite, useDiscovery } from './discovery';

/**
 * Five systems, five places: the set pieces that stand beside the
 * project cards. Each one is a small monument built from primitives —
 * merged where it can be, instanced where there are many — placed on
 * the opposite side of the path from its card so the text never hides
 * the thing it describes. z positions put each piece ~24 world units
 * ahead of the card that introduces it, which is far enough to be
 * inside a phone's narrow field of view and close enough to read.
 */

// far enough from the path's light fibres to stand beside them
const SIDE_X = 4.0;

// card window, side (−1 left of the path, +1 right) and depth
const CARDS = {
  trajectory: { from: 0.559, to: 0.58, side: -1, z: -227.2 },
  papers: { from: 0.583, to: 0.604, side: 1, z: -234.5 },
  churn: { from: 0.607, to: 0.628, side: -1, z: -241.9 },
  salary: { from: 0.631, to: 0.652, side: 1, z: -249.4 },
  fixture: { from: 0.655, to: 0.676, side: -1, z: -257.9 },
};

/**
 * A box, placed and turned, ready to merge with its siblings.
 *
 * @param {number[]} size [width, height, depth]
 * @param {number[]} pos [x, y, z]
 * @param {number} [yaw] turn about the vertical axis
 * @returns {THREE.BufferGeometry}
 */
function box(size, pos, yaw = 0) {
  const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
  if (yaw) g.rotateY(yaw);
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
 * A glowing line sampled from a curve, used for the trajectories, the
 * ROC curve and the fixture's bracket edges.
 *
 * @param {THREE.Vector3[]} points
 * @param {number} [radius]
 * @returns {THREE.BufferGeometry}
 */
function tube(points, radius = 0.05) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, radius, 5, false);
}

/**
 * The flagship: five flight paths sweeping up out of a launch pad, the
 * model's forecasts interleaved with the true trajectories they are
 * measured against, beside a radar mast.
 *
 * @param {{from: number, to: number, side: number, z: number}} spec card
 * @returns {JSX.Element}
 */
function TrajectoryPiece({ spec }) {
  const glowRef = useRef(null);
  const site = useMemo(
    () => makeSite(spec.from, spec.to, spec.side * SIDE_X, spec.z, 10.6),
    [spec],
  );

  const part = useMemo(() => {
    const truth = [];
    const forecast = [];
    const marks = [];
    const hard = [box([3.2, 2.5, 2.6], [0, -0.9, 0])];
    // the mast sits on the path side (local +x: this piece is left of the path)
    hard.push(box([0.2, 9.0, 0.2], [1.5, 4.85, -1.3]));
    hard.push(box([0.78, 0.16, 0.78], [1.5, 9.4, -1.3]));

    for (let i = 0; i < 5; i += 1) {
      const sx = 1.4 - i * 0.68;
      const ex = -1.4 + i * 0.36;
      const top = 6.6 + i * 0.55;
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx, 0.5, 1.3),
        new THREE.Vector3(sx * 0.45, top * 0.45, 0.5),
        new THREE.Vector3(ex * 0.35, top, -0.4),
        new THREE.Vector3(ex, top - 1.6, -1.5),
      ]);
      (i % 2 === 0 ? truth : forecast).push(tube(curve.getPoints(18), 0.05));
      for (const t of [0.4, 0.7, 1]) {
        const p = curve.getPoint(t);
        marks.push(new THREE.SphereGeometry(0.075, 7, 6).translate(p.x, p.y, p.z));
      }
    }
    return { hard: merge(hard), truth: merge(truth), forecast: merge(forecast), marks: merge(marks) };
  }, []);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = rise * (1.05 + 0.45 * Math.sin(t * 1.9));
    }
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="TrajectoryPiece">
      <mesh geometry={part.hard}>
        <meshStandardMaterial color="#3a444b" metalness={0.4} roughness={0.38} />
      </mesh>
      <mesh geometry={part.truth}>
        <meshStandardMaterial
          color="#bfeef7"
          emissive="#2f7f8c"
          emissiveIntensity={0.9}
          roughness={0.3}
        />
      </mesh>
      <mesh geometry={part.forecast}>
        <meshStandardMaterial
          ref={glowRef}
          color="#6fd3c8"
          emissive="#2bb5a6"
          emissiveIntensity={1}
          roughness={0.3}
        />
      </mesh>
      <mesh geometry={part.marks}>
        <meshBasicMaterial color="#d7f4fa" />
      </mesh>
    </group>
  );
}

/**
 * The paper analyst: five papers stacked up a mast, a lit answer plate
 * and the citation lines that tie it back to its sources.
 *
 * @param {{from: number, to: number, side: number, z: number}} spec card
 * @returns {JSX.Element}
 */
function PapersPiece({ spec }) {
  const glowRef = useRef(null);
  const site = useMemo(
    () => makeSite(spec.from, spec.to, spec.side * SIDE_X, spec.z, 10.8),
    [spec],
  );

  const part = useMemo(() => {
    const hard = [box([3.2, 2.5, 2.4], [0, -0.9, 0])];
    // mast on the path side (this piece stands right of the path)
    hard.push(box([0.22, 9.4, 0.22], [-1.3, 5.05, -0.3]));
    hard.push(box([0.8, 0.16, 0.8], [-1.3, 9.6, -0.3]));

    const cards = [
      { y: 1.7, x: 0.3, z: 0.5, yaw: 0.16 },
      { y: 3.35, x: 0.05, z: 0.7, yaw: -0.12 },
      { y: 5.0, x: 0.35, z: 0.45, yaw: 0.2 },
      { y: 6.65, x: 0.1, z: 0.65, yaw: -0.16 },
      { y: 8.3, x: 0.3, z: 0.5, yaw: 0.12 },
    ];
    const pages = [];
    for (const c of cards) {
      pages.push(box([1.5, 1.9, 0.07], [c.x, c.y, c.z], c.yaw));
      // arm back to the mast, in the same plane as the page
      hard.push(box([c.x + 1.3, 0.08, 0.09], [(c.x - 1.3) / 2, c.y, c.z - 0.05], c.yaw * 0.3));
    }
    // highlight on the top page, and the answer plate it was drawn from
    const lit = [box([1.0, 0.11, 0.05], [0.3, 8.7, 0.56], 0.12)];
    lit.push(box([0.9, 1.3, 0.09], [1.35, 5.0, 1.05], -0.2));

    const linkPts = [];
    for (const i of [1, 3, 4]) {
      const c = cards[i];
      linkPts.push(1.3, 5.0, 1.0, c.x, c.y, c.z + 0.05);
    }
    const links = new THREE.BufferGeometry();
    links.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPts), 3));

    return { hard: merge(hard), pages: merge(pages), lit: merge(lit), links };
  }, []);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = rise * (1.1 + 0.4 * Math.sin(t * 1.4 + 1.2));
    }
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="PapersPiece">
      <mesh geometry={part.hard}>
        <meshStandardMaterial color="#3a444b" metalness={0.4} roughness={0.38} />
      </mesh>
      <mesh geometry={part.pages}>
        <meshStandardMaterial color="#7f8a93" metalness={0.25} roughness={0.5} />
      </mesh>
      <mesh geometry={part.lit}>
        <meshStandardMaterial
          ref={glowRef}
          color="#d7f4fa"
          emissive="#59d6e6"
          emissiveIntensity={1.1}
          roughness={0.25}
        />
      </mesh>
      <lineSegments geometry={part.links} frustumCulled={false}>
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
 * The retention platform: a column of customer rows with the churned
 * ones flagged, and the ROC curve the model was scored on drawn across
 * the front of it.
 *
 * @param {{from: number, to: number, side: number, z: number}} spec card
 * @returns {JSX.Element}
 */
function ChurnPiece({ spec }) {
  const tileRef = useRef(null);
  const flagRef = useRef(null);
  const glowRef = useRef(null);
  const site = useMemo(
    () => makeSite(spec.from, spec.to, spec.side * SIDE_X, spec.z, 9.9),
    [spec],
  );

  const part = useMemo(() => {
    const rnd = mulberry32(60217);
    const base = [];
    const flagged = [];
    const ROWS = 13;
    for (let r = 0; r < ROWS; r += 1) {
      const y = 0.9 + r * 0.62;
      for (let c = 0; c < 4; c += 1) {
        const pos = [-1.05 + c * 0.7, y, 0];
        (rnd() < 0.3 ? flagged : base).push(pos);
      }
    }
    // the ROC curve, drawn on a panel in front of the column
    const curve = [];
    for (let i = 0; i <= 24; i += 1) {
      const t = i / 24;
      curve.push(new THREE.Vector3(-1.5 + t * 3, 0.95 + Math.pow(t, 0.22) * 7.55, 1.3));
    }
    const diag = [
      new THREE.Vector3(-1.5, 0.95, 1.3),
      new THREE.Vector3(0, 4.72, 1.3),
      new THREE.Vector3(1.5, 8.5, 1.3),
    ];

    return {
      plinth: merge([box([3.2, 2.5, 2.4], [0, -0.9, 0])]),
      base,
      flagged,
      roc: tube(curve, 0.055),
      diag: tube(diag, 0.03),
    };
  }, []);

  // tile fields: one matrix write each, at mount
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s = new THREE.Vector3(0.6, 0.44, 1.8);
    const write = (mesh, list) => {
      if (!mesh) return;
      for (let i = 0; i < list.length; i += 1) {
        v.set(list[i][0], list[i][1], list[i][2]);
        m.compose(v, q, s);
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    };
    write(tileRef.current, part.base);
    write(flagRef.current, part.flagged);
  }, [part]);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    if (glowRef.current) {
      glowRef.current.emissiveIntensity = rise * (1.0 + 0.5 * Math.sin(t * 1.6));
    }
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="ChurnPiece">
      <mesh geometry={part.plinth}>
        <meshStandardMaterial color="#3a444b" metalness={0.4} roughness={0.38} />
      </mesh>
      <instancedMesh
        ref={tileRef}
        args={[undefined, undefined, part.base.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#2f383e" metalness={0.35} roughness={0.5} />
      </instancedMesh>
      <instancedMesh
        ref={flagRef}
        args={[undefined, undefined, part.flagged.length]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#4d4033"
          emissive="#ff9d4d"
          emissiveIntensity={1}
          roughness={0.4}
        />
      </instancedMesh>
      <mesh geometry={part.roc}>
        <meshStandardMaterial color="#bfeef7" emissive="#3fbfb0" emissiveIntensity={1.1} roughness={0.3} />
      </mesh>
      <mesh geometry={part.diag}>
        <meshBasicMaterial color="#5f7a80" />
      </mesh>
    </group>
  );
}

/**
 * The salary benchmark: five columns stepping down as the error falls,
 * the winning ensemble marked with a ring where it landed.
 *
 * @param {{from: number, to: number, side: number, z: number}} spec card
 * @returns {JSX.Element}
 */
function SalaryPiece({ spec }) {
  const ringRef = useRef(null);
  const site = useMemo(
    () => makeSite(spec.from, spec.to, spec.side * SIDE_X, spec.z, 10.0),
    [spec],
  );

  const part = useMemo(() => {
    const heights = [8.4, 6.6, 5.1, 3.8, 2.7];
    const hard = [box([3.4, 2.5, 2.4], [0, -0.9, 0])];
    const win = [];
    const tops = [];
    heights.forEach((h, i) => {
      const x = -1.34 + i * 0.67;
      const top = 0.35 + h;
      (i === heights.length - 1 ? win : hard).push(box([0.58, h, 1.6], [x, 0.35 + h / 2, 0]));
      tops.push(new THREE.Vector3(x, top, 0.85));
    });
    return {
      hard: merge(hard),
      win: merge(win),
      fall: tube(tops, 0.05),
      ringGeo: new THREE.TorusGeometry(0.44, 0.07, 8, 28),
      lead: merge([box([0.1, 1.3, 0.1], [1.34, 3.7, 0])]),
    };
  }, []);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.position.y = 4.55 + Math.sin(t * 1.4) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="SalaryPiece">
      <mesh geometry={part.hard}>
        <meshStandardMaterial color="#3a444b" metalness={0.4} roughness={0.38} />
      </mesh>
      <mesh geometry={part.win}>
        <meshStandardMaterial
          color="#8fe6d8"
          emissive="#2bb5a6"
          emissiveIntensity={1.2}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>
      <mesh geometry={part.lead}>
        <meshStandardMaterial color="#8fe6d8" emissive="#2bb5a6" emissiveIntensity={0.8} />
      </mesh>
      <mesh geometry={part.fall}>
        <meshBasicMaterial color="#d7f4fa" />
      </mesh>
      <mesh ref={ringRef} geometry={part.ringGeo} position={[1.34, 4.55, 0]}>
        <meshStandardMaterial
          color="#ffe6b8"
          emissive="#ffb54d"
          emissiveIntensity={1.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

/**
 * The tournament backend: a fixture bracket grown from the ground,
 * eight matches at the base resolving to one final at the top.
 *
 * @param {{from: number, to: number, side: number, z: number}} spec card
 * @returns {JSX.Element}
 */
function FixturePiece({ spec }) {
  const glowRef = useRef(null);
  const site = useMemo(
    () => makeSite(spec.from, spec.to, spec.side * SIDE_X, spec.z, 10.5),
    [spec],
  );

  const part = useMemo(() => {
    const hard = [box([3.4, 2.5, 2.2], [0, -0.9, 0])];
    const nodes = [];
    const edges = [];
    const SPAN = 1.6;
    const cols = [8, 4, 2, 1];
    const rowY = [1.1, 3.6, 6.0, 8.4];
    const at = [];
    cols.forEach((n, r) => {
      const step = (SPAN * 2) / n;
      const row = [];
      for (let i = 0; i < n; i += 1) {
        const x = -SPAN + step * (i + 0.5);
        row.push([x, rowY[r]]);
        nodes.push(box([0.24, 0.24, 0.24], [x, rowY[r], 0], 0.4));
      }
      at.push(row);
    });
    // every match feeds the one above it
    for (let r = 0; r < 3; r += 1) {
      for (let i = 0; i < at[r + 1].length; i += 1) {
        const [ax, ay] = at[r][i * 2];
        const [bx, by] = at[r][i * 2 + 1];
        const [cx, cy] = at[r + 1][i];
        edges.push(ax, ay, 0, cx, cy, 0, bx, by, 0, cx, cy, 0);
      }
    }
    // mast on the path side, set back so it clears the bracket
    hard.push(box([0.18, 9.4, 0.18], [1.5, 4.95, -1.4]));
    hard.push(box([0.7, 0.14, 0.7], [1.5, 9.4, -1.4]));

    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges), 3));
    return { hard: merge(hard), nodes: merge(nodes), edgeGeo, final: at[3][0] };
  }, []);

  const groupRef = useDiscovery(site, (rise, camZ, p, t) => {
    if (glowRef.current) glowRef.current.emissiveIntensity = rise * (1.0 + 0.5 * Math.sin(t * 2.1));
  });

  return (
    <group ref={groupRef} position={[site.x, site.gy, site.z]} visible={false} name="FixturePiece">
      <mesh geometry={part.hard}>
        <meshStandardMaterial color="#3a444b" metalness={0.4} roughness={0.38} />
      </mesh>
      <mesh geometry={part.nodes}>
        <meshStandardMaterial color="#7f8a93" metalness={0.3} roughness={0.45} />
      </mesh>
      <mesh position={[part.final[0], part.final[1], 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          ref={glowRef}
          color="#ffe6b8"
          emissive="#ffb54d"
          emissiveIntensity={1}
          roughness={0.25}
        />
      </mesh>
      <lineSegments geometry={part.edgeGeo} frustumCulled={false}>
        <lineBasicMaterial
          color="#8fe6d8"
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}

/**
 * The projects gallery: five discoveries, one per card, each standing
 * only while its own card is on screen.
 *
 * @returns {JSX.Element}
 */
export default function ProjectGallery() {
  return (
    <>
      <TrajectoryPiece spec={CARDS.trajectory} />
      <PapersPiece spec={CARDS.papers} />
      <ChurnPiece spec={CARDS.churn} />
      <SalaryPiece spec={CARDS.salary} />
      <FixturePiece spec={CARDS.fixture} />
    </>
  );
}
