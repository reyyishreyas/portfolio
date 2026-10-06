import { useMemo } from 'react';
import { motion } from 'motion/react';
import { mulberry32 } from '../three/utils';

/**
 * Seeded root system that grows when the section scrolls into view:
 * roots descending from the surface (organic) toward the paper below,
 * node dots where they branch — the visual bridge from roots to
 * networks to the information structure of the research itself.
 *
 * @returns {{paths: {d: string, i: number}[], nodes: {x: number, y: number, warm: boolean}[]}}
 */
function buildRoots() {
  const rnd = mulberry32(7723);
  const W = 1040;
  const H = 230;
  const paths = [];
  const nodes = [];
  const count = 8;

  for (let i = 0; i < count; i += 1) {
    let x = 30 + (i / (count - 1)) * (W - 60) + (rnd() - 0.5) * 60;
    let y = -6;
    const depth = H * (0.5 + rnd() * 0.5);
    const steps = 7;
    let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    let mid = null;

    for (let s = 1; s <= steps; s += 1) {
      const ny = (depth / steps) * s;
      const nx = x + (rnd() - 0.5) * 54;
      d += ` Q ${(x + (rnd() - 0.5) * 26).toFixed(1)} ${((y + ny) / 2).toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
      x = nx;
      y = ny;
      if (s === 3) mid = { x, y };
      if (s === 3 || s === steps) nodes.push({ x, y, warm: rnd() > 0.55 });
    }
    paths.push({ d, i });

    // a side root branching off the main one
    if (mid && rnd() > 0.3) {
      let bx = mid.x;
      let by = mid.y;
      let bd = `M ${bx.toFixed(1)} ${by.toFixed(1)}`;
      const dir = rnd() > 0.5 ? 1 : -1;
      for (let s = 1; s <= 3; s += 1) {
        const nx = bx + dir * (18 + rnd() * 34);
        const ny = by + (depth * 0.16 + rnd() * 18);
        bd += ` Q ${((bx + nx) / 2).toFixed(1)} ${(by + (rnd() - 0.5) * 14).toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
        bx = nx;
        by = ny;
      }
      paths.push({ d: bd, i: i + count });
      nodes.push({ x: bx, y: by, warm: rnd() > 0.4 });
    }
  }
  return { paths, nodes };
}

/**
 * The research section: first-author paper presented as an editorial
 * plate — status tags, exact measured facts, and the R² comparison
 * against the image-only baseline. Roots grow above it on entry.
 *
 * @returns {JSX.Element}
 */
export default function Research() {
  const roots = useMemo(() => buildRoots(), []);

  return (
    <section id="research" aria-labelledby="title-research">
      <div style={{ marginBottom: 'var(--section-desktop)' }}>
        <div className="section-header">
          <span className="section-label">Research</span>
          <h2 id="title-research" className="section-title">First-author work in geospatial AI</h2>
          <p className="section-subtitle">
            Multimodal deep learning for geospatial hazard risk prediction — from a curated
            city-scale dataset to a transformer fusion module, evaluated against fusion and
            attention baselines.
          </p>
        </div>

        <article className="research-plate">
          <svg
            className="research-roots"
            viewBox="0 0 1040 230"
            preserveAspectRatio="xMidYMin slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="rootGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#7a8a62" />
                <stop offset="1" stopColor="#5cc3ba" />
              </linearGradient>
            </defs>
            {roots.paths.map((p, k) => (
              <motion.path
                key={p.d.slice(0, 24) + k}
                d={p.d}
                fill="none"
                stroke="url(#rootGrad)"
                strokeWidth={p.i < 8 ? 1.5 : 1}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.65 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 1.4, delay: p.i * 0.07, ease: 'easeOut' }}
              />
            ))}
            {roots.nodes.map((n, k) => (
              <motion.circle
                key={`n${k}`}
                cx={n.x}
                cy={n.y}
                r={2.4}
                fill={n.warm ? '#d8cbb7' : '#6fd3c8'}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.85 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: 1.15 + (k % 6) * 0.1 }}
              />
            ))}
          </svg>

          <header className="research-plate-head">
            <div className="research-tags">
              <span>First author</span>
              <span>SICE 2026</span>
              <span>Abstract accepted</span>
              <span>Manuscript under review</span>
            </div>
            <h3 className="research-paper-title">
              GCM-HAIRNet: A Geographic Context Multimodal Deep Learning Framework for
              Geospatial Hazard Risk Prediction
            </h3>
          </header>

          <dl className="research-facts">
            <div>
              <dt>Module</dt>
              <dd>Geographic Context Module — transformer-based SwinV2 + CNN fusion</dd>
            </div>
            <div>
              <dt>Dataset</dt>
              <dd>60+ curated cities — GIS and visual features</dd>
            </div>
            <div>
              <dt>Baselines</dt>
              <dd>Outperformed 7 fusion and attention baselines</dd>
            </div>
          </dl>

          <div className="research-bars">
            <p className="research-bars-caption">R² — held-out cities</p>
            <div className="research-bar-row">
              <span className="research-bar-label">GCM-HAIRNet</span>
              <span className="research-bar-track">
                <span className="research-bar-fill" style={{ width: '95.4%' }} />
              </span>
              <span className="research-bar-value">0.954</span>
            </div>
            <div className="research-bar-row">
              <span className="research-bar-label">Image-only baseline</span>
              <span className="research-bar-track">
                <span className="research-bar-fill is-muted" style={{ width: '62.7%' }} />
              </span>
              <span className="research-bar-value">0.627</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
