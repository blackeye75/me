import type { AboutPage, Profile } from '@/content';
import { Portrait } from '../portrait/Portrait';
import { Panel, tones } from '../story/Story';
import styles from './AboutIntro.module.css';

/** About, first panel: the portrait on the left, the name and a short introduction on the right. */
export function AboutIntro({ page, profile }: { page: AboutPage; profile: Profile }) {
  return (
    <Panel id="top" className={styles.intro} tone={tones.paper} bleed="desktop" aria-labelledby="about-name">
      <figure className={styles.photo} data-image-reveal data-enter-image>
        <span className={styles.overlay} data-ir-overlay />
        <span className={styles.media} data-ir-media>
          <Portrait logo={profile.logo} alt={page.portraitAlt} sizes="(min-width: 768px) 44vw, 90vw" />
        </span>
      </figure>
      <h1 className={styles.name} id="about-name">
        {profile.heroLines.map((line) => (
          <span key={line} className="mask"><span className={styles.line} data-enter-line>{line}</span></span>
        ))}
      </h1>
      <div className={styles.copy}>
        <p className="label" data-enter>{page.label}</p>
        <p className={styles.text} data-enter>{page.intro}</p>
      </div>
    </Panel>
  );
}
