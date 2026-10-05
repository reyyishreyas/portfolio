import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

/**
 * Sticky navigation with scroll-progress bar and active-section highlight.
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // the last section sits at the page bottom where the observer band never
  // reaches it: force it active once the user has scrolled to the end
  useEffect(() => {
    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      if (atBottom) setActiveSection(NAV_LINKS[NAV_LINKS.length - 1].id);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="nav-header">
      <motion.div
        className="nav-progress"
        style={{ scaleX: progressScaleX }}
        aria-hidden="true"
      />
      <a href="#" className="nav-logo">Reyyi Shreyas</a>
      <div className="nav-links">
        {NAV_LINKS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`nav-link${activeSection === id ? ' active' : ''}`}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
