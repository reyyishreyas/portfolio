/**
 * Natural forest light: a warm low sun ahead of the path (backlit
 * canopy, long shadows toward the visitor), cool sky fill, and a
 * gentle fill from behind the camera so shadow-side foliage keeps its
 * colour. Shadows only on the full-quality tier.
 *
 * @param {{shadows: boolean}} props
 * @returns {JSX.Element}
 */
export default function LightingSystem({ shadows }) {
  return (
    <group>
      <hemisphereLight args={['#a3bdd2', '#33422a', 1.0]} />
      <ambientLight color="#31432c" intensity={0.66} />
      <directionalLight
        position={[-30, 18, -56]}
        intensity={3.35}
        color="#ffe6bc"
        castShadow={shadows}
        shadow-intensity={0.78}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={4}
        shadow-camera-far={140}
        shadow-camera-left={-46}
        shadow-camera-right={46}
        shadow-camera-top={46}
        shadow-camera-bottom={-46}
        shadow-bias={-0.0004}
      />
      {/* cool fill from behind the visitor: lifts the shadow side facing camera */}
      <directionalLight position={[12, 9, 26]} intensity={1.0} color="#8fa6ba" />
      <fogExp2 attach="fog" args={['#161e16', 0.021]} />
    </group>
  );
}
