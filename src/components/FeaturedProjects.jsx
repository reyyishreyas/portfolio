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
      impact: '100K+ Dataset',
      tags: ['Python', 'Random Forest', 'XGBoost', 'Stockfish', 'Gemini'],
      filepath: '/content/projects_ml/chessmind.md',
      githubUrl: 'https://github.com/reyyishreyas/ChessMind_AI',
      problemStatement: 'Building an adaptive chess engine that adjusts playing strength dynamically based on opponent skill level.',
      built: 'Custom 100k+ game dataset with advanced feature extraction, supervised classification models, and dynamic Elo system powered by Stockfish and Gemini API integration.',
      techniques: 'Random Forest, XGBoost, custom feature engineering, Stockfish evaluation, Gemini API integration, dynamic Elo adjustment'
    },
    {
      sysId: 'card-tricp',
      name: 'TRICP',
      summary: 'Machine learning retention intelligence platform with explainable AI and automated customer retention.',
      impact: 'Explainable AI',
      tags: ['XGBoost', 'LightGBM', 'Random Forest', 'SHAP', 'Flask'],
      filepath: '/content/projects_ml/tricp.md',
      githubUrl: 'https://github.com/reyyishreyas/churn_predictor',
      problemStatement: 'Identifying at-risk customers before churn while providing business stakeholders with explainable predictions.',
      built: 'Ensemble classification pipeline combining XGBoost, LightGBM, and Random Forest. SHAP-based explainability for individual predictions. Interactive analytics dashboard for retention teams.',
      techniques: 'Ensemble ML, SHAP explainability, classification, analytics dashboard, model interpretation'
    },
    {
      sysId: 'card-salary-predict',
      name: 'SalaryPredict AI',
      summary: 'End-to-end ML salary prediction platform with regression models and Flask deployment.',
      impact: '1st Place Winner',
      tags: ['XGBoost', 'Random Forest', 'Regression', 'Flask', 'Scikit-learn'],
      filepath: '/content/projects_ml/salary_predict.md',
      githubUrl: 'https://github.com/reyyishreyas/Salary_Predict_AI',
      problemStatement: 'Building a reliable compensation estimation system that compares multiple regression approaches.',
      built: 'Complete ML pipeline with preprocessing, feature selection, hyperparameter tuning, ensemble voting regressor, and a Flask-based dashboard for real-time salary predictions.',
      techniques: 'Regression, XGBoost, Gradient Boosting, Random Forest, ensemble voting, Flask deployment'
    }
  ];

  return (
    <section id="projects" aria-labelledby="title-projects">
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
            <span className="projects-group-count">04 PROJECTS</span>
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
