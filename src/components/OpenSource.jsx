import { useMemo } from 'react';
import { motion } from 'motion/react';
import { mulberry32 } from '../three/utils';

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const mergedPRs = [
  {
    repo: 'nilearn',
    pr: '#6614',
    title: 'Decoder training-log fix',
    url: 'https://github.com/nilearn/nilearn/pull/6614',
  },
  {
    repo: 'PCNtoolkit',
    pr: '#551',
    title: 'HBR tutorial docs',
    url: 'https://github.com/predictive-clinical-neuroscience/PCNtoolkit/pull/551',
  },
  {
    repo: 'movement',
    pr: '#1115',
    title: 'I/O guide docs',
    url: 'https://github.com/neuroinformatics-unit/movement/pull/1115',
  },
];

/**
 * Seeded contribution-cell band: a grid of small cells where a subset
 * lights up column by column, left to right — commits landing over time.
 * Pure decoration.
 *
 * @returns {{cells: {x: number, y: number, level: number}[], cols: number, rows: number, cell: number}}
 */
function buildCells() {
  const rnd = mulberry32(3312);
  const cols = 30;
  const rows = 5;
  const cell = 26;
  const cells = [];
  for (let c = 0; c < cols; c += 1) {
    for (let r = 0; r < rows; r += 1) {
      const roll = rnd();
      const level = roll > 0.86 ? 3 : roll > 0.7 ? 2 : roll > 0.42 ? 1 : 0;
      cells.push({ x: 6 + c * cell, y: 6 + r * cell, level });
    }
  }
  return { cells, cols, rows, cell };
}

/**
 * Open source contributions: verified aggregate stats (8 merged pull
 * requests, 11 in review across upstream projects) and the three merged
 * PRs cited on the resume, each linking to its merged PR page.
 *
 * @returns {JSX.Element}
 */
export default function OpenSource() {
  const graph = useMemo(() => buildCells(), []);

  return (
    <section id="opensource" aria-labelledby="title-opensource" style={{ marginBottom: 'var(--section-desktop)' }}>
      <div className="section-header">
        <span className="section-label">Open Source</span>
        <h2 id="title-opensource" className="section-title">Contributions</h2>
        <p className="section-subtitle">
          Merged pull requests across established scientific Python and tooling
          projects, with more in review upstream.
        </p>
      </div>

      <div className="os-plate">
        <svg className="os-band" viewBox={`0 0 ${6 + graph.cols * graph.cell} ${6 + graph.rows * graph.cell}`} aria-hidden="true">
          {graph.cells.map((q, i) => (
            <motion.rect
              key={i}
              x={q.x}
              y={q.y}
              width={graph.cell - 5}
              height={graph.cell - 5}
              rx={3}
              fill={q.level === 0 ? 'rgba(216, 207, 183, 0.06)' : q.level === 1 ? 'rgba(92, 195, 186, 0.28)' : q.level === 2 ? 'rgba(92, 195, 186, 0.55)' : '#6fd3c8'}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: 0.1 + Math.floor(i / graph.rows) * 0.045 }}
            />
          ))}
        </svg>

        <div className="os-body">
          <div className="os-stats">
            <div className="os-stat">
              <span className="os-stat-value">8</span>
              <span className="os-stat-label">Merged PRs</span>
            </div>
            <div className="os-stat">
              <span className="os-stat-value">11</span>
              <span className="os-stat-label">Open · in review</span>
            </div>
            <div className="os-stat">
              <span className="os-stat-value">4+</span>
              <span className="os-stat-label">Upstream projects</span>
            </div>
          </div>

          <ul className="os-rows">
            {mergedPRs.map((row) => (
              <li key={`${row.repo}-${row.pr}`} className="os-row">
                <a href={row.url} target="_blank" rel="noopener noreferrer" className="os-row-link">
                  <span className="os-row-repo">{row.repo}</span>
                  <span className="os-row-pr">{row.pr}</span>
                  <span className="os-row-title">{row.title}</span>
                  <span className="os-row-status">Merged</span>
                </a>
              </li>
            ))}
          </ul>

          <p className="os-more">
            Five more merged pull requests across mcp-mifosx and nilearn.
          </p>

          <a
            href="https://github.com/reyyishreyas"
            target="_blank"
            rel="noopener noreferrer"
            className="os-profile-link"
          >
            <GitHubIcon />
            github.com/reyyishreyas
          </a>
        </div>
      </div>
    </section>
  );
}
