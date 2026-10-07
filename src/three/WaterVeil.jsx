import { useEffect, useRef } from 'react';
import { journeyState } from './journey';
import { smoothstep } from './utils';

/**
 * Screen-level water: a translucent flood climbing from the bottom
 * edge as the surface reaches the camera, then a full deep wash
 * while submerged, easing away as the world transforms. Pure
 * imperative style writes from journey progress — no React state
 * per frame.
 *
 * @returns {JSX.Element}
 */
export default function WaterVeil() {
  const fillRef = useRef(null);
  const deepRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = journeyState.progress;
      // climb: the surface arriving at the lens (flood beat only —
      // hands the screen over to the deep wash once submerged), then
      // drains away while the world transforms so nothing after the
      // water keeps a lid over the scene
      const climb =
        smoothstep(0.318, 0.36, p) * (1 - smoothstep(0.44, 0.495, p));
      const deep =
        smoothstep(0.35, 0.372, p) * (1 - smoothstep(0.435, 0.47, p));
      if (fillRef.current) {
        fillRef.current.style.height = `${climb * 104}%`;
        fillRef.current.style.opacity = String(
          Math.min(1, climb * 1.6) * (1 - deep)
        );
      }
      if (deepRef.current) {
        // a colour grade over the underwater scene, never a lid
        deepRef.current.style.opacity = String(deep * 0.4);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="water-veil" aria-hidden="true">
      <div className="water-veil-fill" ref={fillRef} />
      <div className="water-veil-deep" ref={deepRef} />
    </div>
  );
}
