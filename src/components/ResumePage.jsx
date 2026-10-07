/**
 * Print-first resume page served at /resume. Light paper styling so the
 * page and its printed PDF read like a document rather than the immersive
 * site. Content mirrors the verified resume facts; the hosted PDF is
 * generated from this page so the two can never drift.
 *
 * @returns {JSX.Element}
 */
export default function ResumePage() {
  return (
    <div className="resume-page">
      <div className="resume-sheet">
        <div className="resume-actions">
          <button type="button" className="resume-print-btn" onClick={() => window.print()}>
            Print / Save as PDF
          </button>
        </div>

        <header className="resume-header">
          <h1 className="resume-name">Reyyi Shreyas</h1>
          <p className="resume-headline">AI/ML Engineer · LLM Systems, RAG &amp; Evals</p>
          <p className="resume-contact">
            <a href="mailto:reyyishreyas@gmail.com">reyyishreyas@gmail.com</a>
            <span className="resume-sep">·</span>
            <a href="https://github.com/reyyishreyas" target="_blank" rel="noopener noreferrer">github.com/reyyishreyas</a>
            <span className="resume-sep">·</span>
            <a href="https://linkedin.com/in/reyyi-shreyas" target="_blank" rel="noopener noreferrer">linkedin.com/in/reyyi-shreyas</a>
          </p>
        </header>

        <section className="resume-section">
          <h2>Education</h2>
          <div className="resume-entry">
            <div className="resume-entry-head">
              <span className="resume-entry-title">B.E., Artificial Intelligence and Machine Learning</span>
              <span className="resume-entry-when">2024 – 2028</span>
            </div>
            <p className="resume-entry-sub">BMS Institute of Technology and Management, Bengaluru · CGPA 9.15/10</p>
          </div>
        </section>

        <section className="resume-section">
          <h2>Experience</h2>
          <div className="resume-entry">
            <div className="resume-entry-head">
              <span className="resume-entry-title">Machine Learning Intern — Launched Global</span>
              <span className="resume-entry-when">Aug 2025 – Dec 2025</span>
            </div>
            <ul className="resume-bullets">
              <li>Delivered SalaryPredict AI end-to-end on the program’s ~19.5k-row, 29-feature salary dataset: benchmarked five regression approaches, shipped a stacking ensemble that cut MAE from ₹41,512 (linear regression) to ₹5,791, plus a Flask app with bulk prediction, dashboards and a fairness audit by location, department and education.</li>
              <li>1st Place — Launched Global ML Expo (SalaryPredict AI).</li>
            </ul>
          </div>
        </section>

        <section className="resume-section">
          <h2>Projects</h2>

          <div className="resume-entry">
            <div className="resume-entry-head">
              <span className="resume-entry-title">Research Paper Analyst — agentic RAG + evaluation harness</span>
              <a className="resume-entry-when" href="https://research-agent-rag.streamlit.app" target="_blank" rel="noopener noreferrer">research-agent-rag.streamlit.app</a>
            </div>
            <ul className="resume-bullets">
              <li>Built an agentic RAG system (LangChain + LangGraph + Gemini) with planner → retriever → verifier stages that routes queries across retrieval, summarisation and comparison tools over five papers; hybrid BM25 + FAISS retrieval with reciprocal rank fusion for grounded, source-cited answers.</li>
              <li>Built a RAGAS evaluation harness on a fixed 30-question set measuring faithfulness, context precision and context recall, with dense and hybrid retrieval configs; shipped with a 15-test pytest suite and Dockerfile.</li>
            </ul>
          </div>

          <div className="resume-entry">
            <div className="resume-entry-head">
              <span className="resume-entry-title">TRICP — customer retention &amp; churn analytics</span>
              <a className="resume-entry-when" href="https://churn-predictor-kappa.vercel.app" target="_blank" rel="noopener noreferrer">churn-predictor-kappa.vercel.app</a>
            </div>
            <ul className="resume-bullets">
              <li>Built end-to-end with AI pair-programming (Claude Code) and deployed live on Vercel: FastAPI backend with interactive OpenAPI docs + React/Vite frontend, retention-email automation, bulk campaigns and intervention simulation over a stacking ensemble (7,043 customers; ROC AUC 0.827).</li>
            </ul>
          </div>

          <div className="resume-entry">
            <div className="resume-entry-head">
              <span className="resume-entry-title">ChessMind AI — adaptive chess coach with self-hosted LLM</span>
              <a className="resume-entry-when" href="https://github.com/reyyishreyas/ChessMind_AI" target="_blank" rel="noopener noreferrer">github.com/reyyishreyas/ChessMind_AI</a>
            </div>
            <ul className="resume-bullets">
              <li>8-model stacking ensemble on 50,028 move samples predicting per-move Elo change with a game-level split (no game across train/test): held-out R² 0.959, MAE 0.76 Elo.</li>
              <li>Serves ~160 ms/move via FastAPI; cut first-feedback latency 7.6 s → 1.7 s (streaming, caching); CI runs lint, typecheck, 63 tests and build on every push; Stockfish-validated suggestions explained by a local Ollama LLM.</li>
            </ul>
          </div>
        </section>

        <section className="resume-section">
          <h2>Research</h2>
          <ul className="resume-bullets">
            <li>First author, “GCM-HAIRNet: A Geographic Context Multimodal Deep Learning Framework for Geospatial Hazard Risk Prediction” — abstract accepted at SICE 2026; full manuscript under review.</li>
            <li>Designed the transformer-based Geographic Context Module (SwinV2 + CNN fusion) over a curated 60+ city dataset of GIS and visual features; R² 0.954 on held-out cities vs 0.627 image-only, outperforming 7 fusion and attention baselines.</li>
          </ul>
        </section>

        <section className="resume-section">
          <h2>Leadership</h2>
          <div className="resume-entry">
            <div className="resume-entry-head">
              <span className="resume-entry-title">ASTRA (defence-tech student club), BMSIT&amp;M — President</span>
              <span className="resume-entry-when">Sep 2026 – Present</span>
            </div>
            <p className="resume-entry-sub">Technical Head · Sep 2025 – Sep 2026</p>
            <ul className="resume-bullets">
              <li>Led a 30-member team through 6 research manuscript submissions (3 abstracts accepted at SICE 2026, incl. my first-author work); ran Git and AI tooling sessions.</li>
            </ul>
          </div>
        </section>

        <section className="resume-section">
          <h2>Open Source</h2>
          <ul className="resume-bullets">
            <li>Three merged pull requests across established scientific Python projects: decoder training-log fix (nilearn #6614), HBR tutorial docs (PCNtoolkit #551), I/O-guide docs (movement #1115).</li>
          </ul>
        </section>

        <section className="resume-section">
          <h2>Skills</h2>
          <ul className="resume-bullets resume-skills">
            <li><strong>Agentic &amp; LLM:</strong> LangChain, LangGraph, MCP (FastMCP), RAG, FAISS, BM25, embeddings, RAGAS, Gemini API, Ollama, tool calling</li>
            <li><strong>ML &amp; Deep Learning:</strong> PyTorch, Scikit-learn, XGBoost, LightGBM, ensemble methods, computer vision</li>
            <li><strong>Backend &amp; Data:</strong> Python, FastAPI, Flask, REST APIs, Docker, SQL, Pandas/NumPy, Git/GitHub, CI/CD</li>
            <li><strong>Tooling:</strong> Claude Code (AI-assisted development), Vercel, Streamlit, pytest</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
