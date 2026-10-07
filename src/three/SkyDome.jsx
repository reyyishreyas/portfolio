import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { skyMaterial } from './materials';

const SUN_DIR = new THREE.Vector3(-58, 34, -110).normalize();

/**
 * Static gradient sky: dark zenith, warmer horizon, extra warm boost
 * around the sun direction. Vertex colours baked on the CPU (no
 * shader) so it tone-maps like every other material in the scene.
 * The dome rides with the camera on x/z (the journey spans the whole
 * world) and its material colour tints the sky per environment.
 *
 * @returns {JSX.Element}
 */
export default function SkyDome() {
  const meshRef = useRef(null);
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(350, 48, 24);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const zenith = new THREE.Color('#0d120e');
    const horizon = new THREE.Color('#39412e');
    const warm = new THREE.Color('#93794d');
    const dir = new THREE.Vector3();
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i += 1) {
      dir.fromBufferAttribute(pos, i).normalize();
      const up = Math.max(dir.y, 0);
      tmp.copy(horizon).lerp(zenith, Math.pow(up, 0.6));
      // warm halo where the sun sits, fades within ~50 degrees
      const sunAmt = Math.pow(Math.max(dir.dot(SUN_DIR), 0), 10) * 0.55;
      tmp.add(warm.clone().multiplyScalar(sunAmt));
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // the world is 400 units long: keep the dome centred on the camera
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.x = state.camera.position.x;
      meshRef.current.position.z = state.camera.position.z;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={skyMaterial} renderOrder={-1} />
  );
}
