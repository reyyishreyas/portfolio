import { useEffect, useMemo, useRef } from 'react';
import { journeyState } from '../three/journey';
import { detectForestQuality, smoothstep } from '../three/utils';

/**
 * The portfolio's information, re-presented as discoveries along the
 * journey: each plate fades into view when the walk reaches its beat
 * and washes away as the visitor moves on. Rendered imperatively from
 * journey progress so scrolling never re-renders React. With reduced
 * motion or no WebGL the same content falls back to a static,
 * readable document.
 *
 * @returns {JSX.Element}
 */

// scroll windows are fractions of journey progress; sides follow what
// the 3D scene shows (e.g. the chessboard stands right of the path, so
// its plate sits left)
const PLATES = [
  { id: 'chessmind', from: 0.522, to: 0.578, side: 'left' },
  { id: 'projects', from: 0.581, to: 0.628, side: 'right' },
  { id: 'research', from: 0.642, to: 0.698, side: 'left' },
  { id: 'astra', from: 0.712, to: 0.757, side: 'left' },
  { id: 'astra-work', from: 0.76, to: 0.816, side: 'left' },
  { id: 'about', from: 0.824, to: 0.853, side: 'right' },
  { id: 'experience', from: 0.855, to: 0.879, side: 'left' },
  { id: 'skills', from: 0.881, to: 0.899, side: 'right' },
  { id: 'opensource', from: 0.903, to: 0.928, side: 'left' },
  { id: 'recognition', from: 0.93, to: 0.952, side: 'right' },
  { id: 'contact', from: 0.955, to: 1.01, side: 'center' },
];

const FACETS = [
  ['Student', 'B.E. AIML 2028 · BMSIT&M · CGPA 9.15/10'],
  ['Builder', 'Production ML systems, autonomous simulations, explainable AI'],
  ['Researcher', 'First-author paper accepted at SICE 2026'],
  ['Leader', 'ASTRA President · 30-member team'],
  ['Open source', 'Merged pull requests in nilearn, PCNtoolkit and movement'],
];

const SKILL_GROUPS = [
  ['Agentic & LLM', 'LangChain, LangGraph, RAG, FAISS, BM25, RAGAS, Gemini API, Ollama, MCP'],
  ['ML & Deep Learning', 'PyTorch, Scikit-learn, XGBoost, LightGBM, Ensemble Methods, Computer Vision'],
  ['Backend & Data', 'Python, FastAPI, Flask, Docker, SQL, Pandas, NumPy, Git/GitHub, CI/CD'],
  ['Tooling', 'Claude Code, Streamlit, Vercel, pytest'],
];

const ACHIEVEMENTS = [
  {
    badge: 'NDA-156',
    title: 'NDA-156 (2026)',
    sub: 'SSB Recommendation · AIR 348',
    href: 'https://www.linkedin.com/posts/reyyi-shreyas_ssb-ssbinterview-nda-activity-7450462832317595648-g290',
  },
  {
    badge: 'TES-53',
    title: 'TES-53 (2025)',
    sub: 'SSB Recommendation · AIR 24',
    href: 'https://www.linkedin.com/posts/reyyi-shreyas_tes53-ssbrecommendation-indianarmy-activity-7436946440561602560-58ud',
  },
  {
    badge: 'TES-52',
    title: 'TES-52 (2024)',
    sub: 'SSB Recommendation · AIR 101',
    href: 'https://www.linkedin.com/posts/reyyi-shreyas_ssbjourney-tes52-32ssbjalandar-activity-7433786367022809090-kTEr',
  },
  {
    badge: 'ML EXPO',
    title: 'Launched Global ML Expo',
    sub: '1st Place · SalaryPredict AI',
    href: 'https://www.linkedin.com/posts/reyyi-shreyas_machinelearning-launchedglobal-datascience-activity-7445522966446088193-c98c',
  },
];

/**
 * One plate's body. Pure markup: the wrapper handles motion.
 *
 * @param {string} id which plate to render
 * @returns {JSX.Element}
 */
function PlateBody({ id }) {
  if (id === 'chessmind') {
    return (
      <>
        <p className="story-kicker">Project · the machine behind the board</p>
        <h2 className="story-title">ChessMind AI</h2>
        <p className="story-sub">
          Adaptive chess intelligence powered by supervised ML and dynamic Elo
          adjustment — with every suggested move explained by a local LLM.
        </p>
        <div className="story-stats">
          <span><b>0.959</b>Held-out R²</span>
          <span><b>0.76</b>MAE (Elo)</span>
          <span><b>~160 ms</b>Per move · FastAPI</span>
          <span><b>7.6 → 1.7 s</b>First feedback</span>
        </div>
        <ul className="story-facts">
          <li>50,028 move samples, split at game level</li>
          <li>8-model stacking ensemble estimating opponent strength</li>
          <li>
            Stockfish-validated suggestions explained by a local Ollama LLM; CI
            runs lint, typecheck and 63 tests
          </li>
        </ul>
        <p className="story-tags">
          Supervised ML · Self-hosted LLM · FastAPI · Stockfish-validated
        </p>
        <a
          className="story-link"
          href="https://github.com/reyyishreyas/ChessMind_AI"
          target="_blank"
          rel="noreferrer"
        >
          GitHub repository ↗
        </a>
      </>
    );
  }

  if (id === 'projects') {
    const items = [
      {
        name: 'AI-Based Aerial Trajectory Prediction & Autonomous Simulation System',
        chip: 'Flagship Project',
        desc: 'Deep learning system built to predict aerial trajectories and run autonomous simulation visualizations.',
        problem:
          'Predicting aerial flight paths for autonomous systems requires handling complex temporal sequences accurately.',
        built: 'Built a deep recurrent neural network pipeline with synthetic data generation, MinMax scaling, and interactive 2D/3D trajectory visualization comparing predictions against ground truth.',
        tech: 'LSTM, GRU, sequence-to-sequence modeling, early stopping, dropout regularization, MinMax scaling, multi-step window sequencing',
        tags: 'PyTorch · LSTM · GRU · Deep Learning · Python',
        href: 'https://github.com/reyyishreyas/Astra-chronus-ai-',
      },
      {
        name: 'Research Paper Analyst',
        chip: 'Agentic RAG',
        desc: 'Agentic RAG system that answers questions across a paper corpus with cited sources, plus a RAGAS evaluation harness.',
        problem:
          'Answering questions across a corpus of research papers requires responses grounded in the sources and verifiable — not fluent summaries that invent citations.',
        built: 'Agentic RAG pipeline (LangChain + LangGraph + Gemini) with planner → retriever → verifier stages over five papers, hybrid BM25 + FAISS retrieval with reciprocal rank fusion for source-cited answers. RAGAS evaluation harness on a fixed 30-question set (faithfulness, context precision, context recall) with dense and hybrid retrieval configs, a 15-test pytest suite and a Dockerfile.',
        tech: 'Agentic RAG, hybrid retrieval (BM25 + FAISS), reciprocal rank fusion, RAGAS evaluation, planner-verifier stages, pytest, Docker',
        tags: 'Python · LangChain · LangGraph · RAGAS · Streamlit',
        href: 'https://github.com/reyyishreyas/research-agent-rag',
        live: 'https://research-agent-rag.streamlit.app',
      },
      {
        name: 'TRICP',
        chip: 'ROC AUC 0.827 · 7,043 customers',
        desc: 'Customer retention & churn analytics platform with retention-email automation and intervention simulation.',
        problem:
          'Retention teams need to know which customers are about to churn and which intervention will bring them back — not just a churn score.',
        built: 'FastAPI backend with interactive OpenAPI docs and a React/Vite frontend deployed on Vercel, retention-email automation, bulk campaigns and intervention simulation over a stacking ensemble (7,043 customers; ROC AUC 0.827). Built end-to-end with AI pair-programming (Claude Code).',
        tech: 'Stacking ensembles, ROC AUC evaluation, FastAPI with OpenAPI docs, React/Vite, Vercel deployment, retention automation, intervention simulation',
        tags: 'Python · FastAPI · React · Vercel · Ensembles',
        href: 'https://github.com/reyyishreyas/churn_predictor',
        live: 'https://churn-predictor-kappa.vercel.app',
      },
      {
        name: 'SalaryPredict AI',
        chip: 'MAE ₹41,512 → ₹5,791 · 1st Place',
        desc: 'End-to-end salary prediction system benchmarked across five regression approaches and deployed with a Flask app.',
        problem:
          'Building a reliable compensation estimation system that compares multiple regression approaches on the program’s salary dataset.',
        built: 'Delivered on the program’s ~19.5k-row, 29-feature salary dataset: benchmarked five regression approaches and shipped a stacking ensemble that cut MAE from ₹41,512 (linear regression) to ₹5,791, plus a Flask app with bulk prediction, dashboards and a fairness audit by location, department and education.',
        tech: 'Regression benchmarking, stacking ensembles, MAE/R² evaluation, fairness auditing, bulk prediction, Flask deployment',
        tags: 'Python · Scikit-learn · XGBoost · Flask · Stacking',
        href: 'https://github.com/reyyishreyas/Salary_Predict_AI',
      },
      {
        name: 'Smart Fixture',
        chip: 'Backend Systems',
        desc: 'Tournament management backend system with automated fixture generation, scheduling logic, database management and secure match-code verification.',
        problem:
          'Managing tournament fixtures manually is error-prone and time-consuming, especially for large-scale events.',
        built: 'Designed a comprehensive backend system with automated fixture generation algorithms, intelligent scheduling logic, robust database architecture for match data, and secure match-code verification flow for authentication.',
        tech: 'Scheduling algorithms, database architecture, REST API design, secure authentication flow, backend system design',
        tags: 'Python · MySQL · Flask · Scheduling Algorithms · API Design',
        href: 'https://github.com/reyyishreyas/smart_fixture',
      },
    ];
    return (
      <>
        <p className="story-kicker">Projects · featured AI systems</p>
        <h2 className="story-title">Built end to end</h2>
        <p className="story-sub">
          Machine learning systems, autonomous applications, and intelligent
          technology solutions built for real-world impact.
          <span className="story-chip-inline">4+ AI Systems</span>
        </p>
        <ul className="story-items">
          {items.map((it) => (
            <li key={it.name}>
              <div className="story-item-head">
                <b>{it.name}</b>
                <em>{it.chip}</em>
              </div>
              <p>{it.desc}</p>
              <p className="story-item-problem" data-label="Problem">{it.problem}</p>
              <p className="story-item-built" data-label="Built">{it.built}</p>
              <p className="story-item-tags">{it.tags}</p>
              <p className="story-item-tech" data-label="Technologies">{it.tech}</p>
              <p className="story-item-links">
                <a href={it.href} target="_blank" rel="noreferrer">
                  GitHub ↗
                </a>
                {it.live && (
                  <a href={it.live} target="_blank" rel="noreferrer">
                    Live ↗
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      </>
    );
  }

  if (id === 'research') {
    return (
      <>
        <p className="story-kicker">Research · first author</p>
        <h2 className="story-title">GCM-HAIRNet</h2>
        <p className="story-paper">
          GCM-HAIRNet: A Geographic Context Multimodal Deep Learning Framework
          for Geospatial Hazard Risk Prediction
        </p>
        <p className="story-tags">
          First author · SICE 2026 · Abstract accepted · Manuscript under review
        </p>
        <p className="story-sub">
          Multimodal deep learning for geospatial hazard risk prediction — from
          a curated city-scale dataset to a transformer fusion module, evaluated
          against fusion and attention baselines.
        </p>
        <ul className="story-facts">
          <li>Geographic Context Module — transformer-based SwinV2 + CNN fusion</li>
          <li>60+ curated cities — GIS and visual features</li>
          <li>Outperformed 7 fusion and attention baselines</li>
        </ul>
        <div className="story-bars" aria-label="R squared, held-out cities">
          <p className="story-bars-caption">R² — held-out cities</p>
          <div className="story-bar">
            <span className="story-bar-label">GCM-HAIRNet</span>
            <span className="story-bar-track">
              <span className="story-bar-fill" style={{ width: '95.4%' }} />
            </span>
            <span className="story-bar-value">0.954</span>
          </div>
          <div className="story-bar">
            <span className="story-bar-label">Image-only baseline</span>
            <span className="story-bar-track">
              <span className="story-bar-fill is-dim" style={{ width: '62.7%' }} />
            </span>
            <span className="story-bar-value">0.627</span>
          </div>
        </div>
      </>
    );
  }

  if (id === 'astra') {
    return (
      <>
        <p className="story-kicker">Leadership · defence technology</p>
        <h2 className="story-title">ASTRA</h2>
        <p className="story-sub">
          Armed Squad for Tactical Readiness &amp; Awareness — the
          defence-technology student club at BMSIT&amp;M.
        </p>
        <div className="story-roles">
          <span><b>President</b>Sep 2026 – Present</span>
          <span><b>Technical Head</b>Sep 2025 – Sep 2026</span>
        </div>
        <div className="story-stats story-stats--three">
          <span><b>30</b>Member team</span>
          <span><b>6</b>Manuscript submissions</span>
          <span><b>3</b>Accepted at SICE 2026</span>
        </div>
        <p className="story-tags">
          Technical Planning · System Design · Research Mentoring · Team Coordination
        </p>
      </>
    );
  }

  if (id === 'astra-work') {
    return (
      <>
        <p className="story-kicker">ASTRA · what I do there</p>
        <ul className="story-list">
          <li>
            Led a 30-member team through 6 research manuscript submissions — 3
            accepted at SICE 2026, including my first-author paper.
          </li>
          <li>
            Leading technical initiatives and architecture decisions for the
            ASTRA defence technology club.
          </li>
          <li>
            Driving project ideation, technical planning, and implementation
            across autonomous systems and defence tech.
          </li>
          <li>
            Conducting technical sessions on Git/GitHub workflows, development
            practices, and ML tooling.
          </li>
          <li>
            Supporting ASTRA Defence Tech Expo activities, platform architecture,
            and technical execution.
          </li>
        </ul>
        <a
          className="story-link"
          href="https://github.com/sharathkudachi/astra-defence-tech-expo"
          target="_blank"
          rel="noreferrer"
        >
          View Repository ↗
        </a>
      </>
    );
  }

  if (id === 'about') {
    return (
      <>
        <p className="story-kicker">Profile</p>
        <h2 className="story-title">About</h2>
        <p className="story-sub">
          AI/ML Engineer building intelligent systems, ML applications, and
          autonomous technology solutions.
        </p>
        <p className="story-body">
          Artificial Intelligence and Machine Learning undergraduate with
          hands-on experience in building production ML systems, autonomous
          simulations, and explainable AI platforms. I specialize in deep
          learning architectures, ensemble methods, and deploying intelligent
          applications that solve real problems.
        </p>
        <blockquote className="story-quote">
          Technology is something I build, not my entire identity.
        </blockquote>
        <div className="story-facets">
          {FACETS.map(([role, fact]) => (
            <span key={role}>
              <b>{role}</b>
              {fact}
            </span>
          ))}
        </div>
        <p className="story-tags">
          Machine Learning Engineering · Autonomous Systems · Applied AI
        </p>
      </>
    );
  }

  if (id === 'experience') {
    return (
      <>
        <p className="story-kicker">Experience</p>
        <h2 className="story-title">Machine Learning Intern</h2>
        <p className="story-sub">Launched Global · August 2025 - December 2025</p>
        <ul className="story-list">
          <li>
            Delivered SalaryPredict AI end-to-end on the program&rsquo;s
            ~19.5k-row salary dataset: benchmarked five regression approaches
            and shipped a stacking ensemble that cut MAE from ₹41,512 (linear
            regression) to ₹5,791.
          </li>
          <li>
            Built the Flask app with bulk prediction, dashboards and a fairness
            audit by location, department and education.
          </li>
          <li>1st Place — Launched Global ML Expo (SalaryPredict AI).</li>
        </ul>
        <p className="story-tags">
          ML Workflow · Preprocessing · Feature Engineering · Model Development
        </p>
        <a
          className="story-link"
          href="https://www.linkedin.com/posts/reyyi-shreyas_machinelearning-artificialintelligence-datascience-share-7434916606188875776-gUc9/"
          target="_blank"
          rel="noreferrer"
        >
          View Internship Completion Post ↗
        </a>
      </>
    );
  }

  if (id === 'skills') {
    return (
      <>
        <p className="story-kicker">Technical skills</p>
        <h2 className="story-title">Skills &amp; Technologies</h2>
        <div className="story-skills">
          {SKILL_GROUPS.map(([group, list]) => (
            <div key={group}>
              <b>{group}</b>
              <p>{list}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (id === 'opensource') {
    return (
      <>
        <p className="story-kicker">Open source</p>
        <h2 className="story-title">Contributions</h2>
        <p className="story-sub">
          Merged pull requests across established scientific Python and tooling
          projects, with more in review upstream.
        </p>
        <div className="story-stats story-stats--three">
          <span><b>8</b>Merged PRs</span>
          <span><b>11</b>Open · in review</span>
          <span><b>4+</b>Upstream projects</span>
        </div>
        <ul className="story-os">
          <li>
            <span>nilearn · #6614</span>
            <a href="https://github.com/nilearn/nilearn/pull/6614" target="_blank" rel="noreferrer">
              Decoder training-log fix ↗
            </a>
          </li>
          <li>
            <span>PCNtoolkit · #551</span>
            <a
              href="https://github.com/predictive-clinical-neuroscience/PCNtoolkit/pull/551"
              target="_blank"
              rel="noreferrer"
            >
              HBR tutorial docs ↗
            </a>
          </li>
          <li>
            <span>movement · #1115</span>
            <a
              href="https://github.com/neuroinformatics-unit/movement/pull/1115"
              target="_blank"
              rel="noreferrer"
            >
              I/O guide docs ↗
            </a>
          </li>
        </ul>
        <p className="story-note">
          Five more merged pull requests across mcp-mifosx and nilearn.
        </p>
        <a
          className="story-link"
          href="https://github.com/reyyishreyas"
          target="_blank"
          rel="noreferrer"
        >
          github.com/reyyishreyas ↗
        </a>
      </>
    );
  }

  if (id === 'recognition') {
    const certs = [
      {
        title: 'Machine Learning Internship',
        meta: 'Launched Global · December 2025 · Completed',
        href: 'https://www.linkedin.com/posts/reyyi-shreyas_machinelearning-artificialintelligence-datascience-activity-7434916607530934272-r7pL',
      },
      {
        title: 'Freedom With AI Course',
        meta: 'Freedom With AI · Completed',
        href: 'https://www.linkedin.com/posts/reyyi-shreyas_ai-freedomwithai-continuouslearning-activity-7434263166236422146-KMvG',
      },
      { title: 'AWS Certification Course', meta: 'Amazon Web Services · In Progress', href: null },
    ];
    return (
      <>
        <p className="story-kicker">Achievements · credentials</p>
        <h2 className="story-title">Recognition &amp; Awards</h2>
        <ul className="story-awards">
          {ACHIEVEMENTS.map((a) => (
            <li key={a.badge}>
              <span className="story-award-badge">{a.badge}</span>
              <span>
                <b>{a.title}</b>
                {a.sub}
              </span>
              <a href={a.href} target="_blank" rel="noreferrer">
                View Achievement Post ↗
              </a>
            </li>
          ))}
        </ul>
        <div className="story-certs">
          {certs.map((c) => (
            <span key={c.title}>
              <b>{c.title}</b>
              {c.href ? (
                <a href={c.href} target="_blank" rel="noreferrer">
                  {c.meta} ↗
                </a>
              ) : (
                <em>{c.meta}</em>
              )}
            </span>
          ))}
        </div>
      </>
    );
  }

  // contact / ending
  return (
    <>
      <p className="story-kicker">The ending · say hello</p>
      <p className="story-name">Reyyi Shreyas</p>
      <p className="story-badges">
        AI/ML Engineer · Autonomous Systems · Deep Learning
      </p>
      <h2 className="story-title">Let&rsquo;s Build Intelligent Systems</h2>
      <p className="story-sub">
        Artificial Intelligence and Machine Learning undergraduate focused on
        building real-world ML systems, autonomous applications, and
        intelligent technology solutions.
      </p>
      <div className="story-actions">
        <a href="mailto:reyyishreyas@gmail.com">Email</a>
        <a href="https://www.linkedin.com/in/reyyi-shreyas/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="https://github.com/reyyishreyas" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="/assets/images/REYYICV.pdf" target="_blank" rel="noreferrer">
          Resume
        </a>
      </div>
    </>
  );
}

export default function StoryPlates() {
  const refs = useRef({});
  const isStatic = useMemo(
    () => detectForestQuality().mode === 'fallback',
    [],
  );

  useEffect(() => {
    if (isStatic) return undefined;
    let raf = 0;
    const last = {};
    const tick = () => {
      const p = journeyState.progress;
      // let the plates wash out once the stage unpins at the very end,
      // so they never sit on top of the footer
      const sec = document.querySelector('.forest-opening');
      let exit = 1;
      if (sec) {
        const maxY = sec.offsetTop + sec.offsetHeight - window.innerHeight;
        exit = 1 - Math.min(1, Math.max(0, (window.scrollY - maxY) / 260));
      }
      PLATES.forEach((plate) => {
        const el = refs.current[plate.id];
        if (!el) return;
        const v =
          smoothstep(plate.from, plate.from + 0.01, p) *
          (1 - smoothstep(plate.to - 0.012, plate.to + 0.004, p)) *
          exit;
        if (v === last[plate.id]) return;
        last[plate.id] = v;
        el.style.opacity = String(v);
        el.style.transform = `translateY(${(1 - v) * 18}px)`;
        el.style.visibility = v > 0.02 ? 'visible' : 'hidden';
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isStatic]);

  if (isStatic) {
    // reduced motion / no WebGL: the same content as a plain document
    return (
      <div className="story-static" id="journey-end">
        {PLATES.map((plate) => (
          <section
            key={plate.id}
            id={`story-${plate.id}`}
            className="story-plate is-static"
          >
            <div className="story-inner">
              <PlateBody id={plate.id} />
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <>
      {PLATES.map((plate) => (
        <section
          key={plate.id}
          id={`story-${plate.id}`}
          ref={(el) => {
            refs.current[plate.id] = el;
          }}
          className={`story-plate story-plate--${plate.side}`}
        >
          <div className="story-inner">
            <PlateBody id={plate.id} />
          </div>
        </section>
      ))}
    </>
  );
}
