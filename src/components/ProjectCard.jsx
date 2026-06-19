import { useMemo, useEffect, useState } from 'react';
import { marked } from 'marked';
import { X, ArrowRight } from 'lucide-react';

export default function ProjectCard({ filepath, name, summary, impact, tags, sysId, githubUrl, problemStatement, built, techniques }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(filepath)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load architecture document: ${res.statusText}`);
        }
        return res.text();
      })
      .then((text) => {
        if (active) {
          const parsed = marked.parse(text);
          setHtmlContent(parsed);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [filepath]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  const cardInner = useMemo(() => (
    <article className="case-study-card" id={sysId}>
      <div className="case-study-header">
        {impact && (
          <span className="case-study-impact-tag">{impact}</span>
        )}
        <h4 className="case-study-title">{name}</h4>

        {problemStatement && (
          <div className="case-study-section">
            <span className="case-study-section-label">Problem</span>
            <p className="case-study-text">{problemStatement}</p>
          </div>
        )}

        <p className="case-study-summary">{summary}</p>

        {built && (
          <div className="case-study-section">
            <span className="case-study-section-label">Built</span>
            <p className="case-study-text">{built}</p>
          </div>
        )}

        {techniques && (
          <div className="case-study-section">
            <span className="case-study-section-label">ML Techniques</span>
            <p className="case-study-text">{techniques}</p>
          </div>
        )}
      </div>

      <div className="case-study-footer">
        <div className="case-study-tags">
          {tags.map((tag) => (
            <span key={tag} className="case-study-tag">{tag}</span>
          ))}
        </div>

        <div className="case-study-actions">
          <button
            type="button"
            className="case-study-link"
            onClick={() => setIsModalOpen(true)}
            style={{ background: 'none', border: 'none', textAlign: 'left', padding: 0 }}
          >
            View Architecture <span><ArrowRight size={14} style={{ display: 'inline-block', verticalAlign: 'middle' }} /></span>
          </button>

          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="case-study-github-btn"
              title="View on GitHub"
            >
              <svg
                viewBox="0 0 24 24"
                width="13"
                height="13"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              GitHub
            </a>
          )}
        </div>
      </div>
    </article>
  ), [sysId, impact, name, problemStatement, summary, built, techniques, tags, githubUrl]);

  return (
    <>
      {cardInner}

      <div
        className={`modal-overlay ${isModalOpen ? 'open' : ''}`}
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="modal-drawer"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title-group">
              <h4 className="modal-title">{name}</h4>
              <span className="modal-subtitle">Technical Architecture</span>
            </div>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close details"
            >
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            {loading && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                Fetching architecture logs...
              </div>
            )}

            {error && (
              <div style={{ color: '#ef4444', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                Failed to load details: {error}
              </div>
            )}

            {!loading && !error && (
              <div
                className="markdown-container"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
