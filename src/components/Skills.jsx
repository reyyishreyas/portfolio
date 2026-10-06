import { StaggerGrid, RevealItem } from './Reveal';

export default function Skills() {
  const skillGroups = [
    {
      category: 'Agentic & LLM',
      skills: ['LangChain', 'LangGraph', 'RAG', 'FAISS', 'BM25', 'RAGAS', 'Gemini API', 'Ollama', 'MCP']
    },
    {
      category: 'ML & Deep Learning',
      skills: ['PyTorch', 'Scikit-learn', 'XGBoost', 'LightGBM', 'Ensemble Methods', 'Computer Vision']
    },
    {
      category: 'Backend & Data',
      skills: ['Python', 'FastAPI', 'Flask', 'Docker', 'SQL', 'Pandas', 'NumPy', 'Git/GitHub', 'CI/CD']
    },
    {
      category: 'Tooling',
      skills: ['Claude Code', 'Streamlit', 'Vercel', 'pytest']
    }
  ];

  return (
    <section id="skills" aria-labelledby="title-skills">
      <div className="section-header">
        <span className="section-label">Technical Skills</span>
        <h2 id="title-skills" className="section-title">Skills & Technologies</h2>
      </div>

      <StaggerGrid className="skills-grid">
        {skillGroups.map((group, i) => (
          <RevealItem key={i}>
          <div className="skill-card">
            <h4 className="skill-card-title">{group.category}</h4>
            <div className="skill-badges">
              {group.skills.map((skill, j) => (
                <span key={j} className="skill-badge">{skill}</span>
              ))}
            </div>
          </div>
          </RevealItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
