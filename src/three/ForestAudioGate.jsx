import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ambience } from '../audio/ambience';

/**
 * Audio entry UI for the forest: a gate that satisfies autoplay policy
 * (starting sound needs a gesture) plus a persistent mute toggle.
 * The site stays fully usable if the visitor ignores the gate.
 *
 * @returns {JSX.Element}
 */
export default function ForestAudioGate() {
  const [entered, setEntered] = useState(false);
  const [muted, setMuted] = useState(false);

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
        className={`forest-enter ${entered ? 'is-hidden' : ''}`}
        onClick={handleEnter}
        aria-hidden={entered}
        tabIndex={entered ? -1 : 0}
      >
        <span className="forest-enter-label">Enter the forest</span>
        <span className="forest-enter-hint">sound on · headphones recommended</span>
      </button>
    </div>
  );
}
