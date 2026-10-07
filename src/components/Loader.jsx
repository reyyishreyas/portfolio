import { useState, useEffect } from 'react';

// boot sequence: the jungle initialises in stages, like a game level
// loading in. Kept short — the visitor should be walking within ~1.4s.
const STAGES = [
  { at: 0, text: 'Generating terrain…' },
  { at: 22, text: 'Growing the canopy…' },
  { at: 45, text: 'Waking the wildlife…' },
  { at: 66, text: 'Flooding the valley…' },
  { at: 84, text: 'Loading Reyyi’s story…' },
  { at: 97, text: 'Ready. Step into the forest.' },
];

const DURATION = 1200;
const INTERVAL = 16;
const FADE = 380;

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const increment = 100 / (DURATION / INTERVAL);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, FADE);
          return 100;
        }
        return next;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [onComplete]);

  const statusText = [...STAGES].reverse().find((s) => progress >= s.at).text;

  return (
    <div className={`loader-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="loader-container">
        <p className="loader-stage-tag">Building the forest</p>
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
