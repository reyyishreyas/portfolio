export default function Certifications() {
  const completed = [
    {
      title: 'Machine Learning Internship',
      issuer: 'Launched Global',
      date: 'December 2025',
      status: 'Completed',
      linkedin: 'https://www.linkedin.com/posts/reyyi-shreyas_machinelearning-artificialintelligence-datascience-activity-7434916607530934272-r7pL',
      id: 'cert-ml-intern'
    },
    {
      title: 'Freedom With AI Course',
      issuer: 'Freedom With AI',
      date: 'Completed',
      status: 'Completed',
      linkedin: 'https://www.linkedin.com/posts/reyyi-shreyas_ai-freedomwithai-continuouslearning-activity-7434263166236422146-KMvG',
      id: 'cert-freedom-ai'
    }
  ];

  const pursuing = [
    {
      title: 'AWS Certification Course',
      issuer: 'Amazon Web Services',
      date: 'In Progress',
      status: 'In Progress',
      id: 'cert-aws'
    }
  ];

  return (
    <section id="certifications" aria-labelledby="title-certifications">
      <div className="section-header">
        <span className="section-label">Certifications</span>
        <h2 id="title-certifications" className="section-title">Credentials</h2>
      </div>

      <div className="certs-layout">
        <div className="cert-group">
          <div className="cert-group-title">Completed</div>
          {completed.map((cert) => (
            <div key={cert.id} id={cert.id} className="cert-card">
              <div className="cert-card-title">{cert.title}</div>
              <div className="cert-card-meta">{cert.issuer} · {cert.date}</div>
              <div className="cert-card-status">{cert.status}</div>
              <a
                href={cert.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="cert-linkedin-btn"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                View on LinkedIn
              </a>
            </div>
          ))}
        </div>

        <div className="cert-group">
          <div className="cert-group-title">Currently Pursuing</div>
          {pursuing.map((cert) => (
            <div key={cert.id} id={cert.id} className="cert-card in-progress">
              <div className="cert-card-title">{cert.title}</div>
              <div className="cert-card-meta">{cert.issuer} · {cert.date}</div>
              <div className="cert-card-status">{cert.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
