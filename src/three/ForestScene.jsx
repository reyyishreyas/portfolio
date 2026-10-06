import Ground from './Ground';
import TreeCluster from './TreeCluster';
import Vegetation from './Vegetation';
import Rocks from './Rocks';
import LightingSystem from './LightingSystem';
import Atmosphere from './Atmosphere';
import SkyDome from './SkyDome';
import ForestEffects from './ForestEffects';
import PathVeins from './PathVeins';
import DataStream from './DataStream';
import { windUniforms } from './wind';
import { useFrame } from '@react-three/fiber';

/**
 * Advances the shared wind clock once per frame; every wind material
 * reads the same uniform.
 *
 * @returns {null}
 */
function WindClock() {
  useFrame((state) => {
    windUniforms.uTime.value = state.clock.elapsedTime;
  });
  return null;
}

/**
 * Composes the whole forest environment. Each piece is an independent
 * instanced module so quality tiers can scale counts without touching
 * the scene graph.
 *
 * @param {{quality: {mode: string, shadows: boolean, grass: number, ferns: number, motes: number, treeFactor: number}}} props
 * @returns {JSX.Element}
 */
export default function ForestScene({ quality }) {
  return (
    <>
      <color attach="background" args={['#161e16']} />
      <WindClock />
      <SkyDome />
      <LightingSystem shadows={quality.shadows} />
      <Ground />
      <TreeCluster quality={quality} />
      <Vegetation quality={quality} />
      <Rocks quality={quality} />
      <Atmosphere count={quality.motes} />
      <PathVeins />
      <DataStream count={quality.mode === 'full' ? 180 : 70} />
      {quality.mode === 'full' && <ForestEffects />}
    </>
  );
}
