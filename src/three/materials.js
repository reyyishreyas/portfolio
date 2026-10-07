// Materials shared across scene systems. Module scope so the weather
// and environment directors can wet the ground, tint the sky and dim
// the sun disc without reaching through the scene graph — and kept
// out of component files so fast refresh stays clean.
import * as THREE from 'three';

/** Forest floor: vertex-coloured, wettable by the rain. */
export const groundMaterial = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 1,
  metalness: 0,
});

/** Gradient sky: tinted per environment by the director. */
export const skyMaterial = new THREE.MeshBasicMaterial({
  vertexColors: true,
  side: THREE.BackSide,
  fog: false,
  depthWrite: false,
});

/** God-ray sun disc: dims under cloud, flares at dawn. */
export const sunDiscMaterial = new THREE.MeshBasicMaterial({
  color: '#fff2d2',
  fog: false,
  toneMapped: false,
});
