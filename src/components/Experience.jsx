import { Briefcase } from 'lucide-react';

export default function Experience() {
  const internDuties = [
    'Applied end-to-end ML workflows including preprocessing, feature engineering, model selection, training, and evaluation.',
    'Worked with Python ML libraries and supervised learning algorithms to build production-ready models.',
    'Developed SalaryPredict AI as a complete ML system from data ingestion to Flask deployment.',
    'Compared multiple regression models, tuned hyperparameters, and measured performance using standard ML metrics.'
  ];

  return (
    <section id="experience" className="reveal-element" aria-labelledby="title-experience" style={{ marginBottom: 'var(--section-desktop)' }}>
      <div className="section-header">
        <span className="section-label">Experience</span>
        <h2 id="title-experience" className="section-title">Professional Experience</h2>
      </div>

      <div className="experience-card">
        <div className="experience-header">
          <div className="experience-icon">
            <Briefcase size={18} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="experience-role">Machine Learning Intern</h3>
            <div className="experience-org">Launched Global</div>
          </div>
          <div className="experience-duration">August 2025 - December 2025</div>
        </div>

        <ul className="experience-bullets">
          {internDuties.map((duty, i) => (
            <li key={i}>{duty}</li>
          ))}
        </ul>

        <a
          href="https://www.linkedin.com/posts/reyyi-shreyas_machinelearning-artificialintelligence-datascience-share-7434916606188875776-gUc9/"
          target="_blank"
          rel="noopener noreferrer"
          className="experience-linkedin-btn"
        >
          View Internship Completion Post
        </a>

        <div className="experience-labels">
          <span className="experience-label">ML Workflow</span>
          <span className="experience-label">Preprocessing</span>
          <span className="experience-label">Feature Engineering</span>
          <span className="experience-label">Model Development</span>
          <span className="experience-label">SalaryPredict AI</span>
        </div>
      </div>
    </section>
  );
}
