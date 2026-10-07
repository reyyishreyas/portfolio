import { useEffect, useRef } from 'react';
import { journeyState, BEATS } from './journey';
import { smoothstep } from './utils';

/**
 * The clearing reveal: the identity title card fades up as the walk
 * reaches the open ground (the clearing beat) and washes away when
 * the weather turns. Rendered imperatively from journey progress so
 * scrolling never re-renders React.
 *
 * @returns {JSX.Element}
 */
export default function IdentityReveal() {
  const elRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    let last = -1;
    const [start, end] = BEATS.clearing;
    const tick = () => {
      const p = journeyState.progress;
      // in with the light, out as the sky closes over
      const a =
        smoothstep(start + 0.005, start + 0.028, p) *
        (1 - smoothstep(end - 0.004, end + 0.008, p));
      if (a !== last && elRef.current) {
        last = a;
        elRef.current.style.opacity = String(a);
        elRef.current.style.transform = `translateY(${(1 - a) * 22}px) scale(${0.985 + a * 0.015})`;
        elRef.current.style.filter = `blur(${(1 - a) * 6}px)`;
        elRef.current.style.pointerEvents = a > 0.5 ? 'auto' : 'none';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="forest-identity" ref={elRef}>
      <p className="forest-identity-name">Reyyi Shreyas</p>
      <span className="forest-identity-rule" />
      <p className="forest-identity-role">AI / ML · Research · Engineering</p>
      <p className="forest-identity-lines">
        B.E. Artificial Intelligence &amp; Machine Learning · CGPA 9.15
        <br />
        President of ASTRA · Open-source contributor
      </p>
    </div>
  );
}
