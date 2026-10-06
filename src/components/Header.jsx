import { lazy, Suspense, useEffect, useState } from 'react';
import gsap from 'gsap';
import { getLenis } from '../lib/smoothScroll';

const PointCloudPortrait = lazy(() => import('./PointCloudPortrait'));

/**
 * The point cloud only runs where it helps: desktop, WebGL available,
 * no reduced-motion preference. Everything else keeps the flat photo.
 *
 * @returns {boolean}
 */
function supportsPointCloud() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 768px)').matches) return false;
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Header() {
  const [cloudEnabled] = useState(supportsPointCloud);
  const [cloudReady, setCloudReady] = useState(false);

  const handleCommand = (action) => {
    switch (action) {
      case 'projects': {
        const target = document.getElementById('projects');
        const lenis = getLenis();
        if (lenis && target) {
          lenis.scrollTo(target);
        } else {
          target?.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      }
      case 'resume':
        window.open('/assets/images/REYYICV.pdf', '_blank');
        break;
      case 'github':
        window.open('https://github.com/reyyishreyas', '_blank');
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/in/reyyi-shreyas/', '_blank');
        break;
      default:
        break;
    }
  };

  // entrance choreography: runs right after the loader fades out
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

      tl.fromTo(
        '.hero-title-line > span',
        { yPercent: 115 },
        { yPercent: 0, duration: 1.05, stagger: 0.1, ease: 'power4.out' }
      )
        .fromTo(
          '.hero-subtitle-badge',
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 },
          '-=0.6'
        )
        .fromTo(
          '.hero-description',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4'
        )
        .fromTo(
          '.hero-buttons > *',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.06 },
          '-=0.35'
        )
        .fromTo(
          '.hero-image-wrapper',
          { y: 26, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.9 },
          '-=0.75'
        )
        .fromTo(
          '.hero-metric',
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 },
          '-=0.55'
        );

      // numeric metrics count up from 0 while their card fades in
      tl.addLabel('counts', '-=0.55');
      gsap.utils.toArray('.hero-metric-value[data-count-to]').forEach((el) => {
        const target = parseFloat(el.dataset.countTo);
        const decimals = Number(el.dataset.countDecimals || 0);
        const suffix = el.dataset.countSuffix || '';
        const counter = { v: 0 };
        tl.to(
          counter,
          {
            v: target,
            duration: 1.2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = counter.v.toFixed(decimals) + suffix;
            },
          },
          'counts'
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <header className="hero-section">
      <div className="hero-left">
        <h1 className="hero-title">
          <span className="hero-title-line"><span>Reyyi</span></span>
          <span className="hero-title-line"><span>Shreyas</span></span>
        </h1>

        <div className="hero-subtitles">
          <span className="hero-subtitle-badge">AI/ML Engineer</span>
          <span className="hero-subtitle-badge">Autonomous Systems</span>
          <span className="hero-subtitle-badge">Deep Learning</span>
        </div>

        <p className="hero-description">
          Artificial Intelligence and Machine Learning undergraduate focused on building real-world ML systems, autonomous applications, and intelligent technology solutions.
        </p>

        <div className="hero-buttons">
          <button
            onClick={() => handleCommand('projects')}
            className="btn-primary"
          >
            View Projects
          </button>

          <button
            onClick={() => handleCommand('resume')}
            className="btn-secondary"
          >
            Resume
          </button>

          <button
            onClick={() => handleCommand('github')}
            className="btn-secondary"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            GitHub
          </button>

          <button
            onClick={() => handleCommand('linkedin')}
            className="btn-secondary"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            LinkedIn
          </button>
        </div>
      </div>

      <div className="hero-right">
        <div className={`hero-image-wrapper${cloudReady ? ' cloud-ready' : ''}`}>
          <div className="hero-image-container">
            <img
              id="img-shreyas-profile"
              src="/assets/images/shreyas_profile.jpg"
              alt="Reyyi Shreyas Portrait"
            />
            {cloudEnabled && (
              <Suspense fallback={null}>
                <PointCloudPortrait onReady={setCloudReady} />
              </Suspense>
            )}
          </div>
          <div className="hero-image-glow" />
        </div>

        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="hero-metric-value" data-count-to="9.15" data-count-decimals="2">9.15</span>
            <span className="hero-metric-label">CGPA</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-value">ML</span>
            <span className="hero-metric-label">Intern</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-value">ASTRA</span>
            <span className="hero-metric-label">President</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-value" data-count-to="4" data-count-suffix="+">4+</span>
            <span className="hero-metric-label">AI Systems</span>
          </div>
        </div>
      </div>
    </header>
  );
}
