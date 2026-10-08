import { useState, useEffect } from 'react';

// boot sequence: the jungle initialises in stages, like a game level
// loading in. Layered over the live forest rather than a blank screen,
// and it holds until the scene is really on screen.
const STAGES = [
  { at: 0, text: 'Generating terrain…' },
  { at: 22, text: 'Growing the canopy…' },
  { at: 45, text: 'Waking the wildlife…' },
  { at: 66, text: 'Flooding the valley…' },
  { at: 84, text: 'Loading Reyyi’s story…' },
  { at: 97, text: 'Ready. Step into the forest.' },
];

const DURATION = 1200; // floor: never flash past the readout
const MAX_WAIT = 5000; // give up on the scene and let the visitor in
const INTERVAL = 16;
const FADE = 380;

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // runs over the live forest: progress holds just short of done until the
  // scene is actually on screen, so "Ready" means the jungle is there
  useEffect(() => {
    const started = performance.now();
    const increment = 100 / (DURATION / INTERVAL);
    let sceneReady = false;
    let finished = false;

    const poll = setInterval(() => {
      sceneReady = Boolean(
        document.querySelector('.forest-stage canvas, .forest-fallback'),
      );
    }, 60);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const ceiling =
          sceneReady || performance.now() - started > MAX_WAIT ? 100 : 96;
        const next = Math.min(prev + increment, ceiling);
        if (next >= 100 && !finished) {
          finished = true;
          clearInterval(timer);
          clearInterval(poll);
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, FADE);
        }
        return next;
      });
    }, INTERVAL);

    return () => {
      clearInterval(timer);
      clearInterval(poll);
    };
  }, [onComplete]);

  const statusText = [...STAGES].reverse().find((s) => progress >= s.at).text;

  return (
    <div className={`loader-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="loader-container">
        <p className="loader-stage-tag">Initialising the jungle</p>
        <h1 className="loader-name">Reyyi Shreyas</h1>
        <p className="loader-subtitle">AI/ML Engineer</p>

        <div className="loader-progress-container">
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loader-status-text">
          <span className="loader-status-pct">{Math.floor(progress)}%</span>
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
}
