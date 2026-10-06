import { useState, useEffect, lazy, Suspense } from 'react';
import { MotionConfig } from 'motion/react';
import Loader from './components/Loader';
import Header from './components/Header';
import SiteHeader from './components/SiteHeader';
import ForestEdge from './components/ForestEdge';
import About from './components/About';
import FeaturedProjects from './components/FeaturedProjects';
import EngineeringProjects from './components/EngineeringProjects';
import Research from './components/Research';
import ChessSpotlight from './components/ChessSpotlight';
import Experience from './components/Experience';
import Leadership from './components/Leadership';
import Achievements from './components/Achievements';
import Certifications from './components/Certifications';
import Skills from './components/Skills';
import OpenSource from './components/OpenSource';
import Contact from './components/Contact';
import ResumePage from './components/ResumePage';
import { Reveal } from './components/Reveal';
import { initSmoothScroll } from './lib/smoothScroll';

// three.js stays out of the critical path: the forest loads async after first paint
const ForestOpening = lazy(() => import('./three/ForestOpening'));

function PortfolioApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) return undefined;
    initSmoothScroll();
    return undefined;
  }, [loading]);

  if (loading) {
    return <Loader onComplete={() => setLoading(false)} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#projects">Skip to content</a>
      <div className="portfolio-wrapper">
        <SiteHeader />

        <Suspense fallback={null}>
          <ForestOpening />
        </Suspense>

        {/* the forest continues as visual language into the content */}
        <ForestEdge />

        <Header />

        <Reveal>
          <FeaturedProjects />
        </Reveal>

        <Reveal>
          <EngineeringProjects />
        </Reveal>

        <Reveal>
          <Experience />
        </Reveal>

        <Reveal>
          <Research />
        </Reveal>

        <Reveal>
          <ChessSpotlight />
        </Reveal>

        <Reveal>
          <Leadership />
        </Reveal>

        <Reveal>
          <Achievements />
        </Reveal>

        <Reveal>
          <Certifications />
        </Reveal>

        <Reveal>
          <Skills />
        </Reveal>

        <Reveal>
          <OpenSource />
        </Reveal>

        <Reveal>
          <About />
        </Reveal>

        <Reveal>
          <Contact />
        </Reveal>

        {/* the forest takes the page back: return to nature */}
        <ForestEdge closing />

        <Reveal className="footer">
          <div className="footer-credits">
            © {new Date().getFullYear()} REYYI SHREYAS. ALL RIGHTS RESERVED.
          </div>
          <div className="footer-tagline">
            AI/ML // AUTONOMOUS SYSTEMS // DEFENCE TECH
          </div>
        </Reveal>
      </div>
    </MotionConfig>
  );
}

export default function App() {
  // /resume serves the print-first resume page; everything else is the site
  const path = window.location.pathname.replace(/\/+$/, '');
  if (path === '/resume') {
    return <ResumePage />;
  }
  return <PortfolioApp />;
}
