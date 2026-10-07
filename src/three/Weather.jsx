import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { rainAmount, stormAmount, submergedAmount, waterLevel, wetAmount } from './beats';
import { groundHeight, mulberry32, smoothstep } from './utils';
import { groundMaterial, skyMaterial, sunDiscMaterial } from './materials';

const RAIN_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmount;
  uniform vec3 uOrigin;
  attribute vec3 aSeed;
  varying float vA;
  void main() {
    // each streak falls in a personal loop; slant follows the wind
    float speed = 9.0 + aSeed.z * 5.0;
    float h = 9.0;
    float y = mod(aSeed.y * h - uTime * speed, h);
    // head sits on the drop; the tail vertex trails behind it along the
    // fall line (both verts share a seed, so position.y is what splits them)
    vec3 p = uOrigin + vec3(
      (aSeed.x - 0.5) * 30.0 - y * 0.16,
      y - 1.2,
      (aSeed.z - 0.5) * 30.0 - y * 0.10
    ) + position.y * vec3(0.16, -1.0, 0.10);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;    // fade in by amount: seeds above the threshold drop out
    vA = step(aSeed.z, uAmount) * (0.30 + 0.30 * aSeed.x);
    vA *= smoothstep(0.0, 0.6, y) * smoothstep(h, h - 1.5, y);
  }
`;

const RAIN_FRAG = /* glsl */ `
  varying float vA;
  void main() {
    if (vA < 0.01) discard;
    gl_FragColor = vec4(0.62, 0.72, 0.82, vA);
  }
`;

// module scope: the frame loop mutates these every tick
const { rainGeo, rainMat } = (() => {
  const count = 1400;
  const rnd = mulberry32(9911);
  // short line segments: two verts sharing a seed, tail offset below
  const positions = new Float32Array(count * 2 * 3);
  const seeds = new Float32Array(count * 2 * 3);
  for (let i = 0; i < count; i += 1) {
    const sx = rnd();
    const sy = rnd();
    const sz = rnd();
    for (let e = 0; e < 2; e += 1) {
      const vi = (i * 2 + e) * 3;
      positions[vi] = 0;
      positions[vi + 1] = e === 0 ? 0 : -0.45;
      positions[vi + 2] = 0;
      seeds[vi] = sx;
      seeds[vi + 1] = sy;
      seeds[vi + 2] = sz;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmount: { value: 0 },
      uOrigin: { value: new THREE.Vector3() },
    },
    vertexShader: RAIN_VERT,
    fragmentShader: RAIN_FRAG,
    transparent: true,
    depthWrite: false,
  });
  return { rainGeo: geo, rainMat: mat };
})();

const puddleMat = new THREE.MeshStandardMaterial({
  color: '#0f1a20',
  roughness: 0.18,
  metalness: 0.7,
  transparent: true,
  opacity: 0,
});

// wetness tracked across frames (materials start dry)
const wetState = { cur: 0 };
// lightning strike bookkeeping shared with the strike clock mesh
const strikeState = { next: 2.5, remaining: 0 };
const flashLift = new THREE.Color('#c8d4e2');

/**
 * Rain as a camera-following volume of falling streaks, the ground
 * turning dark and glossy beneath it, puddles gathering at the path's
 * edge, and lightning that lives only inside the storm beat.
 *
 * @returns {JSX.Element}
 */
export default function Weather() {
  const rainRef = useRef(null);
  const strikeRef = useRef(null);
  const flashRef = useRef(null);
  const puddleRefs = useRef([]);

  // puddles along the rain-soaked stretch of path
  const puddles = useMemo(() => {
    const rnd = mulberry32(515);
    const out = [];
    for (let i = 0; i < 10; i += 1) {
      const z = -76 - rnd() * 62;
      const x = (rnd() - 0.5) * 3.4 + Math.sin(z * 0.11) * 1.4;
      out.push({ x, z, y: groundHeight(x, z) + 0.02, r: 0.5 + rnd() * 0.9, yaw: rnd() * Math.PI });
    }
    return out;
  }, []);

  useFrame((state, delta) => {
    const p = journeyState.progress;
    const t = state.clock.elapsedTime;
    const rain = rainAmount(p);
    const storm = stormAmount(p);
    const wet = wetAmount(p);
    const cam = state.camera;

    // rain volume rides with the visitor
    if (rainRef.current) {
      rainRef.current.visible = rain > 0.01;
      rainMat.uniforms.uTime.value = t;
      rainMat.uniforms.uAmount.value = rain;
      rainMat.uniforms.uOrigin.value.set(cam.position.x, cam.position.y, cam.position.z);
    }

    // wet ground: darker, cooler, glossy enough to catch the light.
    // Once the visitor is under water the floor scatters instead of
    // reflecting — a submerged surface must not catch a sun glint.
    wetState.cur += (wet - wetState.cur) * (1 - Math.exp(-delta * 2));
    const w = wetState.cur;
    const sub = submergedAmount(p);
    // flood water standing over the floor kills the glint as well
    const underWater = Math.max(sub, smoothstep(0, 0.8, waterLevel(p)));
    // gloss floor 0.5: the wet sheen stays visible but a wide, soft
    // highlight instead of a blown-out white pool at grazing angles
    groundMaterial.roughness = 1 - w * 0.5 * (1 - underWater);
    groundMaterial.color.setRGB(1 - w * 0.42, 1 - w * 0.36, 1 - w * 0.3);

    // puddles appear with the wetness
    puddleMat.opacity = w * 0.85;
    puddleRefs.current.forEach((m) => {
      if (m) m.visible = w > 0.03;
    });

    // lightning: irregular strikes inside the storm beat. Runs after
    // the environment director each frame, so lifting sky + sun disc
    // here reads as the world flashing.
    let flash = 0;
    if (storm > 0.05) {
      strikeState.next -= delta;
      if (strikeState.next <= 0) {
        strikeState.next = 3.5 + Math.random() * 5;
        strikeState.remaining = 0.5;
      }
      if (strikeState.remaining > 0) {
        strikeState.remaining = Math.max(0, strikeState.remaining - delta);
        const u = 1 - strikeState.remaining / 0.5;
        flash = Math.max(0, Math.sin(u * Math.PI * 3.2)) * (1 - u) * storm;
      }
    }
    if (flashRef.current) flashRef.current.intensity = flash * 3.2;
    if (strikeRef.current) strikeRef.current.userData.flash = flash;
    if (flash > 0.01) {
      skyMaterial.color.lerp(flashLift, flash * 0.45);
      sunDiscMaterial.color.lerp(flashLift, flash * 0.45);
    }
  });

  return (
    <group>
      <lineSegments ref={rainRef} geometry={rainGeo} material={rainMat} frustumCulled={false} />

      {/* flash light: cold, high, from beyond the canopy */}
      <directionalLight ref={flashRef} position={[18, 34, -70]} intensity={0} color="#cfe0ff" />

      {/* clock holder for strike timing (no geometry) */}
      <mesh ref={strikeRef} visible={false} />

      {puddles.map((pud, i) => (
        <mesh
          key={i}
          ref={(el) => {
            puddleRefs.current[i] = el;
          }}
          position={[pud.x, pud.y, pud.z]}
          rotation={[-Math.PI / 2, 0, pud.yaw]}
          material={puddleMat}
        >
          <circleGeometry args={[pud.r, 22]} />
        </mesh>
      ))}
    </group>
  );
}
