import { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState, pathAt } from './journey';
import { groundHeight, smoothstep } from './utils';

// module-scope uniforms: mutable outside render, shared with the material
const uniforms = {
  uTime: { value: 0 },
  uOpacity: { value: 0 },
  uColor: { value: new THREE.Color('#6fd3c8') },
};

const veinVertex = /* glsl */ `
  attribute float aU;
  varying float vU;
  void main() {
    vU = aU;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const veinFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColor;
  varying float vU;
  void main() {
    // several comet pulses travelling the fibre, over a faint base glow
    float head = fract(vU * 5.0 - uTime * 0.14);
    float pulse = smoothstep(0.1, 0.0, head);
    float alpha = (0.14 + pulse * 0.8) * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

const OFFSETS = [-2.15, -1.65, 1.65, 2.15];

/**
 * Luminous fibres that trace the walking path like roots carrying
 * signal: they fade in during the middle of the journey, each with
 * travelling pulses. The first hint that the forest contains a system.
 *
 * @returns {JSX.Element}
 */
export default function PathVeins() {
  const lines = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: veinVertex,
      fragmentShader: veinFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const SAMPLES = 160;
    return OFFSETS.map((ox, k) => {
      const positions = new Float32Array(SAMPLES * 3);
      const us = new Float32Array(SAMPLES);
      for (let i = 0; i < SAMPLES; i += 1) {
        const t = i / (SAMPLES - 1);
        const base = pathAt(t);
        const x = base.x + ox + Math.sin(t * 14 + k * 2.1) * 0.18;
        const z = base.z;
        positions[i * 3] = x;
        positions[i * 3 + 1] = groundHeight(x, z) + 0.035;
        positions[i * 3 + 2] = z;
        us[i] = t;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('aU', new THREE.BufferAttribute(us, 1));
      const line = new THREE.Line(geo, material);
      line.renderOrder = 2;
      return line;
    });
  }, []);

  useFrame((state) => {
    const p = journeyState.progress;
    uniforms.uTime.value = state.clock.elapsedTime;
    // roots carrying signal: awake through the worlds of thought,
    // sleeping again when the forest simply becomes a forest
    uniforms.uOpacity.value =
      smoothstep(0.3, 0.55, p) * (1 - smoothstep(0.82, 0.88, p));
  });

  return (
    <group>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}
