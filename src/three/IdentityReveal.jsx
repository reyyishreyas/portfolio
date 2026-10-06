import { useEffect, useRef } from 'react';
import { journeyState } from './journey';
import { smoothstep } from './utils';

/**
 * The clearing reveal: the identity title card fades up as the walk
 * reaches the open ground (progress ~0.8 → 0.95) and holds there until
 * the portfolio slides in. Rendered imperatively from journey progress
 * so scrolling never re-renders React. aria-hidden: it is the motion
 * twin of the hero heading, not a second heading.
 *
 * @returns {JSX.Element}
 */
export default function IdentityReveal() {
  const elRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const tick = () => {
      const p = journeyState.progress;
      const a = smoothstep(0.8, 0.94, p);
      if (a !== last && elRef.current) {
        last = a;
        elRef.current.style.opacity = String(a);
        elRef.current.style.transform = `translateY(${(1 - a) * 22}px) scale(${0.985 + a * 0.015})`;
        elRef.current.style.filter = `blur(${(1 - a) * 6}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="forest-identity" ref={elRef} aria-hidden="true">
      <p className="forest-identity-name">Reyyi Shreyas</p>
      <span className="forest-identity-rule" />
      <p className="forest-identity-role">AI / ML · Research · Engineering</p>
    </div>
  );
}
