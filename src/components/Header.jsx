export default function Header() {
  const handleCommand = (action) => {
    switch (action) {
      case 'projects':
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'resume':
        window.open('/assets/images/REYYICV.pdf', '_blank');
        break;
      case 'github':
        window.open('https://github.com/reyyishreyas', '_blank');
        break;
      case 'linkedin':
        window.open('https://www.linkedin.com/in/reyyi-shreyas/', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <header className="hero-section">
      <div className="hero-left">
        <h1 className="hero-title">Reyyi Shreyas</h1>

        <div className="hero-subtitles">
          <span className="hero-subtitle-badge">AI/ML Engineer</span>
          <span className="hero-subtitle-badge">Autonomous Systems</span>
          <span className="hero-subtitle-badge">Deep Learning</span>
        </div>

        <p className="hero-description">
          Artificial Intelligence and Machine Learning undergraduate focused on building real-world ML systems, autonomous applications, and intelligent technology solutions.
        </p>

        <div className="hero-buttons">
          <button
            onClick={() => handleCommand('projects')}
            className="btn-primary"
          >
            View Projects
          </button>

          <button
            onClick={() => handleCommand('resume')}
            className="btn-secondary"
          >
            Resume
          </button>

          <button
            onClick={() => handleCommand('github')}
            className="btn-secondary"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            GitHub
          </button>

          <button
            onClick={() => handleCommand('linkedin')}
            className="btn-secondary"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            LinkedIn
          </button>
        </div>
      </div>

      <div className="hero-right">
        <div className="hero-image-wrapper">
          <div className="hero-image-container">
             <img
              id="img-shreyas-profile"
              src="/assets/images/shreyas_profile.jpg"
              alt="Reyyi Shreyas Portrait"
            />
          </div>
          <div className="hero-image-glow" />
        </div>

        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="hero-metric-value">9.08</span>
            <span className="hero-metric-label">CGPA</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-value">ML</span>
            <span className="hero-metric-label">Intern</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-value">ASTRA</span>
            <span className="hero-metric-label">Tech Head</span>
          </div>
          <div className="hero-metric">
            <span className="hero-metric-value">4+</span>
            <span className="hero-metric-label">AI Systems</span>
          </div>
        </div>
      </div>
    </header>
  );
}
