import { Suspense, useMemo, useRef, useState } from 'react';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { journeyState, pathZ } from './journey';
import { groundHeight, mulberry32, smoothstep } from './utils';

// Wildlife models — all CC0 / public domain, no attribution required:
//   Stag, Deer: Quaternius "Ultimate Animated Animal Pack"
//     https://quaternius.com/packs/ultimateanimatedanimals.html (CC0)
//   Bird:       Quaternius "Bird" via poly.pizza (CC0 1.0)
// The originals ship as .gltf with 13 clips each; repacked as .glb with
// only the six clips this story uses, and mounted only inside the
// journey windows below (lazy-load: nothing fetches at app start).
const STAG_URL = '/assets/models/stag.glb';
const DEER_URL = '/assets/models/deer.glb';
const BIRD_URL = '/assets/models/bird.glb';

// the pack models are authored oversized (a stag is 5.4 units tall);
// these factors bring them to real forest scale
const STAG_SCALE = 0.4;   // ~2.1 m to antler tips
const DEER_SCALE = 0.36;  // ~1.5 m, visibly smaller than the stag
const BIRD_SCALE = 0.9;   // ~0.7 m wingspan

// +Math.PI if a model's nose points down -z instead of +z (set by QA)
const FACE = 0;

// phone half-FOV is only ~13.5° (vs ~40° desktop): lateral staging
// compresses on the lite tier so the notice → follow beat stays in
// frame; z staging (the 11 m follow gap) is unchanged
const FULL_SPREAD = 1;
const LITE_SPREAD = 0.2;

// world staging: the follow phase keeps the stag 11 m ahead of the
// camera (pathZ(p) - FOLLOW_GAP), and STAG_Z0 equals that expression
// at p = 0.1, so notice → walk has no positional jump
const FOLLOW_GAP = 11;
const STAG_X0 = -4.5;
const STAG_X1 = -3.8;
const STAG_Z0 = pathZ(0.1) - FOLLOW_GAP;
const STAG_Z1 = pathZ(0.18) - FOLLOW_GAP;
const DEER_X0 = 7.5;
const DEER_X1 = 12.5;
const DEER_Z0 = -52;
const DEER_Z1 = -100;

// choreography marks (journey progress) — one scripted story, no
// random spawning: appear far away → notice → pause → walk away
const STAG_NOTICE = 0.085;
const STAG_FOLLOW = 0.1;
const STAG_CLEARING_END = 0.18;
const STAG_BOLT = 0.185;
const STAG_GONE = 0.235;   // hidden once the rain fully lands
const DEER_NOTICE = 0.088;
const DEER_WALK = 0.105;
const DEER_GONE = 0.175;   // gone before the weather turns

// mount windows: forest fauna through the clearing, birds again when
// nature returns at the end
const ZONE_FAUNA_END = 0.245;
const ZONE_ENDING = 0.795;

/**
 * Crossfade to a clip, ignoring repeats. Missing clips retry next
 * frame (actions bind one effect after the GLTF suspends).
 *
 * @param {Record<string, {fadeOut: (f: number) => void, reset: () => void, fadeIn: (f: number) => {play: () => void}, play: () => void}>} actions
 * @param {{current: string | null}} state
 * @param {string} name
 * @param {number} [fade]
 * @returns {void}
 */
function play(actions, state, name, fade = 0.3) {
  if (state.current === name) return;
  const next = actions[name];
  if (!next) return;
  const prev = state.current ? actions[state.current] : null;
  if (prev && prev !== next) prev.fadeOut(fade);
  next.reset().fadeIn(fade).play();
  state.current = name;
}

/**
 * Shortest-path angle interpolation so turns never spin the long way.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
function lerpAngle(a, b, t) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}

/**
 * Yaw that points a +z-nosed model from (x0, z0) toward (x1, z1).
 *
 * @param {number} x0
 * @param {number} z0
 * @param {number} x1
 * @param {number} z1
 * @returns {number}
 */
function faceYaw(x0, z0, x1, z1) {
  return Math.atan2(x1 - x0, z1 - z0);
}

/**
 * The lead animal. Grazes far up the path, notices the visitor as the
 * camera closes, walks ahead into the clearing (position scrubbed to
 * pathZ), then bolts when the rain arrives. Idle loops run on the
 * clock, so the forest lives even when scrolling stops.
 *
 * @returns {JSX.Element}
 */
function Stag({ spread }) {
  const { scene, animations } = useGLTF(STAG_URL);
  const ref = useRef(null);
  const anim = useRef(/** @type {string | null} */ (null));
  const yaw = useRef(Math.PI / 2 + FACE);
  const { actions } = useAnimations(animations, ref);
  const x0 = STAG_X0 * spread;
  const x1 = STAG_X1 * spread;

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const p = journeyState.progress;
    const visible = p < STAG_GONE;
    if (g.visible !== visible) g.visible = visible;
    if (!visible) return;

    const dt = Math.min(delta, 0.1);
    let x = x0;
    let z = STAG_Z0;
    let mode = 'Idle_Headlow';
    let target = Math.PI / 2 + FACE; // flank to the path while grazing

    if (p < STAG_NOTICE) {
      // head-down grazing between the trees
    } else if (p < STAG_FOLLOW) {
      // notices the visitor: head up, turned toward the camera
      mode = 'Idle_2';
      target = faceYaw(g.position.x, g.position.z, state.camera.position.x, state.camera.position.z) + FACE;
    } else if (p < STAG_CLEARING_END) {
      // walks ahead of the camera to the clearing (scrubbed, so it
      // stays 11 m in front however fast the visitor scrolls)
      z = pathZ(p) - FOLLOW_GAP;
      x = x0 + (x1 - x0) * smoothstep(STAG_FOLLOW, 0.16, p);
      mode = 'Walk';
      target = Math.PI + FACE; // deeper into the forest
    } else if (p < STAG_BOLT) {
      // holds at the clearing edge while the reveal plays
      x = x1;
      z = STAG_Z1;
      mode = 'Idle_2';
      target = faceYaw(x, z, state.camera.position.x, state.camera.position.z) + FACE;
    } else {
      // first rain: bolts away down the corridor
      const t = (p - STAG_BOLT) / (STAG_GONE - STAG_BOLT);
      x = x1 - 2.2 * spread * t;
      z = STAG_Z1 - 36 * t;
      mode = 'Gallop';
      target = Math.PI + FACE;
    }

    const rate = mode === 'Idle_Headlow' ? 4 : 3;
    yaw.current = lerpAngle(yaw.current, target, Math.min(1, dt * rate));
    if (g.position.x !== x || g.position.z !== z) {
      g.position.set(x, groundHeight(x, z), z);
    }
    g.rotation.y = yaw.current;
    play(actions, anim, mode);
  });

  return (
    <group ref={ref} name="wildlife-stag" position={[STAG_X0 * spread, 0, STAG_Z0]} scale={STAG_SCALE}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * The second deer: a distant silhouette between the trees that looks
 * up when the camera nears, then walks away deeper — faster than the
 * camera follows — until the fog and the weather take it.
 *
 * @returns {JSX.Element}
 */
function Deer({ spread }) {
  const { scene, animations } = useGLTF(DEER_URL);
  const ref = useRef(null);
  const anim = useRef(/** @type {string | null} */ (null));
  const yaw = useRef(-Math.PI / 2 + FACE);
  const { actions } = useAnimations(animations, ref);
  const x0 = DEER_X0 * spread;
  const x1 = DEER_X1 * spread;
  const dir = Math.atan2(x1 - x0, DEER_Z1 - DEER_Z0);

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    const p = journeyState.progress;
    const visible = p < DEER_GONE;
    if (g.visible !== visible) g.visible = visible;
    if (!visible) return;

    const dt = Math.min(delta, 0.1);
    let x = x0;
    let z = DEER_Z0;
    let mode = 'Idle_Headlow';
    let target = -Math.PI / 2 + FACE; // facing the path from the right

    if (p < DEER_NOTICE) {
      // grazing far off between the trees
    } else if (p < DEER_WALK) {
      // pauses, head up, looking at the visitor
      mode = 'Idle_2';
      target = faceYaw(x, z, state.camera.position.x, state.camera.position.z) + FACE;
    } else {
      // steady trot away into the forest (constant speed: linear t)
      const t = Math.min(1, (p - DEER_WALK) / (DEER_GONE - DEER_WALK));
      x = x0 + (x1 - x0) * t;
      z = DEER_Z0 + (DEER_Z1 - DEER_Z0) * t;
      mode = 'Walk';
      target = dir + FACE;
    }

    yaw.current = lerpAngle(yaw.current, target, Math.min(1, dt * 3));
    if (g.position.x !== x || g.position.z !== z) {
      g.position.set(x, groundHeight(x, z), z);
    }
    g.rotation.y = yaw.current;
    play(actions, anim, mode);
  });

  return (
    <group ref={ref} name="wildlife-deer" position={[DEER_X0 * spread, 0, DEER_Z0]} scale={DEER_SCALE}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Build one bird's flight state: an oval loop ahead of the camera.
 *
 * @param {number} seed
 * @param {number} spread lateral compression for the lite tier
 * @returns {{cx: number, cy: number, cz: number, cy0: number, a: number, rx: number, rz: number, w: number, ph: number, fleeing: boolean, armed: boolean, rnd: () => number}}
 */
function birdState(seed, spread) {
  const rnd = mulberry32(seed);
  const squeeze = 0.55 + 0.45 * spread;
  const rx = (9 + rnd() * 5) * squeeze;
  const rz = (7 + rnd() * 4) * squeeze;
  return {
    cx: 0,
    cy: 0,
    cz: 0,
    cy0: 0,
    a: rnd() * Math.PI * 2,
    rx,
    rz,
    w: (rnd() > 0.5 ? 1 : -1) * (0.34 + rnd() * 0.2),
    ph: rnd() * Math.PI * 2,
    fleeing: false,
    armed: false,
    rnd,
    spread,
  };
}

/**
 * Place the loop ahead of the current camera position; called on
 * mount, when the camera closes in, and if the scroll reverses far
 * enough to leave the loop behind.
 *
 * @param {ReturnType<typeof birdState>} s
 * @param {{x: number, z: number}} cam
 * @returns {void}
 */
function anchor(s, cam) {
  const squeeze = 0.55 + 0.45 * s.spread;
  s.cx = cam.x + (s.rnd() - 0.5) * 9 * s.spread;
  s.cy0 = 4.2 + s.rnd() * 2;
  s.cy = s.cy0;
  s.cz = cam.z - 26 - s.rnd() * 8;
  s.rx = (9 + s.rnd() * 5) * squeeze;
  s.rz = (7 + s.rnd() * 4) * squeeze;
  s.fleeing = false;
  s.armed = true;
}

/**
 * Advance a bird one tick along its oval and return the new position.
 *
 * @param {ReturnType<typeof birdState>} s
 * @param {number} dt seconds since the last frame
 * @returns {{x: number, y: number, z: number}}
 */
function birdPos(s, dt) {
  s.a += s.w * (s.fleeing ? 2.4 : 1) * dt;
  return {
    x: s.cx + s.rx * Math.sin(s.a),
    y: s.cy + 0.55 * Math.sin(s.a * 2 + s.ph),
    z: s.cz + s.rz * Math.cos(s.a),
  };
}

/**
 * A bird looping between the trees. Time-driven (the sky stays alive
 * even without scrolling); it climbs and widens its circle when the
 * camera closes on it, then quietly restarts ahead once passed.
 *
 * @param {{seed: number, spread: number}} props
 * @returns {JSX.Element}
 */
function Bird({ seed, spread }) {
  const { scene } = useGLTF(BIRD_URL);
  const model = useMemo(() => clone(scene), [scene]);
  const ref = useRef(null);
  const sRef = useRef(/** @type {ReturnType<typeof birdState> | null} */ (null));

  useFrame((state, delta) => {
    const g = ref.current;
    if (!g) return;
    if (!sRef.current) sRef.current = birdState(seed, spread);
    const s = sRef.current;
    const p = journeyState.progress;
    const active = (p > 0.004 && p < ZONE_FAUNA_END) || p > ZONE_ENDING;
    if (g.visible !== active) g.visible = active;
    if (!active) {
      s.armed = false;
      return;
    }

    const dt = Math.min(delta, 0.1);
    const cam = state.camera.position;
    if (!s.armed || Math.abs(cam.z - s.cz) > 70) anchor(s, cam);
    if (g.rotation.order !== 'YXZ') g.rotation.order = 'YXZ';

    let pos = birdPos(s, dt);
    const dz = cam.z - pos.z;
    if (s.fleeing) {
      // startle: climb and widen the circle until out of view
      s.cy = Math.min(s.cy + 1.8 * dt, s.cy0 + 8);
      s.rx = Math.min(s.rx + 5 * dt, 22);
    } else if (dz < 12) {
      s.fleeing = true;
    } else {
      s.cy += (s.cy0 - s.cy) * Math.min(1, dt * 0.6);
    }
    if (dz < 4.5) {
      // flown past the camera: restart the loop further ahead
      anchor(s, cam);
      pos = birdPos(s, dt);
    }

    // tangent of the oval → heading; constant bank into the turn
    const vx = s.rx * Math.cos(s.a) * s.w;
    const vz = -s.rz * Math.sin(s.a) * s.w;
    g.position.set(pos.x, pos.y, pos.z);
    g.rotation.set(
      s.fleeing ? -0.22 : 0,
      Math.atan2(vx, vz) + FACE,
      -Math.sign(s.w) * (s.fleeing ? 0.65 : 0.4),
    );
  });

  return (
    <group ref={ref} name={`wildlife-bird-${seed}`} scale={BIRD_SCALE}>
      <primitive object={model} />
    </group>
  );
}

/**
 * Journey-windowed wildlife: nothing loads until the scroll leaves
 * the first frames, fauna unmounts once the rain has carried it off,
 * and fresh birds mount again when nature returns.
 *
 * @param {{quality: {mode: 'full' | 'lite' | 'fallback'}}} props
 * @returns {JSX.Element | null}
 */
export default function Wildlife({ quality }) {
  const [zone, setZone] = useState(0);
  const zoneRef = useRef(0);

  useFrame(() => {
    const p = journeyState.progress;
    const next = p > 0.002 && p < ZONE_FAUNA_END ? 1 : p > ZONE_ENDING ? 2 : 0;
    if (next !== zoneRef.current) {
      zoneRef.current = next;
      setZone(next);
    }
  });

  if (zone === 0) return null;

  const spread = quality.mode === 'full' ? FULL_SPREAD : LITE_SPREAD;
  const birds = Array.from({ length: quality.mode === 'full' ? 2 : 1 }, (_, i) => (
    <Bird key={`${zone}-${i}`} seed={(zone === 1 ? 4021 : 9101) + i * 77} spread={spread} />
  ));

  return (
    <group name="wildlife">
      <Suspense fallback={null}>
        {zone === 1 && <Stag spread={spread} />}
        {zone === 1 && <Deer spread={spread} />}
        {birds}
      </Suspense>
    </group>
  );
}
