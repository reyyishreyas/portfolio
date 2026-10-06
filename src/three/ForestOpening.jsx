import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { detectForestQuality, mulberry32 } from './utils';
import { journeyState } from './journey';
import CameraController from './CameraController';
import ForestAudioGate from './ForestAudioGate';
import IdentityReveal from './IdentityReveal';
import { getLenis } from '../lib/smoothScroll';

const ForestScene = lazy(() => import('./ForestScene'));

/**
 * Static layered forest silhouette used when WebGL or reduced-motion
 * rules out the real scene. Same seeded layout as the 3D world, so the
 * character stays consistent.
 *
 * @returns {JSX.Element}
 */
function ForestFallback() {
  const layers = useMemo(() => {
    const rnd = mulberry32(20261006);
    const build = (count, minH, maxH, baseY) => {
      let d = `M -20 ${baseY + 30} `;
      for (let i = 0; i <= count; i += 1) {
        const x = (i / count) * 1040 - 20;
        const w = 26 + rnd() * 34;
        const h = minH + rnd() * (maxH - minH);
        d += `L ${x - w / 2} ${baseY + 30} L ${x} ${baseY + 30 - h} L ${x + w / 2} ${baseY + 30} `;
      }
      d += `L 1060 ${baseY + 30} L 1060 620 L -20 620 Z`;
      return d;
    };
    return [
      { d: build(26, 120, 260, 300), fill: '#0a0f0b', opacity: 1, blur: 0 },
      { d: build(20, 90, 200, 380), fill: '#111a12', opacity: 1, blur: 0 },
      { d: build(14, 60, 150, 460), fill: '#18241a', opacity: 1, blur: 0 },
    ];
  }, []);

  return (
    <div className="forest-fallback" role="img" aria-label="Forest at first light">
      <div className="forest-fallback-sky" />
      <svg viewBox="0 0 1040 620" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        {layers.map((l, i) => (
          <path key={i} d={l.d} fill={l.fill} />
        ))}
      </svg>
      <div className="forest-fallback-mist" />
      {/* static twin of the journey reveal: content must exist without motion */}
      <div className="forest-identity is-static" aria-hidden="true">
        <p className="forest-identity-name">Reyyi Shreyas</p>
        <span className="forest-identity-rule" />
        <p className="forest-identity-role">AI / ML · Research · Engineering</p>
      </div>
    </div>
  );
}

/**
 * The opening environment: a full-viewport window into the forest,
 * rendered on the best tier the device supports.
 *
 * @returns {JSX.Element}
 */
export default function ForestOpening() {
  const quality = useMemo(() => detectForestQuality(), []);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(true);

  // pause the WebGL loop entirely while the pinned section is offscreen
  useEffect(() => {
    const section = sectionRef.current;
    if (quality.mode === 'fallback' || !section) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(section);
    return () => io.disconnect();
  }, [quality.mode]);

  // map the pinned section's travel to journey progress 0 → 1
  useEffect(() => {
    const section = sectionRef.current;
    if (quality.mode === 'fallback' || !section) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        journeyState.progress = self.progress;
      },
    });
    return () => st.kill();
  }, [quality.mode]);

  if (quality.mode === 'fallback') return <ForestFallback />;

  return (
    <section ref={sectionRef} className="forest-opening" aria-label="Forest introduction">
      <div className="forest-stage">
        <Canvas
          dpr={quality.dpr}
          shadows={quality.shadows ? 'percentage' : false}
          camera={{ position: [0, 1.7, 17.9], fov: 55, near: 0.1, far: 400 }}
          gl={{ antialias: true, powerPreference: 'high-performance', toneMappingExposure: 1.34 }}
          frameloop={inView ? 'always' : 'never'}
        >
          <CameraController />
          <Suspense fallback={null}>
            <ForestScene quality={quality} />
          </Suspense>
        </Canvas>
        <div className="forest-vignette" aria-hidden="true" />
        <ForestAudioGate />
        <IdentityReveal />
        <button
          type="button"
          className="forest-skip"
          onClick={() => {
            const hero = document.querySelector('.hero-section');
            const y = hero ? hero.getBoundingClientRect().top + window.scrollY : 0;
            const lenis = getLenis();
            if (lenis) {
              lenis.scrollTo(y);
            } else {
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
        >
          Skip intro →
        </button>
      </div>
    </section>
  );
}
