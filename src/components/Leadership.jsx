import { Shield } from 'lucide-react';

export default function Leadership() {
  const leadershipDuties = [
    'Leading technical initiatives and architecture decisions for ASTRA defence technology club.',
    'Driving project ideation, technical planning, and implementation across autonomous systems and defence tech.',
    'Conducting technical sessions on Git/GitHub workflows, development practices, and ML tooling.',
    'Supporting ASTRA Defence Tech Expo activities, platform architecture, and technical execution.'
  ];

  const GitHubIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );

  return (
    <section id="leadership" className="reveal-element" aria-labelledby="title-leadership" style={{ marginBottom: 'var(--section-desktop)' }}>
      <div className="section-header">
        <span className="section-label">Leadership</span>
        <h2 id="title-leadership" className="section-title">Technical Leadership</h2>
      </div>

      <div className="leadership-card">
        <div className="leadership-header">
          <div className="leadership-icon">
            <Shield size={20} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="leadership-role">Technical Head</h3>
            <div className="leadership-org">ASTRA (Armed Squad for Tactical Readiness and Awareness)</div>
          </div>
          <div className="leadership-duration">September 2025 - Present</div>
        </div>

        <ul className="leadership-bullets">
          {leadershipDuties.map((duty, i) => (
            <li key={i}>{duty}</li>
          ))}
        </ul>

        <div className="leadership-areas">
          <span className="leadership-area-tag">Technical Planning</span>
          <span className="leadership-area-tag">System Design</span>
          <span className="leadership-area-tag">Development</span>
          <span className="leadership-area-tag">Team Coordination</span>
        </div>

        <a
          href="https://github.com/sharathkudachi/astra-defence-tech-expo"
          target="_blank"
          rel="noopener noreferrer"
          className="leadership-repo-link"
          style={{ alignSelf: 'flex-start' }}
        >
          <GitHubIcon />
          View Repository
        </a>
      </div>
    </section>
  );
}
