import { Trophy, Award } from 'lucide-react';
import { StaggerGrid, RevealItem } from './Reveal';

export default function Achievements() {
  const achievements = [
    {
      badge: 'NDA-156',
      title: 'NDA-156 (2026)',
      subtitle: 'SSB Recommendation',
      rank: 'AIR 348',
      linkedin: 'https://www.linkedin.com/posts/reyyi-shreyas_ssb-ssbinterview-nda-activity-7450462832317595648-g290',
      icon: Award,
      id: 'achievement-nda156'
    },
    {
      badge: 'TES-53',
      title: 'TES-53 (2025)',
      subtitle: 'SSB Recommendation',
      rank: 'AIR 24',
      linkedin: 'https://www.linkedin.com/posts/reyyi-shreyas_tes53-ssbrecommendation-indianarmy-activity-7436946440561602560-58ud',
      icon: Trophy,
      id: 'achievement-tes53'
    },
    {
      badge: 'TES-52',
      title: 'TES-52 (2024)',
      subtitle: 'SSB Recommendation',
      rank: 'AIR 101',
      linkedin: 'https://www.linkedin.com/posts/reyyi-shreyas_ssbjourney-tes52-32ssbjalandar-activity-7433786367022809090-kTEr',
      icon: Trophy,
      id: 'achievement-tes52'
    },
    {
      badge: 'ML EXPO',
      title: 'Launched Global ML Expo',
      subtitle: '1st Place',
      rank: 'SalaryPredict AI',
      linkedin: 'https://www.linkedin.com/posts/reyyi-shreyas_machinelearning-launchedglobal-datascience-activity-7445522966446088193-c98c',
      icon: Trophy,
      id: 'achievement-ml-expo'
    }
  ];

  const LinkedInIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  );

  return (
    <section id="achievements" aria-labelledby="title-achievements">
      <div className="section-header">
        <span className="section-label">Achievements</span>
        <h2 id="title-achievements" className="section-title">Recognition & Awards</h2>
      </div>

      <StaggerGrid className="achievements-grid">
        {achievements.map((item) => (
          <RevealItem key={item.id}>
          <div id={item.id} className="achievement-card">
            <div className="achievement-badge">{item.badge}</div>
            <div className="achievement-title">{item.title}</div>
            <div className="achievement-subtitle">{item.subtitle}</div>
            <div className="achievement-rank">{item.rank}</div>
            <a
              href={item.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="achievement-linkedin-btn"
            >
              <LinkedInIcon />
              View Achievement Post
            </a>
          </div>
          </RevealItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
