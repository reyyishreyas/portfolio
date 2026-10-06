import { useMemo } from 'react';
import { mulberry32 } from '../three/utils';

/**
 * Decorative treeline band that keeps the forest present as the visual
 * language between the 3D opening and the content. With `closing`, the
 * band inverts its seams so the forest takes the page back at the end
 * — the journey returns to where it started. Seeded conifer silhouettes
 * over mist: pure decoration, never interactive.
 *
 * @param {{closing?: boolean}} props closing variant for the page end
 * @returns {JSX.Element}
 */
export default function ForestEdge({ closing = false }) {
  const layers = useMemo(() => {
    const rnd = mulberry32(4471);
    const build = (count, minH, maxH) => {
      const baseY = 120;
      let d = `M -20 ${baseY} `;
      for (let i = 0; i <= count; i += 1) {
        const x = (i / count) * 1080 - 20;
        const w = 20 + rnd() * 28;
        const h = minH + rnd() * (maxH - minH);
        d += `L ${x - w / 2} ${baseY} L ${x} ${baseY - h} L ${x + w / 2} ${baseY} `;
      }
      d += `L 1060 ${baseY} L 1060 140 L -20 140 Z`;
      return d;
    };
    return [
      { d: build(26, 26, 96), fill: '#0b110d', opacity: 0.85 },
      { d: build(18, 18, 78), fill: '#101712', opacity: 1 },
    ];
  }, []);

  return (
    <div className={`forest-edge${closing ? ' forest-edge--closing' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 1040 140" preserveAspectRatio="none">
        {layers.map((l, i) => (
          <path key={i} d={l.d} fill={l.fill} opacity={l.opacity} />
        ))}
      </svg>
      <div className="forest-edge-mist" />
    </div>
  );
}
