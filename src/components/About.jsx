import { Database, Cpu, Zap } from 'lucide-react';
import { StaggerGrid, RevealItem } from './Reveal';

export default function About() {
  const pillars = [
    {
      icon: Database,
      title: 'Machine Learning Engineering',
      items: ['Data Processing', 'Model Development', 'Evaluation', 'Deployment'],
      id: 'pillar-ml-engineering'
    },
    {
      icon: Cpu,
      title: 'Autonomous Systems',
      items: ['Prediction', 'Simulation', 'Intelligent Decision Making'],
      id: 'pillar-autonomous'
    },
    {
      icon: Zap,
      title: 'Applied AI',
      items: ['Real-world AI Applications', 'Automation', 'Problem Solving'],
      id: 'pillar-applied-ai'
    }
  ];

  const facets = [
    { role: 'Student', fact: 'B.E. AIML 2028 · BMSIT&M · CGPA 9.15/10' },
    { role: 'Builder', fact: 'Production ML systems, autonomous simulations, explainable AI' },
    { role: 'Researcher', fact: 'First-author abstract accepted at SICE 2026' },
    { role: 'Leader', fact: 'ASTRA President · 30-member team' },
    { role: 'Open source', fact: 'Merged pull requests in nilearn, PCNtoolkit and movement' }
  ];

  return (
    <section id="about" aria-labelledby="title-about">
      <div className="section-header">
        <span className="section-label">Profile</span>
        <h2 id="title-about" className="section-title">About</h2>
        <p className="section-subtitle">
          AI/ML Engineer building intelligent systems, ML applications, and autonomous technology solutions.
        </p>
      </div>

      <div className="about-content">
        <p className="about-description">
          Artificial Intelligence and Machine Learning undergraduate with hands-on experience in building production ML systems, autonomous simulations, and explainable AI platforms. I specialize in deep learning architectures, ensemble methods, and deploying intelligent applications that solve real problems.
        </p>

        <blockquote className="about-quote">
          Technology is something I build, not my entire identity.
        </blockquote>

        <ul className="about-facets">
          {facets.map((f) => (
            <li key={f.role} className="about-facet">
              <span className="about-facet-role">{f.role}</span>
              <span className="about-facet-fact">{f.fact}</span>
            </li>
          ))}
        </ul>

        <StaggerGrid className="about-highlights">
          {pillars.map((pillar) => (
            <RevealItem key={pillar.id}>
              <div id={pillar.id} className="highlight-card">
              <div className="highlight-icon">
                <pillar.icon size={22} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="highlight-label" style={{ marginBottom: '8px' }}>{pillar.title}</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {pillar.items.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '16px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--accent)', fontWeight: 700 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            </RevealItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
