import { useState, useEffect, lazy, Suspense } from 'react';
import { MotionConfig } from 'motion/react';
import Loader from './components/Loader';
import SiteHeader from './components/SiteHeader';
import StoryPlates from './components/StoryPlates';
import ForestEdge from './components/ForestEdge';
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

  // the jungle mounts behind the boot readout, so hold the page still
  // until the forest has had a chance to appear
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('is-loading', loading);
    return () => root.classList.remove('is-loading');
  }, [loading]);

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#journey-end">Skip to content</a>
      <div className="portfolio-wrapper">
        <SiteHeader />

        {/* the world: one continuous scroll journey. Mounts immediately —
            the boot readout below is layered over the forest, not over a
            blank screen. */}
        <Suspense fallback={null}>
          <ForestOpening />
        </Suspense>

        {/* the portfolio's information, revealed as discoveries in the world */}
        <StoryPlates />

        {/* the forest takes the page back: return to nature */}
        <ForestEdge closing />

        <Reveal className="footer">
          <div className="footer-credits">
            <div>© {new Date().getFullYear()} REYYI SHREYAS. ALL RIGHTS RESERVED.</div>
            <div className="footer-assets">WILDLIFE MODELS: QUATERNIUS (CC0)</div>
          </div>
          <div className="footer-tagline">
            AI/ML // AUTONOMOUS SYSTEMS // DEFENCE TECH
          </div>
        </Reveal>
      </div>

      {/* forest-first boot readout: a scrim over the live scene */}
      {loading && <Loader onComplete={() => setLoading(false)} />}
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
