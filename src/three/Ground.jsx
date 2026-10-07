import { useMemo } from 'react';
import * as THREE from 'three';
import { fbm2, groundHeight, smoothstep } from './utils';
import { groundMaterial } from './materials';

// palette blend by world depth: living forest → rain-soaked earth →
// computation slate → engineered graphite → forest floor again
const ZONES = [
  { at: -160, color: new THREE.Color('#23262a') }, // drowned storm floor
  { at: -215, color: new THREE.Color('#141b20') }, // computation slate
  { at: -265, color: new THREE.Color('#23262b') }, // engineered graphite
  { at: -310, color: new THREE.Color('#332a1f') }, // nature returns
];
const FOREST_FLOOR = new THREE.Color('#2e261d');

/**
 * @param {number} z world depth
 * @param {THREE.Color} out filled with the zone base colour
 * @returns {THREE.Color} out
 */
function zoneBase(z, out) {
  out.copy(FOREST_FLOOR);
  let prev = FOREST_FLOOR;
  for (const zone of ZONES) {
    // gate at the blend start so the first applied value is 0 (no jump)
    if (z <= zone.at + 40) {
      out.copy(prev).lerp(zone.color, smoothstep(zone.at + 40, zone.at - 5, z));
    }
    prev = zone.color;
  }
  return out;
}

/**
 * Forest floor: a gently displaced plane with vertex colours that blend
 * moss, earth and a worn dirt corridor along the camera path. Spans
 * the whole journey; past the flood zone the floor changes character
 * with each world.
 *
 * @returns {JSX.Element}
 */
export default function Ground() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(170, 460, 90, 260);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -180);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const moss = new THREE.Color('#29361f');
    const dirt = new THREE.Color('#3d3327');
    const shadowed = new THREE.Color('#1b2417');
    const palePath = new THREE.Color('#31353b'); // straight strip in ASTRA
    const tmp = new THREE.Color();
    const base = new THREE.Color();

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, groundHeight(x, z));

      zoneBase(z, base);
      tmp.copy(base);

      // moss patches only where forest grows (start and return)
      const forestness =
        1 - smoothstep(-170, -235, z) + smoothstep(-315, -355, z);
      const patch = fbm2(x * 0.08 + 7.3, z * 0.08 - 2.1, 3);
      tmp.lerp(moss, patch * Math.min(1, forestness));

      const shade = fbm2(x * 0.14 - 4.0, z * 0.14 + 9.0, 2);
      tmp.lerp(shadowed, shade * 0.55);

      // worn path: wavy while wild, dead straight and pale where the
      // world turns engineered, soft again where nature returns
      const astra = smoothstep(-235, -275, z) * (1 - smoothstep(-315, -345, z));
      const pathX = (x + Math.sin(z * 0.11) * 1.4) * (1 - astra);
      const path = Math.max(0, 1 - Math.abs(pathX) / 2.4);
      tmp.lerp(astra > 0.5 ? palePath : dirt, path * path * 0.8);

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return <mesh geometry={geometry} material={groundMaterial} receiveShadow />;
}
