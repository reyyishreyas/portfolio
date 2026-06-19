export default function Skills() {
  const skillGroups = [
    {
      category: 'Machine Learning',
      skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'XGBoost', 'Pandas', 'NumPy']
    },
    {
      category: 'Engineering',
      skills: ['Flask', 'MySQL', 'Git', 'GitHub']
    },
    {
      category: 'Concepts',
      skills: ['Deep Learning', 'NLP', 'Feature Engineering', 'Model Deployment', 'Explainable AI']
    }
  ];

  return (
    <section id="skills" className="reveal-element" aria-labelledby="title-skills">
      <div className="section-header">
        <span className="section-label">Technical Skills</span>
        <h2 id="title-skills" className="section-title">Skills & Technologies</h2>
      </div>

      <div className="skills-grid">
        {skillGroups.map((group, i) => (
          <div key={i} className="skill-card">
            <h4 className="skill-card-title">{group.category}</h4>
            <div className="skill-badges">
              {group.skills.map((skill, j) => (
                <span key={j} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
