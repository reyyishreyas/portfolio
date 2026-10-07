import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState } from './journey';
import { mulberry32, smoothstep } from './utils';

// module-scope uniforms: mutable outside render, shared with the material
const uniforms = {
  uTime: { value: 0 },
  uOpacity: { value: 0 },
  uColor: { value: new THREE.Color('#7fd8e8') },
};

const streamVertex = /* glsl */ `
  attribute float aLane;
  attribute float aPhase;
  attribute float aSpeed;
  uniform float uTime;
  uniform float uOpacity;
  varying float vA;
  void main() {
    // travel in ordered lanes through the transformation and research
    // zones: nature's dust resolving into a system
    float t = fract(aPhase + uTime * aSpeed);
    float e = t * t * (3.0 - 2.0 * t);
    float z = mix(-148.0, -244.0, e);
    float x = sin(t * 3.14159 * 1.8) * (1.0 - t) * (1.0 - t) * 0.9 + aLane;
    float y = 0.3 + abs(fract(aLane * 7.31) - 0.5) * 1.1;
    vec4 mv = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = (22.0 / -mv.z) * (1.4 + fract(aPhase * 13.0));
    gl_Position = projectionMatrix * mv;
    float ends = smoothstep(0.0, 0.05, t) * smoothstep(1.0, 0.95, t);
    vA = uOpacity * ends;
  }
`;

const streamFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vA;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.06, d) * vA;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a * 0.9);
  }
`;

/**
 * Ordered points gliding along the path in lanes — the forest's
 * underlying intelligence, visible only in the journey's second half.
 *
 * @param {{count: number}} props
 * @returns {JSX.Element}
 */
export default function DataStream({ count }) {
  const { geometry, material } = useMemo(() => {
    const rnd = mulberry32(88123);
    const lanes = new Float32Array(count);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);
    const positions = new Float32Array(count * 3); // unused by shader, required attr
    for (let i = 0; i < count; i += 1) {
      lanes[i] = (rnd() - 0.5) * 3.6;
      phases[i] = rnd();
      speeds[i] = 0.022 + rnd() * 0.03;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aLane', new THREE.BufferAttribute(lanes, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, -196), 70);

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: streamVertex,
      fragmentShader: streamFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, [count]);

  useFrame((state) => {
    const p = journeyState.progress;
    uniforms.uTime.value = state.clock.elapsedTime;
    // intelligence visible from the storm on, gone when nature returns
    uniforms.uOpacity.value =
      smoothstep(0.3, 0.5, p) * (1 - smoothstep(0.82, 0.88, p));
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
