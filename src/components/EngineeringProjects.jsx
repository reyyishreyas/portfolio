import { StaggerGrid, RevealItem } from './Reveal';

export default function EngineeringProjects() {
  const projects = [
    {
      sysId: 'card-smart-fixture',
      name: 'Smart Fixture',
      summary: 'Tournament management backend system with automated fixture generation, scheduling logic, database management and secure match-code verification.',
      impact: 'Backend Systems',
      tags: ['Python', 'MySQL', 'Flask', 'Scheduling Algorithms', 'API Design'],
      filepath: '',
      githubUrl: 'https://github.com/reyyishreyas/smart_fixture',
      problemStatement: 'Managing tournament fixtures manually is error-prone and time-consuming, especially for large-scale events.',
      built: 'Designed a comprehensive backend system with automated fixture generation algorithms, intelligent scheduling logic, robust database architecture for match data, and secure match-code verification flow for authentication.',
      techniques: 'Scheduling algorithms, database architecture, REST API design, secure authentication flow, backend system design'
    }
  ];

  return (
    <section aria-labelledby="title-engineering-projects">
      <div className="projects-container">
        <div className="projects-group-header">
          <h3 id="title-engineering-projects" className="projects-group-title">Engineering Projects</h3>
          <span className="projects-group-count">01 PROJECT</span>
        </div>
        <StaggerGrid className="case-studies-grid full-width">
          {projects.map((project) => (
            <RevealItem key={project.sysId}>
            <div className="case-study-card" id={project.sysId}>
              <div className="case-study-header">
                <span className="case-study-impact-tag">{project.impact}</span>
                <h4 className="case-study-title">{project.name}</h4>
                <p className="case-study-summary">{project.summary}</p>
              </div>

              <hr className="case-study-divider" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {project.problemStatement && (
                  <div>
                    <span className="case-study-section-label">Problem</span>
                    <p className="case-study-text">{project.problemStatement}</p>
                  </div>
                )}

                {project.built && (
                  <div>
                    <span className="case-study-section-label">Built</span>
                    <p className="case-study-text">{project.built}</p>
                  </div>
                )}

                {project.techniques && (
                  <div>
                    <span className="case-study-section-label">Technologies</span>
                    <p className="case-study-text">{project.techniques}</p>
                  </div>
                )}
              </div>

              <div className="case-study-footer">
                <div className="case-study-tags">
                  {project.tags.map((tag) => (
                    <span key={tag} className="case-study-tag">{tag}</span>
                  ))}
                </div>

                <div className="case-study-actions">
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Backend System
                  </span>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="case-study-github-btn"
                    title="View on GitHub"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="13"
                      height="13"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ display: 'inline-block', verticalAlign: 'middle' }}
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                    GitHub
                  </a>
                </div>
              </div>
            </div>
            </RevealItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
