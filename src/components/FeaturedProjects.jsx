import ProjectCard from './ProjectCard';
import { StaggerGrid, RevealItem } from './Reveal';

export default function FeaturedProjects() {
  const projects = [
    {
      sysId: 'card-trajectory-prediction',
      name: 'AI-Based Aerial Trajectory Prediction & Autonomous Simulation System',
      summary: 'Deep learning system built to predict aerial trajectories and run autonomous simulation visualizations.',
      impact: 'Flagship Project',
      tags: ['PyTorch', 'LSTM', 'GRU', 'Deep Learning', 'Python'],
      filepath: '/content/projects_ml/aerial_trajectory.md',
      githubUrl: 'https://github.com/reyyishreyas/Astra-chronus-ai-',
      showTrajectory: true,
      problemStatement: 'Predicting aerial flight paths for autonomous systems requires handling complex temporal sequences accurately.',
      built: 'Built a deep recurrent neural network pipeline with synthetic data generation, MinMax scaling, and interactive 2D/3D trajectory visualization comparing predictions against ground truth.',
      techniques: 'LSTM, GRU, sequence-to-sequence modeling, early stopping, dropout regularization, MinMax scaling, multi-step window sequencing'
    },
    {
      sysId: 'card-chessmind',
      name: 'ChessMind AI',
      summary: 'Adaptive chess intelligence engine powered by supervised ML and dynamic Elo adjustment.',
      impact: '50,028 Moves',
      tags: ['Python', 'FastAPI', 'Stockfish', 'Ollama', 'ML Ensembles'],
      filepath: '/content/projects_ml/chessmind.md',
      githubUrl: 'https://github.com/reyyishreyas/ChessMind_AI',
      problemStatement: 'Building an adaptive chess engine that adjusts playing strength dynamically based on opponent skill level.',
      built: 'Custom 50,028-move dataset with game-level splits, an 8-model stacking ensemble for opponent strength estimation (held-out R² 0.959, MAE 0.76 Elo), and a FastAPI service where Stockfish-validated suggestions are explained by a local LLM.',
      techniques: 'Stacking ensembles, game-level cross-validation, Elo estimation, FastAPI serving, streaming and caching, CI with lint, typecheck and 63 tests'
    },
    {
      sysId: 'card-research-analyst',
      name: 'Research Paper Analyst',
      summary: 'Agentic RAG system that answers questions across a paper corpus with cited sources, plus a RAGAS evaluation harness.',
      impact: 'Agentic RAG',
      tags: ['Python', 'LangChain', 'LangGraph', 'RAGAS', 'Streamlit'],
      filepath: '/content/projects_ml/research-analyst.md',
      githubUrl: 'https://github.com/reyyishreyas/research-agent-rag',
      liveUrl: 'https://research-agent-rag.streamlit.app',
      problemStatement: 'Answering questions across a corpus of research papers requires responses grounded in the sources and verifiable — not fluent summaries that invent citations.',
      built: 'Agentic RAG pipeline (LangChain + LangGraph + Gemini) with planner → retriever → verifier stages over five papers, hybrid BM25 + FAISS retrieval with reciprocal rank fusion for source-cited answers. RAGAS evaluation harness on a fixed 30-question set (faithfulness, context precision, context recall) with dense and hybrid retrieval configs, a 15-test pytest suite and a Dockerfile.',
      techniques: 'Agentic RAG, hybrid retrieval (BM25 + FAISS), reciprocal rank fusion, RAGAS evaluation, planner-verifier stages, pytest, Docker'
    },
    {
      sysId: 'card-tricp',
      name: 'TRICP',
      summary: 'Customer retention & churn analytics platform with retention-email automation and intervention simulation.',
      impact: 'Full-Stack ML',
      tags: ['Python', 'FastAPI', 'React', 'Vercel', 'Ensembles'],
      filepath: '/content/projects_ml/tricp.md',
      githubUrl: 'https://github.com/reyyishreyas/churn_predictor',
      liveUrl: 'https://churn-predictor-kappa.vercel.app',
      problemStatement: 'Retention teams need to know which customers are about to churn and which intervention will bring them back — not just a churn score.',
      built: 'FastAPI backend with interactive OpenAPI docs and a React/Vite frontend deployed on Vercel, retention-email automation, bulk campaigns and intervention simulation over a stacking ensemble (7,043 customers; ROC AUC 0.827). Built end-to-end with AI pair-programming (Claude Code).',
      techniques: 'Stacking ensembles, ROC AUC evaluation, FastAPI with OpenAPI docs, React/Vite, Vercel deployment, retention automation, intervention simulation'
    },
    {
      sysId: 'card-salary-predict',
      name: 'SalaryPredict AI',
      summary: 'End-to-end salary prediction system benchmarked across five regression approaches and deployed with a Flask app.',
      impact: '1st Place Winner',
      tags: ['Python', 'Scikit-learn', 'XGBoost', 'Flask', 'Stacking'],
      filepath: '/content/projects_ml/salary_predict.md',
      githubUrl: 'https://github.com/reyyishreyas/Salary_Predict_AI',
      problemStatement: 'Building a reliable compensation estimation system that compares multiple regression approaches on the program’s salary dataset.',
      built: 'Delivered on the program’s ~19.5k-row, 29-feature salary dataset: benchmarked five regression approaches and shipped a stacking ensemble that cut MAE from ₹41,512 (linear regression) to ₹5,791, plus a Flask app with bulk prediction, dashboards and a fairness audit by location, department and education.',
      techniques: 'Regression benchmarking, stacking ensembles, MAE/R² evaluation, fairness auditing, bulk prediction, Flask deployment'
    }
  ];

  return (
    <section id="projects" className="in-world" aria-labelledby="title-projects">
      <div style={{ marginBottom: 'var(--section-desktop)' }}>
        <div className="section-header">
          <span className="section-label">Portfolio</span>
          <h2 id="title-projects" className="section-title">Featured AI Systems</h2>
          <p className="section-subtitle">
            Machine learning systems, autonomous applications, and intelligent technology solutions built for real-world impact.
          </p>
        </div>

        <div className="projects-container">
          <div className="projects-group-header">
            <h3 className="projects-group-title">Machine Learning & AI</h3>
            <span className="projects-group-count">05 PROJECTS</span>
          </div>
          <StaggerGrid className="case-studies-grid">
            {projects.map((project) => (
              <RevealItem key={project.sysId}>
                <ProjectCard {...project} />
              </RevealItem>
            ))}
          </StaggerGrid>
        </div>
      </div>
    </section>
  );
}
