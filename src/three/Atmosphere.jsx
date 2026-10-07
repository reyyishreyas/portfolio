import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from './utils';

const moteVertex = /* glsl */ `
  uniform float uTime;
  attribute float aPhase;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.25 + aPhase * 6.2831) * 0.5;
    p.x += sin(uTime * 0.16 + aPhase * 4.0) * 0.7;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (26.0 / -mv.z) * (0.7 + aPhase);
    gl_Position = projectionMatrix * mv;
    vAlpha = 0.35 + 0.65 * aPhase;
  }
`;

const moteFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float a = smoothstep(0.5, 0.08, d) * vAlpha;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a * 0.55);
  }
`;

/**
 * Slow-drifting motes lit like pollen in sun shafts, plus a couple of
 * warm glow patches that read as light coming through leaves.
 *
 * @param {{count: number}} props
 * @returns {JSX.Element}
 */
export default function Atmosphere({ count }) {
  const pointsRef = useRef(null);

  const geometry = useMemo(() => {
    const rnd = mulberry32(5150);
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rnd() - 0.5) * 46;
      positions[i * 3 + 1] = 0.4 + rnd() * 7.5;
      positions[i * 3 + 2] = 24 - rnd() * 400;
      phases[i] = rnd();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color('#ffe6bf') },
        },
        vertexShader: moteVertex,
        fragmentShader: moteFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    // mutate through the scene-graph ref: legal in a frame callback,
    // unlike writing to a value owned by render
    const mat = pointsRef.current?.material;
    if (mat?.uniforms?.uTime) mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}
