import { useState, useEffect } from 'react';
import Loader from './components/Loader';
import Header from './components/Header';
import About from './components/About';
import FeaturedProjects from './components/FeaturedProjects';
import EngineeringProjects from './components/EngineeringProjects';
import Experience from './components/Experience';
import Leadership from './components/Leadership';
import Achievements from './components/Achievements';
import Certifications from './components/Certifications';
import Skills from './components/Skills';
import Contact from './components/Contact';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.12,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-element');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, [loading]);

  if (loading) {
    return <Loader onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="portfolio-wrapper">
      <nav className="nav-header">
        <a href="#" className="nav-logo">Reyyi Shreyas</a>
        <div className="nav-links">
          <a href="#about" className="nav-link">About</a>
          <a href="#projects" className="nav-link">Projects</a>
          <a href="#experience" className="nav-link">Experience</a>
          <a href="#leadership" className="nav-link">Leadership</a>
          <a href="#achievements" className="nav-link">Achievements</a>
          <a href="#skills" className="nav-link">Skills</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
      </nav>

      <div className="reveal-element">
        <Header />
      </div>

      <div className="reveal-element">
        <About />
      </div>

      <div id="projects" className="reveal-element">
        <FeaturedProjects />
      </div>

      <div className="reveal-element">
        <EngineeringProjects />
      </div>

      <div className="reveal-element">
        <Experience />
      </div>

      <div className="reveal-element">
        <Leadership />
      </div>

      <div id="achievements" className="reveal-element">
        <Achievements />
      </div>

      <div className="reveal-element">
        <Certifications />
      </div>

      <div id="skills" className="reveal-element">
        <Skills />
      </div>

      <div className="reveal-element">
        <Contact />
      </div>

      <footer className="footer reveal-element">
        <div className="footer-credits">
          © {new Date().getFullYear()} REYYI SHREYAS. ALL RIGHTS RESERVED.
        </div>
        <div className="footer-tagline">
          AI/ML // AUTONOMOUS SYSTEMS // DEFENCE TECH
        </div>
      </footer>
    </div>
  );
}

export default App;
