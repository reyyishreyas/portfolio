import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  TextureLoader,
} from 'three';
import gsap from 'gsap';

const IMG_SRC = '/assets/images/shreyas_profile.jpg';
const SAMPLE_COLS = 110;
const WORLD_HEIGHT = 2.7;

const VERTEX_SHADER = `
  uniform float uProgress;
  uniform float uSize;
  attribute vec3 color;
  attribute vec3 aScatter;
  attribute float aRandom;
  varying vec3 vColor;

  void main() {
    vColor = color;
    // each point assembles on its own schedule (staggered by aRandom)
    float t = smoothstep(aRandom * 0.45, aRandom * 0.45 + 0.55, uProgress);
    vec3 pos = mix(aScatter, position, t);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    // scattered points start larger and shrink into place
    gl_PointSize = uSize * (100.0 / -mvPosition.z) * (1.0 + (1.0 - t) * 1.6);
  }
`;

const FRAGMENT_SHADER = `
  uniform float uOpacity;
  varying vec3 vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.3, dist) * uOpacity;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

/**
 * Sample the portrait into a point grid: xy from the pixel position,
 * z from luminance so highlights lift off the plane like a depth map.
 *
 * @param {HTMLImageElement} image source portrait
 * @returns {BufferGeometry} position/color/scatter attributes
 */
function buildGeometry(image) {
  const cols = SAMPLE_COLS;
  const rows = Math.round(cols * (image.height / image.width));

  const sampler = document.createElement('canvas');
  sampler.width = cols;
  sampler.height = rows;
  const ctx = sampler.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, cols, rows);
  const { data } = ctx.getImageData(0, 0, cols, rows);

  const worldWidth = WORLD_HEIGHT * (image.width / image.height);
  const count = cols * rows;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const scatter = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  const tint = new Color();

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const i = r * cols + c;
      const px = i * 4;
      const luminance =
        (data[px] * 0.2126 + data[px + 1] * 0.7152 + data[px + 2] * 0.0722) / 255;

      positions[i * 3] = (c / (cols - 1) - 0.5) * worldWidth;
      positions[i * 3 + 1] = (0.5 - r / (rows - 1)) * WORLD_HEIGHT;
      positions[i * 3 + 2] = (luminance - 0.45) * 0.55;

      tint.setRGB(data[px] / 255, data[px + 1] / 255, data[px + 2] / 255);
      colors[i * 3] = tint.r;
      colors[i * 3 + 1] = tint.g;
      colors[i * 3 + 2] = tint.b;

      // scattered start position: a shell behind/around the frame
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 1.7 + Math.random() * 1.5;
      scatter[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      scatter[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      scatter[i * 3 + 2] = radius * Math.cos(phi) - 0.8;

      randoms[i] = Math.random();
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aScatter', new Float32BufferAttribute(scatter, 3));
  geometry.setAttribute('aRandom', new Float32BufferAttribute(randoms, 1));
  return geometry;
}

/**
 * Point cloud + entrance animation + pointer parallax.
 *
 * @param {{onReady?: () => void}} props called after the first rendered frame
 * @returns {JSX.Element}
 */
function PortraitPoints({ onReady }) {
  const texture = useLoader(TextureLoader, IMG_SRC);
  const materialRef = useRef(null);
  const groupRef = useRef(null);
  const { gl } = useThree();

  const geometry = useMemo(() => buildGeometry(texture.image), [texture]);
  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uOpacity: { value: 0 },
      uSize: { value: 0.14 * gl.getPixelRatio() },
    }),
    [gl]
  );

  useEffect(() => {
    const proxy = { p: 0 };
    const tween = gsap.to(proxy, {
      p: 1,
      duration: 2.2,
      ease: 'power2.out',
      delay: 0.25,
      onUpdate: () => {
        // R3F applies a copy of the uniforms prop — mutate the material's own
        const u = materialRef.current?.uniforms;
        if (!u) return;
        u.uProgress.value = proxy.p;
        u.uOpacity.value = Math.min(1, proxy.p * 1.8);
      },
    });

    // hand off to the flat photo only once points have actually drawn
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => onReady?.(true))
    );

    return () => {
      tween.kill();
      cancelAnimationFrame(raf);
    };
  }, [onReady]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const ease = Math.min(1, delta * 3);
    group.rotation.y += (state.pointer.x * 0.16 - group.rotation.y) * ease;
    group.rotation.x += (-state.pointer.y * 0.1 - group.rotation.x) * ease;
  });

  return (
    <group ref={groupRef}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={VERTEX_SHADER}
          fragmentShader={FRAGMENT_SHADER}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/**
 * Hero portrait as an interactive point cloud. Lazily imported so the
 * three.js chunk never loads on mobile or reduced-motion devices.
 *
 * @param {{onReady?: () => void}} props
 * @returns {JSX.Element}
 */
export default function PointCloudPortrait({ onReady }) {
  const holderRef = useRef(null);
  const [inView, setInView] = useState(true);

  // stop rendering the cloud while the hero is scrolled out of view
  useEffect(() => {
    const el = holderRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="hero-cloud" ref={holderRef} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 4.4], fov: 35 }}
        frameloop={inView ? 'always' : 'never'}
      >
        <Suspense fallback={null}>
          <PortraitPoints onReady={onReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
