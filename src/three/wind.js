import * as THREE from 'three';

/** One shared clock every wind material reads from. */
export const windUniforms = { uTime: { value: 0 } };

/**
 * Attach a height-weighted wind sway to a standard material before it
 * compiles. Sway phase comes from each instance's world origin, so the
 * field rustles per-blade instead of pulsing in sync. Amplitude is
 * squared with height: roots stay planted, tips travel.
 *
 * @param {THREE.MeshStandardMaterial} material
 * @param {{amp: number, height: number, speed: number}} cfg amp: max tip offset (world units); height: local y that counts as full height
 * @returns {THREE.MeshStandardMaterial} the same material, mutated pre-compile
 */
export function applyWind(material, { amp, height, speed }) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniforms;
    shader.vertexShader = `uniform float uTime;\n${shader.vertexShader}`.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      {
        vec3 iOrigin;
        #ifdef USE_INSTANCING
          iOrigin = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        #else
          iOrigin = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        #endif
        float h = clamp(position.y / ${height.toFixed(3)}, 0.0, 1.0);
        float phase = iOrigin.x * 0.45 + iOrigin.z * 0.3;
        float gust = sin(uTime * ${speed.toFixed(3)} + phase)
                   + 0.45 * sin(uTime * ${(speed * 1.7).toFixed(3)} - phase * 1.3);
        float k = h * h * ${amp.toFixed(4)};
        transformed.x += gust * k;
        transformed.z += gust * k * 0.55;
      }`
    );
  };
  // distinct program per wind config: the injected snippet differs
  material.customProgramCacheKey = () => `wind-${amp}-${height}-${speed}`;
  return material;
}

/**
 * Standard forest material with wind attached.
 *
 * @param {{amp: number, height: number, speed: number}} wind
 * @param {{roughness?: number, side?: THREE.Side}} opts
 * @returns {THREE.MeshStandardMaterial}
 */
export function windMaterial(wind, opts = {}) {
  const material = new THREE.MeshStandardMaterial({
    roughness: opts.roughness ?? 0.95,
    metalness: 0,
    side: opts.side ?? THREE.FrontSide,
  });
  return applyWind(material, wind);
}
