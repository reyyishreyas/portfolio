import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ambience } from '../audio/ambience';
import { journeyState } from './journey';

/**
 * Audio entry UI for the forest: a gate that satisfies autoplay policy
 * (starting sound needs a gesture) plus a persistent mute toggle.
 * The gate steps aside once the visitor walks past the intro, whether
 * or not they ever clicked it — audio can start from the toggle later.
 *
 * @returns {JSX.Element}
 */
export default function ForestAudioGate() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const begun = journeyState.progress > 0.012;
      setStarted((prev) => (prev === begun ? prev : begun));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleEnter = async () => {
    const running = await ambience.start();
    setEntered(true);
    setMuted(!running);
  };

  const handleToggle = () => {
    if (!ambience.started) {
      ambience.start().then(() => setMuted(false));
      setEntered(true);
      return;
    }
    setMuted(ambience.toggleMute());
  };

  return (
    <div className="forest-ui">
      <button
        type="button"
        className="forest-audio"
        onClick={handleToggle}
        aria-label={
          !entered
            ? 'Play forest ambience'
            : muted
              ? 'Unmute forest ambience'
              : 'Mute forest ambience'
        }
        aria-pressed={muted}
      >
        {muted || !entered ? <VolumeX size={16} strokeWidth={1.5} /> : <Volume2 size={16} strokeWidth={1.5} />}
      </button>

      <button
        type="button"
        className={`forest-enter ${entered || started ? 'is-hidden' : ''}`}
        onClick={handleEnter}
        aria-hidden={entered || started}
        tabIndex={entered || started ? -1 : 0}
      >
        <span className="forest-enter-label">Enter the forest</span>
        <span className="forest-enter-hint">sound on · headphones recommended</span>
      </button>
    </div>
  );
}
