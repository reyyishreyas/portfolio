import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis = null;

/**
 * Start Lenis smooth scrolling, synced with GSAP's ticker and ScrollTrigger.
 * Skipped entirely when the user prefers reduced motion.
 *
 * @returns {Lenis|null} the shared Lenis instance, or null if not started
 */
export function initSmoothScroll() {
  if (lenis) return lenis;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  lenis = new Lenis({ lerp: 0.11, anchors: true });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/**
 * @returns {Lenis|null} the shared Lenis instance if running
 */
export function getLenis() {
  return lenis;
}
