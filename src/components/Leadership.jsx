import { useMemo } from 'react';
import { motion } from 'motion/react';
import { mulberry32 } from '../three/utils';

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

/**
 * Seeded structure band for ASTRA: flowing organic lines on the left
 * straighten into an engineered grid on the right — the section's
 * nature-to-structure language. Pure decoration.
 *
 * @returns {{lines: string[], grid: string}}
 */
function buildStructure() {
  const rnd = mulberry32(5514);
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const lines = [];
  const count = 7;
  const flat = (i) => 25 + i * 20;

  for (let i = 0; i < count; i += 1) {
    const phase = rnd() * Math.PI * 2;
    const freq = 0.008 + rnd() * 0.006;
    let d = '';
    for (let x = -10; x <= 1050; x += 35) {
      const organize = smooth((x - 360) / 540);
      const y = flat(i) + (1 - organize) * 30 * Math.sin(x * freq + phase);
      d += `${x === -10 ? 'M' : 'L'} ${x} ${y.toFixed(1)} `;
    }
    lines.push(d);
  }

  // vertical ties where the lines have straightened
  let grid = '';
  for (const x of [770, 845, 920, 995]) {
    grid += `M ${x} ${flat(0)} L ${x} ${flat(count - 1)} `;
  }

  return { lines, grid };
}

/**
 * The ASTRA section: defence-technology club leadership — both verified
 * roles (President, Technical Head) with exact dates, team/research
 * outcomes, duties, and the expo repository. The structure band above
 * carries the organic-to-engineered visual language.
 *
 * @returns {JSX.Element}
 */
export default function Leadership() {
  const structure = useMemo(() => buildStructure(), []);

  const leadershipDuties = [
    'Led a 30-member team through 6 research manuscript submissions — 3 abstracts accepted at SICE 2026, including my first-author abstract.',
    'Leading technical initiatives and architecture decisions for the ASTRA defence technology club.',
    'Driving project ideation, technical planning, and implementation across autonomous systems and defence tech.',
    'Conducting technical sessions on Git/GitHub workflows, development practices, and ML tooling.',
    'Supporting ASTRA Defence Tech Expo activities, platform architecture, and technical execution.'
  ];

  return (
    <section id="astra" aria-labelledby="title-astra" style={{ marginBottom: 'var(--section-desktop)' }}>
      <div className="section-header">
        <span className="section-label">Leadership</span>
        <h2 id="title-astra" className="section-title">ASTRA</h2>
        <p className="section-subtitle">
          Armed Squad for Tactical Readiness &amp; Awareness — the defence-technology
          student club at BMSIT&amp;M.
        </p>
      </div>

      <div className="astra-plate">
        <svg className="astra-structure" viewBox="0 0 1040 170" aria-hidden="true">
          <defs>
            <linearGradient id="astraFlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7a8a62" />
              <stop offset="1" stopColor="#5cc3ba" />
            </linearGradient>
          </defs>
          {structure.lines.map((d, k) => (
            <motion.path
              key={`l${k}`}
              d={d}
              fill="none"
              stroke="url(#astraFlow)"
              strokeWidth={1.2}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.6 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 1.3, delay: k * 0.1, ease: 'easeOut' }}
            />
          ))}
          <motion.path
            d={structure.grid}
            fill="none"
            stroke="#6fd3c8"
            strokeWidth={1}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.5 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.9, delay: 1.1, ease: 'easeOut' }}
          />
        </svg>

        <div className="astra-body">
          <div className="astra-roles">
            <div className="astra-role">
              <span className="astra-role-title">President</span>
              <span className="astra-role-when">Sep 2026 – Present</span>
            </div>
            <div className="astra-role">
              <span className="astra-role-title">Technical Head</span>
              <span className="astra-role-when">Sep 2025 – Sep 2026</span>
            </div>
          </div>

          <ul className="leadership-bullets">
            {leadershipDuties.map((duty, i) => (
              <li key={i}>{duty}</li>
            ))}
          </ul>

          <div className="leadership-areas">
            <span className="leadership-area-tag">Technical Planning</span>
            <span className="leadership-area-tag">System Design</span>
            <span className="leadership-area-tag">Research Mentoring</span>
            <span className="leadership-area-tag">Team Coordination</span>
          </div>

          <a
            href="https://github.com/sharathkudachi/astra-defence-tech-expo"
            target="_blank"
            rel="noopener noreferrer"
            className="leadership-repo-link"
          >
            <GitHubIcon />
            View Repository
          </a>
        </div>
      </div>
    </section>
  );
}
