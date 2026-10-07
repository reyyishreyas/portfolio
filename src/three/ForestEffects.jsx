import { useRef } from 'react';
import { EffectComposer, GodRays, Bloom } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { sunDiscMaterial } from './materials';

// sun sits ahead-left of the path at low elevation so canopy gaps
// slice the light into shafts; must match the directional light vector
const SUN_POSITION = [-58, 34, -110];

/**
 * First light through the canopy: the sun disc itself plus screen-space
 * god rays occluded by the trees, finished with a restrained bloom.
 * Full-quality tier only — lite tier renders the raw scene.
 *
 * @returns {JSX.Element}
 */
export default function ForestEffects() {
  const sunRef = useRef(null);

  return (
    <group>
      <mesh ref={sunRef} position={SUN_POSITION} material={sunDiscMaterial}>
        {/* fog off: at 140 units the exponential fog would erase it */}
        <sphereGeometry args={[6, 24, 24]} />
      </mesh>

      <EffectComposer autoClear={false} multisampling={4}>
        <GodRays
          sun={sunRef}
          blendFunction={BlendFunction.Screen}
          samples={50}
          density={0.94}
          decay={0.92}
          weight={0.42}
          exposure={0.42}
          clampMax={1}
          blur
        />
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.78}
          luminanceSmoothing={0.22}
          mipmapBlur
        />
      </EffectComposer>
    </group>
  );
}
