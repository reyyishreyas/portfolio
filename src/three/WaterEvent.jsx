import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { journeyState, QA_HOOKS } from './journey';
import { submergedAmount, waterLevel } from './beats';
import { mulberry32, smoothstep } from './utils';

const BUBBLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uAmount;
  uniform vec3 uOrigin;
  attribute vec3 aSeed;
  varying float vA;
  void main() {
    float h = 7.0;
    float y = mod(aSeed.y * h + uTime * (0.35 + aSeed.z * 0.5), h) - 1.5;
    float sway = sin(uTime * (0.7 + aSeed.z) + aSeed.x * 6.2831) * 0.35;
    vec3 p = uOrigin + vec3(
      (aSeed.x - 0.5) * 16.0 + sway,
      y,
      (aSeed.z - 0.5) * 16.0
    );
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (10.0 + aSeed.x * 14.0) / max(1.0, -mv.z) * 6.0;
    vA = uAmount * (0.25 + aSeed.y * 0.5);
  }
`;

const BUBBLE_FRAG = /* glsl */ `
  varying float vA;
  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    // ring-like bubble: bright rim, hollow middle
    float a = smoothstep(0.5, 0.34, d) * smoothstep(0.16, 0.3, d) * vA;
    if (a < 0.01) discard;
    gl_FragColor = vec4(0.72, 0.9, 0.95, a);
  }
`;

const SHAFT_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SHAFT_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uAmount;
  varying vec2 vUv;
  void main() {
    // a slow ribbon of light from the surface, fading along its length
    float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float fall = 1.0 - vUv.y;
    float sway = 0.85 + 0.15 * sin(uTime * 0.6 + vUv.x * 4.0);
    // clamp the base: pow() of a negative or zero base can return NaN,
    // and NaN slips past a plain "< threshold" test, so the additive
    // blend would spread it across the whole frame
    float a = pow(max(across, 0.0), 2.2) * fall * sway * uAmount * 0.4;
    if (!(a >= 0.005)) discard;
    gl_FragColor = vec4(0.65, 0.88, 0.95, a);
  }
`;

// module scope: the frame loop mutates these every tick
const waterMat = new THREE.MeshStandardMaterial({
  color: '#0e3d4e',
  roughness: 0.14,
  metalness: 0.5,
  transparent: true,
  opacity: 0.88,
  side: THREE.DoubleSide,
});

const shaftMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uAmount: { value: 0 } },
  vertexShader: SHAFT_VERT,
  fragmentShader: SHAFT_FRAG,
  transparent: true,
  depthWrite: false,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
});

const leafMat = new THREE.MeshStandardMaterial({
  color: '#5a7a44',
  roughness: 0.9,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0,
});

const { bubbleGeo, bubbleMat } = (() => {
  const count = 260;
  const rnd = mulberry32(77733);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    seeds[i * 3] = rnd();
    seeds[i * 3 + 1] = rnd();
    seeds[i * 3 + 2] = rnd();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAmount: { value: 0 },
      uOrigin: { value: new THREE.Vector3() },
    },
    vertexShader: BUBBLE_VERT,
    fragmentShader: BUBBLE_FRAG,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return { bubbleGeo: geo, bubbleMat: mat };
})();

// shafts of surface light in the submerged stretch
const shafts = (() => {
  const rnd = mulberry32(3141);
  const out = [];
  for (let i = 0; i < 6; i += 1) {
    out.push({
      x: (rnd() - 0.5) * 18,
      z: -138 - rnd() * 34,
      w: 1.6 + rnd() * 2.6,
      yaw: (rnd() - 0.5) * 0.7,
    });
  }
  return out;
})();

// leaves adrift in the slow water
const leaves = (() => {
  const rnd = mulberry32(2468);
  const out = [];
  for (let i = 0; i < 14; i += 1) {
    out.push({
      x: (rnd() - 0.5) * 14,
      y: 0.3 + rnd() * 2.4,
      z: -134 - rnd() * 36,
      s: 0.1 + rnd() * 0.14,
      yaw: rnd() * Math.PI,
      phase: rnd() * 6.28,
    });
  }
  return out;
})();

/**
 * The flood and the dream under it: a rising surface that closes
 * over the camera, bubbles drifting up, slabs of light falling from
 * far above, and leaves suspended in the slow water.
 *
 * @returns {JSX.Element}
 */
export default function WaterEvent() {
  const waterRef = useRef(null);
  const bubbleRef = useRef(null);
  const leafRef = useRef(null);
  const shaftRefs = useRef([]);

  useFrame((state) => {
    const p = journeyState.progress;
    const t = state.clock.elapsedTime;
    const level = waterLevel(p);
    const sub = submergedAmount(p);
    const cam = state.camera;

    if (waterRef.current) {
      const visible = level > -1.72;
      waterRef.current.visible = visible;
      if (visible) {
        // the surface follows the visitor so the world stays flooded
        waterRef.current.position.set(cam.position.x, level, cam.position.z);
        waterMat.opacity = 0.55 + smoothstep(1.6, 3.0, level) * 0.36;
      }
    }

    if (bubbleRef.current) {
      bubbleRef.current.visible = sub > 0.01;
      bubbleMat.uniforms.uTime.value = t;
      bubbleMat.uniforms.uAmount.value = sub;
      bubbleMat.uniforms.uOrigin.value.set(cam.position.x, cam.position.y - 1.4, cam.position.z);
    }

    shaftMat.uniforms.uTime.value = t;
    shaftMat.uniforms.uAmount.value = sub;
    shaftRefs.current.forEach((m, i) => {
      if (m) {
        m.visible = sub > 0.01;
        const sway = Math.sin(t * 0.24 + i * 1.7) * 0.16;
        m.rotation.z = shafts[i].yaw + sway;
      }
    });

    leafMat.opacity = sub * 0.9;
    if (leafRef.current) {
      leafRef.current.visible = sub > 0.01;
      leafRef.current.children.forEach((child, i) => {
        const lf = leaves[i];
        if (!lf) return;
        child.position.y = lf.y + Math.sin(t * 0.3 + lf.phase) * 0.3;
        child.rotation.y = lf.yaw + t * 0.12 + lf.phase;
        child.rotation.z = Math.sin(t * 0.4 + lf.phase) * 0.5;
      });
    }

    if (QA_HOOKS) {
      journeyState.water = {
        level: Number(level.toFixed(2)),
        sub: Number(sub.toFixed(2)),
        bVis: bubbleRef.current ? bubbleRef.current.visible : null,
        bAmt: Number(bubbleMat.uniforms.uAmount.value.toFixed(2)),
        sAmt: Number(shaftMat.uniforms.uAmount.value.toFixed(2)),
        shaft0: shaftRefs.current[0] ? shaftRefs.current[0].visible : null,
        wVis: waterRef.current ? waterRef.current.visible : null,
      };
    }
  });

  return (
    <group>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} material={waterMat} visible={false}>
        <planeGeometry args={[90, 140, 1, 1]} />
      </mesh>

      <points ref={bubbleRef} geometry={bubbleGeo} material={bubbleMat} frustumCulled={false} visible={false} />

      {shafts.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => {
            shaftRefs.current[i] = el;
          }}
          position={[s.x, 4.5, s.z]}
          material={shaftMat}
          visible={false}
        >
          <planeGeometry args={[s.w, 11]} />
        </mesh>
      ))}

      <group ref={leafRef} visible={false}>
        {leaves.map((lf, i) => (
          <mesh key={i} position={[lf.x, lf.y, lf.z]} scale={lf.s} material={leafMat}>
            <circleGeometry args={[1, 6]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
