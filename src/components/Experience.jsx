import { Briefcase } from 'lucide-react';

export default function Experience() {
  const internDuties = [
    'Delivered SalaryPredict AI end-to-end on the program’s ~19.5k-row salary dataset: benchmarked five regression approaches and shipped a stacking ensemble that cut MAE from ₹41,512 (linear regression) to ₹5,791.',
    'Built the Flask app with bulk prediction, dashboards and a fairness audit by location, department and education.',
    '1st Place — Launched Global ML Expo (SalaryPredict AI).'
  ];

  return (
    <section id="experience" aria-labelledby="title-experience" style={{ marginBottom: 'var(--section-desktop)' }}>
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
