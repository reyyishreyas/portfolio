import { useMemo } from 'react';
import { motion } from 'motion/react';
import { mulberry32 } from '../three/utils';

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

/**
 * Seeded transition band: forest-like flowing curves on the left break
 * into a scattered node graph in the middle and resolve into an 8x8
 * chess lattice with a traced knight path on the right — organic
 * patterns becoming computational structure, in one graphic.
 *
 * @returns {{organic: string[], nodes: {x: number, y: number}[], edges: {a: {x: number, y: number}, b: {x: number, y: number}}[], squares: {x: number, y: number, checker: boolean}[], knightD: string, knightPts: {x: number, y: number}[]}}
 */
function buildBand() {
  const rnd = mulberry32(9031);

  const organic = [];
  for (let i = 0; i < 6; i += 1) {
    const y0 = 30 + i * 32 + rnd() * 14;
    let x = -10;
    let y = y0;
    let d = `M ${x} ${y0.toFixed(1)}`;
    for (let s = 1; s <= 4; s += 1) {
      const nx = x + 78;
      const ny = y + (rnd() - 0.5) * 70;
      d += ` C ${(x + 30).toFixed(1)} ${(y + (rnd() - 0.5) * 50).toFixed(1)} ${(nx - 30).toFixed(1)} ${(ny + (rnd() - 0.5) * 50).toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
      x = nx;
      y = ny;
    }
    organic.push(d);
  }

  const nodes = [];
  for (let i = 0; i < 14; i += 1) {
    nodes.push({ x: 335 + rnd() * 315, y: 25 + rnd() * 170 });
  }
  const edges = [];
  const seen = new Set();
  for (let i = 0; i < nodes.length; i += 1) {
    const near = nodes
      .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d);
    const k = rnd() > 0.5 ? 2 : 1;
    for (let t = 0; t < k; t += 1) {
      const o = near[t];
      if (o.d < 150) {
        const key = `${Math.min(i, o.j)}-${Math.max(i, o.j)}`;
        if (!seen.has(key)) {
          seen.add(key);
          edges.push({ a: nodes[i], b: nodes[o.j] });
        }
      }
    }
  }

  const x0 = 796;
  const y0 = 6;
  const s = 26;
  const squares = [];
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      squares.push({ x: x0 + c * s, y: y0 + r * s, checker: (r + c) % 2 === 1 });
    }
  }

  const knightMoves = [
    [0, 0], [1, 2], [3, 3], [5, 4], [7, 3], [6, 1], [4, 0], [3, 2],
    [1, 1], [0, 3], [2, 4], [4, 5], [6, 6], [7, 4], [5, 5],
  ];
  const knightPts = knightMoves.map(([c, r]) => ({ x: x0 + c * s + s / 2, y: y0 + r * s + s / 2 }));
  const knightD = `M ${knightPts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;

  return { organic, nodes, edges, squares, knightD, knightPts };
}

/**
 * ChessMind AI presented as a discovery: the organic-to-computational
 * transition band, verified metrics from the project (50,028 samples,
 * held-out R2 0.959, MAE 0.76 Elo, ~160 ms/move), and links to the
 * repository and the architecture card in Projects.
 *
 * @returns {JSX.Element}
 */
export default function ChessSpotlight() {
  const band = useMemo(() => buildBand(), []);

  return (
    <section id="chessmind" aria-labelledby="title-chessmind">
      <div style={{ marginBottom: 'var(--section-desktop)' }}>
        <div className="section-header">
          <span className="section-label">Spotlight</span>
          <h2 id="title-chessmind" className="section-title">ChessMind AI</h2>
          <p className="section-subtitle">
            Adaptive chess intelligence powered by supervised ML and dynamic Elo
            adjustment — with every suggested move explained by a local LLM.
          </p>
        </div>

        <article className="chess-plate">
          <svg className="chess-band" viewBox="0 0 1040 220" aria-hidden="true">
            <defs>
              <linearGradient id="chessFlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7a8a62" />
                <stop offset="0.55" stopColor="#5cc3ba" />
                <stop offset="1" stopColor="#6fd3c8" />
              </linearGradient>
            </defs>

            {band.organic.map((d, k) => (
              <motion.path
                key={`o${k}`}
                d={d}
                fill="none"
                stroke="#7a8a62"
                strokeWidth={1.3}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.6 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.1, delay: k * 0.09, ease: 'easeOut' }}
              />
            ))}

            {band.edges.map((e, k) => (
              <motion.path
                key={`e${k}`}
                d={`M ${e.a.x.toFixed(1)} ${e.a.y.toFixed(1)} L ${e.b.x.toFixed(1)} ${e.b.y.toFixed(1)}`}
                stroke="#6fd3c8"
                strokeWidth={0.9}
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.45 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: 0.9 + k * 0.04, ease: 'easeOut' }}
              />
            ))}

            {band.nodes.map((n, k) => (
              <motion.circle
                key={`n${k}`}
                cx={n.x}
                cy={n.y}
                r={3}
                fill="#6fd3c8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.85 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: 1.05 + k * 0.04 }}
              />
            ))}

            {band.squares.map((q, k) => (
              <motion.rect
                key={`q${k}`}
                x={q.x}
                y={q.y}
                width={26}
                height={26}
                fill={q.checker ? 'rgba(216, 207, 183, 0.055)' : 'none'}
                stroke="rgba(216, 207, 183, 0.22)"
                strokeWidth={0.75}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.3, delay: 1.25 + k * 0.012 }}
              />
            ))}

            <motion.path
              d={band.knightD}
              fill="none"
              stroke="#8fe3d8"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.8, delay: 1.9, ease: 'easeInOut' }}
            />

            {band.knightPts.map((p, k) => (
              <motion.circle
                key={`k${k}`}
                cx={p.x}
                cy={p.y}
                r={2.4}
                fill="#d8cbb7"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.9 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.3, delay: 2.0 + k * 0.1 }}
              />
            ))}
          </svg>

          <div className="chess-body">
            <div className="research-tags">
              <span>Supervised ML</span>
              <span>Self-hosted LLM</span>
              <span>FastAPI</span>
              <span>Stockfish-validated</span>
            </div>

            <div className="chess-stats">
              <div className="chess-stat">
                <span className="chess-stat-value">0.959</span>
                <span className="chess-stat-label">Held-out R²</span>
              </div>
              <div className="chess-stat">
                <span className="chess-stat-value">0.76</span>
                <span className="chess-stat-label">MAE (Elo)</span>
              </div>
              <div className="chess-stat">
                <span className="chess-stat-value">~160 ms</span>
                <span className="chess-stat-label">Per move · FastAPI</span>
              </div>
              <div className="chess-stat">
                <span className="chess-stat-value">7.6 → 1.7 s</span>
                <span className="chess-stat-label">First feedback</span>
              </div>
            </div>

            <dl className="research-facts">
              <div>
                <dt>Dataset</dt>
                <dd>50,028 move samples, split at game level</dd>
              </div>
              <div>
                <dt>Ensemble</dt>
                <dd>8-model stacking ensemble estimating opponent strength</dd>
              </div>
              <div>
                <dt>Validation</dt>
                <dd>Stockfish-validated suggestions explained by a local Ollama LLM; CI runs lint, typecheck and 63 tests</dd>
              </div>
            </dl>

            <div className="chess-links">
              <a href="https://github.com/reyyishreyas/ChessMind_AI" target="_blank" rel="noopener noreferrer" className="chess-link">
                <GitHubIcon />
                GitHub repository
              </a>
              <a href="#card-chessmind" className="chess-link chess-link-muted">
                Architecture write-up in Projects
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
