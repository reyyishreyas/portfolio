import { useState, useEffect } from 'react';

export default function Loader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const duration = 1600;
    const intervalTime = 16;
    const increment = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  let statusText = 'Initializing systems...';
  if (progress >= 30 && progress < 70) {
    statusText = 'Loading intelligent systems...';
  } else if (progress >= 70) {
    statusText = 'Ready.';
  }

  return (
    <div className={`loader-overlay ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="loader-container">
        <h1 className="loader-name">Reyyi Shreyas</h1>
        <p className="loader-subtitle">AI/ML Engineer</p>

        <div className="loader-progress-container">
          <div
            className="loader-progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="loader-status-text">
          {statusText}
        </div>
      </div>
    </div>
  );
}
