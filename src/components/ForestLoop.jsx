import { useEffect, useRef } from 'react';
import { getLenis } from '../lib/smoothScroll';
import { journeyState } from '../three/journey';

// where the walk picks up again: inside the first beat, past the point
// where the intro invitation and the audio gate stand aside
const WRAP_PROGRESS = 0.018;

// the credits settle and stay clear for this much scroll before the
// mist starts closing over them; it finishes at the very bottom
const CLEAR_VH = 0.12;

// keys that push the page down, and so can carry the walk past its end
const PUSH_KEYS = ['ArrowDown', 'PageDown', ' ', 'Spacebar', 'End'];

// the cover holds for a beat before it lifts, so the jump is never seen
const HOLD_MS = 260;
const CLEAR_MS = 700;

/**
 * The endless walk: the journey closes on itself.
 *
 * A tail of open page lets the closing credits settle, then mist rises
 * over them and the last of the forest. Reaching the bottom stops there
 * — only a fresh push walks on, and it walks straight back to the first
 * beat with the cover shut, so the restart is never seen. Only the
 * forest, again.
 *
 * @returns {JSX.Element}
 */
export default function ForestLoop() {
  const spaceRef = useRef(null);
  const mistRef = useRef(null);

  useEffect(() => {
    const space = spaceRef.current;
    const mist = mistRef.current;
    if (!space || !mist) return undefined;

    let wrapping = false;
    let holdTimer = 0;
    let clearTimer = 0;
    let wrapFrame = 0;
    let touchY = null;

    const maxScroll = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    // mist closes over the tail, one-to-one with the wheel, so it is
    // already shut by the time the page can go no further
    const paint = () => {
      if (wrapping) return;
      const vh = window.innerHeight;
      const end = maxScroll();
      // before the world has laid out, there is nothing to close over
      if (end <= 0) {
        mist.style.opacity = '0';
        return;
      }
      const span = Math.max(1, space.offsetHeight - vh * CLEAR_VH);
      const t = (window.scrollY - (end - span)) / span;
      mist.style.opacity = String(Math.min(1, Math.max(0, t)));
    };

    // walk back to the head of the story while the cover is shut
    const wrap = () => {
      mist.style.transition = 'none';
      mist.style.opacity = '1';

      const section = document.querySelector('.forest-opening');
      const target = section
        ? section.getBoundingClientRect().top +
          window.scrollY +
          WRAP_PROGRESS * (section.offsetHeight - window.innerHeight)
        : 0;
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(target, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: target, left: 0, behavior: 'instant' });
      }
      if (section) journeyState.progress = WRAP_PROGRESS;

      holdTimer = window.setTimeout(() => {
        mist.style.transition = `opacity ${CLEAR_MS}ms ease`;
        mist.style.opacity = '0';
        clearTimer = window.setTimeout(() => {
          mist.style.transition = 'none';
          wrapping = false;
          paint();
        }, CLEAR_MS + 60);
      }, HOLD_MS);
    };

    // reaching the end stops here; only a fresh push walks on from it.
    // The jump waits a frame so the scroll library has taken its turn
    // with the same wheel event, and the landing point stays exact.
    const pushDown = () => {
      if (wrapping || document.documentElement.classList.contains('is-loading')) return;
      if (window.scrollY < maxScroll() - 1) return;
      wrapping = true;
      wrapFrame = requestAnimationFrame(wrap);
    };

    const onWheel = (event) => {
      if (event.deltaY > 0) pushDown();
    };
    const onKeyDown = (event) => {
      if (PUSH_KEYS.includes(event.key)) pushDown();
    };
    const onTouchStart = (event) => {
      touchY = event.touches[0] ? event.touches[0].clientY : null;
    };
    const onTouchMove = (event) => {
      const y = event.touches[0] ? event.touches[0].clientY : null;
      if (y === null || touchY === null) return;
      if (touchY - y > 8) pushDown();
      touchY = y;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
    paint();

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', paint);
      window.removeEventListener('resize', paint);
      window.cancelAnimationFrame(wrapFrame);
      window.clearTimeout(holdTimer);
      window.clearTimeout(clearTimer);
    };
  }, []);

  return (
    <>
      {/* open page below the credits: room for the mist to settle in */}
      <div className="forest-loop-space" aria-hidden="true" ref={spaceRef} />
      <div className="forest-loop-mist" aria-hidden="true" ref={mistRef} />
    </>
  );
}
