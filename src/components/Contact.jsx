import { Mail } from 'lucide-react';
import { StaggerGrid, RevealItem } from './Reveal';

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="title-contact">
      <div className="section-header">
        <span className="section-label">Contact</span>
        <h2 id="title-contact" className="section-title">Let's Build Intelligent Systems</h2>
      </div>

      <StaggerGrid className="contact-grid">
        <RevealItem>
        <a href="mailto:reyyishreyas@gmail.com" className="contact-card" id="contact-email">
          <div className="contact-icon">
            <Mail size={18} strokeWidth={1.5} />
          </div>
          <div className="contact-content">
            <span className="contact-label">Email</span>
            <span className="contact-value">reyyishreyas@gmail.com</span>
          </div>
        </a>
        </RevealItem>

        <RevealItem>
        <a href="https://www.linkedin.com/in/reyyi-shreyas/" target="_blank" rel="noopener noreferrer" className="contact-card" id="contact-linkedin">
          <div className="contact-icon">
            <LinkedInIcon />
          </div>
          <div className="contact-content">
            <span className="contact-label">LinkedIn</span>
            <span className="contact-value">Reyyi Shreyas</span>
          </div>
        </a>
        </RevealItem>

        <RevealItem>
        <a href="https://github.com/reyyishreyas" target="_blank" rel="noopener noreferrer" className="contact-card" id="contact-github">
          <div className="contact-icon">
            <GitHubIcon />
          </div>
          <div className="contact-content">
            <span className="contact-label">GitHub</span>
            <span className="contact-value">@reyyishreyas</span>
          </div>
        </a>
        </RevealItem>
      </StaggerGrid>
    </section>
  );
}
