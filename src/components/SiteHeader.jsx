import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { journeyState } from '../three/journey';
import { getLenis } from '../lib/smoothScroll';

// nav targets are journey progress fractions: each link walks the
// visitor to the beat where that part of the story is discovered
const NAV_LINKS = [
  { id: 'projects', label: 'Work', p: 0.5145 },
  { id: 'research', label: 'Research', p: 0.69 },
  { id: 'astra', label: 'ASTRA', p: 0.7505 },
  { id: 'about', label: 'About', p: 0.8385 },
  { id: 'contact', label: 'Contact', p: 0.975 },
];

// which progress ranges count as "showing" which beat
const ACTIVE_RANGES = [
  [0.5, 0.677, 'projects'],
  [0.677, 0.732, 'research'],
  [0.732, 0.82, 'astra'],
  [0.82, 0.9, 'about'],
  [0.9, 1.01, 'contact'],
];

/**
 * Sticky navigation with scroll-progress bar. The links jump to journey
 * beats rather than page sections; the active state follows journey
 * progress (or the static plate position when the journey falls back).
 * Mounted only after the loader, so useScroll measures the full document.
 *
 * @returns {JSX.Element}
 */
export default function SiteHeader() {
  const [activeSection, setActiveSection] = useState('');

  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const section = document.querySelector('.forest-opening');
      let next = '';
      if (section) {
        const hit = ACTIVE_RANGES.find(
          ([a, b]) => journeyState.progress >= a && journeyState.progress < b,
        );
        next = hit ? hit[2] : '';
      } else {
        // static fallback: whichever plate sits in the viewport band
        const mid = window.innerHeight * 0.4;
        NAV_LINKS.forEach(({ id }) => {
          const el = document.getElementById(`story-${id}`);
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.top <= mid && r.bottom >= 0) next = id;
        });
      }
      setActiveSection((prev) => (prev === next ? prev : next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const jump = (event, id, p) => {
    const section = document.querySelector('.forest-opening');
    if (!section) return; // static fallback: let the #story-* anchor work
    // stop Lenis's anchor handler from re-targeting the fixed plate
    event.preventDefault();
    event.stopPropagation();
    const y =
      section.offsetTop +
      p * (section.offsetHeight - window.innerHeight);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.8 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <nav className="nav-header" aria-label="Primary">
      <motion.div
        className="nav-progress"
        style={{ scaleX: progressScaleX }}
        aria-hidden="true"
      />
      <a href="#" className="nav-logo">Reyyi Shreyas</a>
      <div className="nav-links">
        {NAV_LINKS.map(({ id, label, p }) => (
          <a
            key={id}
            href={`#story-${id}`}
            onClick={(e) => jump(e, id, p)}
            className={`nav-link${activeSection === id ? ' active' : ''}`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
