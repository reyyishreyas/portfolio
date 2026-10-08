import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState, QA_HOOKS } from './journey';
import { skyMaterial, sunDiscMaterial } from './materials';
import { windUniforms } from './wind';

/**
 * Environment keyframes along the journey. Each entry is the world's
 * state at a moment in scroll time: fog (colour + density), sky tint,
 * sunlight, ambient fill and wind strength. The director interpolates
 * between neighbouring keys, so weather arrives as a change you watch
 * happen, never a switch.
 */
const KEYS = [
  // first light through the canopy (default forest)
  { p: 0.0, fog: '#161e16', d: 0.021, sky: '#ffffff', sun: 3.35, sunC: '#ffe6bc', hemi: 1.0, amb: 0.66, wind: 1, disc: '#fff2d2' },
  { p: 0.16, fog: '#151a15', d: 0.024, sky: '#e6e8e6', sun: 2.7, sunC: '#f4e3c6', hemi: 0.9, amb: 0.6, wind: 1.4, disc: '#efe4c8' },
  // rain established: cold, dimmed, wind picking up
  { p: 0.23, fog: '#131a1d', d: 0.03, sky: '#77818c', sun: 1.1, sunC: '#c9d4de', hemi: 0.75, amb: 0.5, wind: 2.1, disc: '#aab4bd' },
  // storm peak
  { p: 0.3, fog: '#0f1418', d: 0.038, sky: '#4d5763', sun: 0.55, sunC: '#b9c6d2', hemi: 0.6, amb: 0.42, wind: 3.2, disc: '#5d666f' },
  // the flood closes over
  { p: 0.35, fog: '#113038', d: 0.05, sky: '#4f7f8c', sun: 0.7, sunC: '#cfe6ea', hemi: 0.65, amb: 0.5, wind: 2.2, disc: '#7f9aa2' },
  // submerged: teal deep, light from far above
  { p: 0.4, fog: '#0d3a4b', d: 0.075, sky: '#1f7288', sun: 0.9, sunC: '#cdeef5', hemi: 0.55, amb: 0.55, wind: 0.35, disc: '#8fd4e6' },
  // transformation: the water of thought becomes structure
  { p: 0.47, fog: '#0b1a20', d: 0.05, sky: '#2f5560', sun: 1.0, sunC: '#d8f0f4', hemi: 0.6, amb: 0.5, wind: 0.6, disc: '#a8ccd8' },
  // computation world: dark slate blue, clear cold light
  { p: 0.56, fog: '#0a1116', d: 0.033, sky: '#243946', sun: 1.15, sunC: '#cfe6ff', hemi: 0.65, amb: 0.5, wind: 0.8, disc: '#97c4d8' },
  // research: a shade deeper, starlit
  { p: 0.66, fog: '#0a1218', d: 0.032, sky: '#2a4157', sun: 1.2, sunC: '#d6e9ff', hemi: 0.68, amb: 0.52, wind: 0.8, disc: '#a3c6e8' },
  // ASTRA: precise graphite light, engineered clarity
  { p: 0.76, fog: '#101317', d: 0.03, sky: '#33373d', sun: 1.5, sunC: '#e9edf4', hemi: 0.7, amb: 0.5, wind: 0.7, disc: '#c9cdd6' },
  // human quiet: dawn warmth returns
  { p: 0.86, fog: '#1a2018', d: 0.024, sky: '#ffd9a8', sun: 2.3, sunC: '#ffdfb0', hemi: 0.9, amb: 0.6, wind: 1.1, disc: '#ffdfb0' },
  // the same forest as the beginning
  { p: 0.95, fog: '#161e16', d: 0.021, sky: '#ffffff', sun: 3.35, sunC: '#ffe6bc', hemi: 1.0, amb: 0.66, wind: 1, disc: '#fff2d2' },
  { p: 1.0, fog: '#161e16', d: 0.021, sky: '#ffffff', sun: 3.35, sunC: '#ffe6bc', hemi: 1.0, amb: 0.66, wind: 1, disc: '#fff2d2' },
];

// parse the colour keys once
const PARSED = KEYS.map((k) => ({
  ...k,
  fogC: new THREE.Color(k.fog),
  skyC: new THREE.Color(k.sky),
  sunCC: new THREE.Color(k.sunC),
  discC: new THREE.Color(k.disc),
}));

/**
 * Find the bracketing keyframes for progress p and fill `out` with
 * the interpolated environment state.
 *
 * @param {number} p journey progress
 * @param {object} out working state mutated in place
 * @returns {object} out
 */
function sample(p, out) {
  let i = 1;
  while (i < PARSED.length - 1 && PARSED[i].p < p) i += 1;
  const a = PARSED[i - 1];
  const b = PARSED[i];
  const u = b.p === a.p ? 0 : Math.max(0, Math.min(1, (p - a.p) / (b.p - a.p)));
  const e = u * u * (3 - 2 * u);
  out.fog.lerpColors(a.fogC, b.fogC, e);
  out.sky.lerpColors(a.skyC, b.skyC, e);
  out.sun.lerpColors(a.sunCC, b.sunCC, e);
  out.disc.lerpColors(a.discC, b.discC, e);
  out.d = a.d + (b.d - a.d) * e;
  out.sunI = a.sun + (b.sun - a.sun) * e;
  out.hemi = a.hemi + (b.hemi - a.hemi) * e;
  out.amb = a.amb + (b.amb - a.amb) * e;
  out.wind = a.wind + (b.wind - a.wind) * e;
  return out;
}

/**
 * The world's light and air. One director reads the journey every
 * frame and moves fog, sky, sunlight and wind between the authored
 * keyframes — this is what turns the forest into storm, flood,
 * deep water, machine and morning.
 *
 * @param {{shadows: boolean}} props
 * @returns {JSX.Element}
 */
export default function EnvironmentDirector({ shadows }) {
  const sunRef = useRef(null);
  const hemiRef = useRef(null);
  const ambRef = useRef(null);
  const state = useMemo(
    () => ({
      fog: new THREE.Color(),
      sky: new THREE.Color(),
      sun: new THREE.Color(),
      disc: new THREE.Color(),
      d: 0.021,
      sunI: 3.35,
      hemi: 1,
      amb: 0.66,
      wind: 1,
    }),
    []
  );

  useFrame((sceneState) => {
    const p = journeyState.progress;
    sample(p, state);
    const scene = sceneState.scene;

    if (scene.fog) {
      scene.fog.color.copy(state.fog);
      scene.fog.density = state.d;
    }
    if (scene.background && scene.background.isColor) scene.background.copy(state.fog);
    skyMaterial.color.copy(state.sky);
    windUniforms.uWind.value = state.wind;

    if (sunRef.current) {
      sunRef.current.intensity = state.sunI;
      sunRef.current.color.copy(state.sun);
    }
    if (hemiRef.current) hemiRef.current.intensity = state.hemi;
    if (ambRef.current) ambRef.current.intensity = state.amb;
    // god-ray disc dims under cloud, flares in dawn
    sunDiscMaterial.color.copy(state.disc);
    if (QA_HOOKS) {
      journeyState.env = {
        fog: `#${state.fog.getHexString()}`,
        d: Number(state.d.toFixed(4)),
        sky: `#${state.sky.getHexString()}`,
        sun: Number(state.sunI.toFixed(2)),
        wind: Number(state.wind.toFixed(2)),
      };
    }
  });

  return (
    <group>
      <hemisphereLight ref={hemiRef} args={['#a3bdd2', '#33422a', 1.0]} />
      <ambientLight ref={ambRef} color="#31432c" intensity={0.66} />
      <directionalLight
        ref={sunRef}
        position={[-30, 18, -56]}
        intensity={3.35}
        color="#ffe6bc"
        castShadow={shadows}
        shadow-intensity={0.78}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={4}
        shadow-camera-far={140}
        shadow-camera-left={-46}
        shadow-camera-right={46}
        shadow-camera-top={46}
        shadow-camera-bottom={-46}
        shadow-bias={-0.0004}
      />
      {/* cool fill from behind the visitor: lifts the shadow side facing camera */}
      <directionalLight position={[12, 9, 26]} intensity={1.0} color="#8fa6ba" />
    </group>
  );
}
