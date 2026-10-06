import { useMemo } from 'react';
import * as THREE from 'three';
import { fbm2, groundHeight } from './utils';

/**
 * Forest floor: a gently displaced plane with vertex colours that blend
 * moss, earth and a worn dirt corridor along the camera path.
 *
 * @returns {JSX.Element}
 */
export default function Ground() {
  const geometry = useMemo(() => {
    const w = 150;
    const d = 190;
    const segX = 110;
    const segZ = 130;
    const geo = new THREE.PlaneGeometry(w, d, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -35);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const moss = new THREE.Color('#29361f');
    const earth = new THREE.Color('#2e261d');
    const dirt = new THREE.Color('#3d3327');
    const shadowed = new THREE.Color('#1b2417');
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = groundHeight(x, z);
      pos.setY(i, h);

      // moss vs earth patches, darker where the canopy would shade
      const patch = fbm2(x * 0.08 + 7.3, z * 0.08 - 2.1, 3);
      tmp.copy(earth).lerp(moss, patch);
      const shade = fbm2(x * 0.14 - 4.0, z * 0.14 + 9.0, 2);
      tmp.lerp(shadowed, shade * 0.55);

      // worn dirt path down the middle of the corridor
      const path = Math.max(
        0,
        1 - Math.abs(x + Math.sin(z * 0.11) * 1.4) / 2.4
      );
      tmp.lerp(dirt, path * path * 0.8);

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  );
}
