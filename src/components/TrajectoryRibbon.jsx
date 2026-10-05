import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// predicted flight path (the model output) and the ground truth it is
// compared against: both start together, the truth drifts from the
// prediction as the forecast horizon grows
const PREDICTED_POINTS = [
  [-2.7, -0.15, -0.35],
  [-1.7, 0.25, 0.15],
  [-0.7, 0.05, 0.35],
  [0.3, 0.5, -0.1],
  [1.3, 0.15, 0.25],
  [2.1, 0.55, -0.15],
  [2.75, 0.7, -0.3],
];

const TRUTH_POINTS = [
  [-2.7, -0.15, -0.35],
  [-1.7, 0.16, 0.1],
  [-0.7, -0.08, 0.3],
  [0.3, 0.3, -0.05],
  [1.3, -0.08, 0.3],
  [2.1, 0.3, -0.25],
  [2.75, 0.42, -0.42],
];

const FLOOR_Y = -0.6;

function Scene({ reduced }) {
  const markerRef = useRef(null);

  const predictedCurve = useMemo(
    () => new THREE.CatmullRomCurve3(PREDICTED_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    []
  );
  const truthCurve = useMemo(
    () => new THREE.CatmullRomCurve3(TRUTH_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
    []
  );

  const tubeGeo = useMemo(() => new THREE.TubeGeometry(predictedCurve, 140, 0.04, 8, false), [predictedCurve]);
  const truthGeo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints(truthCurve.getPoints(90)),
    [truthCurve]
  );
  // vertical drop lines from the path down to an implicit floor plane
  const dropGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 26; i += 1) {
      const p = predictedCurve.getPointAt(i / 26);
      pts.push(p, new THREE.Vector3(p.x, FLOOR_Y, p.z));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [predictedCurve]);

  useEffect(() => {
    const draw = { t: reduced ? 1 : 0 };

    const apply = () => {
      const tubeEnd = Math.floor((tubeGeo.index.count * draw.t) / 3) * 3;
      tubeGeo.setDrawRange(0, tubeEnd);
      truthGeo.setDrawRange(0, Math.floor(truthGeo.attributes.position.count * draw.t));
      dropGeo.setDrawRange(0, Math.floor((dropGeo.attributes.position.count * draw.t) / 2) * 2);
      if (markerRef.current) markerRef.current.visible = !reduced && draw.t > 0.98;
    };

    apply();

    const tween = reduced
      ? null
      : gsap.to(draw, {
          t: 1,
          duration: 1.7,
          ease: 'power2.inOut',
          delay: 0.15,
          onUpdate: apply,
        });

    return () => tween?.kill();
  }, [tubeGeo, truthGeo, dropGeo, reduced]);

  useFrame((_, delta) => {
    const marker = markerRef.current;
    if (!marker || !marker.visible) return;
    marker.userData.t = ((marker.userData.t ?? 0) + delta * 0.07) % 1;
    predictedCurve.getPointAt(marker.userData.t, marker.position);
  });

  return (
    <group position={[0, -0.22, 0]}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 2]} intensity={1.4} />

      {/* ground truth: thin cyan comparison line */}
      <line>
        <primitive object={truthGeo} attach="geometry" />
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.5} />
      </line>

      {/* drop lines giving the path its 3D depth */}
      <lineSegments>
        <primitive object={dropGeo} attach="geometry" />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </lineSegments>

      {/* predicted trajectory: lit ribbon */}
      <mesh geometry={tubeGeo}>
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#1d4ed8"
          emissiveIntensity={0.45}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>

      {/* marker travelling the predicted path */}
      <mesh ref={markerRef} visible={false}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/**
 * Decorative 3D strip for the flagship card: predicted trajectory ribbon,
 * ground-truth line, depth drops and a travelling marker. Mounts only while
 * in view, replays its draw-in on every re-entry.
 *
 * @returns {JSX.Element}
 */
export default function TrajectoryRibbon() {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '160px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="case-study-visual" ref={containerRef} aria-hidden="true">
      {inView && (
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0.1, 3.6], fov: 32 }}
        >
          <Scene reduced={reduced} />
        </Canvas>
      )}
    </div>
  );
}
