import { useState, useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import Loader from './components/Loader';
import Header from './components/Header';
import SiteHeader from './components/SiteHeader';
import About from './components/About';
import FeaturedProjects from './components/FeaturedProjects';
import EngineeringProjects from './components/EngineeringProjects';
import Experience from './components/Experience';
import Leadership from './components/Leadership';
import Achievements from './components/Achievements';
import Certifications from './components/Certifications';
import Skills from './components/Skills';
import Contact from './components/Contact';
import { Reveal } from './components/Reveal';
import { initSmoothScroll } from './lib/smoothScroll';

function App() {
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
      <div className="portfolio-wrapper">
        <SiteHeader />

        <Header />

        <Reveal>
          <About />
        </Reveal>

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
          <Contact />
        </Reveal>

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

export default App;
