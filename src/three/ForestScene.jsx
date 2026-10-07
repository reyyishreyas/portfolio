import Ground from './Ground';
import TreeCluster from './TreeCluster';
import Vegetation from './Vegetation';
import Rocks from './Rocks';
import StructureField from './StructureField';
import ChessMachine from './ChessMachine';
import RootNetwork from './RootNetwork';
import AstraWorld from './AstraWorld';
import EnvironmentDirector from './LightingSystem';
import Atmosphere from './Atmosphere';
import SkyDome from './SkyDome';
import ForestEffects from './ForestEffects';
import PathVeins from './PathVeins';
import DataStream from './DataStream';
import Weather from './Weather';
import WaterEvent from './WaterEvent';
import Wildlife from './Wildlife';
import { windUniforms } from './wind';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect } from 'react';

/**
 * Dev-only bridge: hands the live scene to QA scripts so they can
 * inspect or isolate systems without guesswork.
 *
 * @returns {null}
 */
function DevBridge() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.__scene = scene;
      window.__camera = camera;
      window.__gl = gl;
    }
  }, [scene, camera, gl]);
  return null;
}

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
      {/* scene root: fog must attach here, not inside a group */}
      <fogExp2 attach="fog" args={['#161e16', 0.021]} />
      <DevBridge />
      <WindClock />
      <SkyDome />
      <EnvironmentDirector shadows={quality.shadows} />
      {/* after the director: lightning lifts sky + sun disc last */}
      <Weather />
      <WaterEvent />
      <Ground />
      <TreeCluster quality={quality} />
      <Vegetation quality={quality} />
      <Rocks quality={quality} />
      <Atmosphere count={quality.motes} />
      <Wildlife quality={quality} />
      {/* computation worlds: transform → projects → research → astra */}
      <StructureField />
      <ChessMachine />
      <RootNetwork />
      <AstraWorld />
      <PathVeins />
      <DataStream count={quality.mode === 'full' ? 180 : 70} />
      {quality.mode === 'full' && <ForestEffects />}
    </>
  );
}
