import type { Profile } from '@/content';
import styles from './Rail.module.css';

type Props = {
  profile: Profile;
  year: number;
};

/** The site's navigation rail: menu toggle, running titles and scroll progress. */
export function Rail({ profile, year }: Props) {
  return (
    <header className={styles.rail} data-rail>
      <span className={styles.progress} data-progress aria-hidden="true" />
      <span className={styles.tip} data-progress-tip aria-hidden="true" />
      <a className={styles.logo} href="#top" data-goto="top" aria-label={`${profile.name}, back to the start`}>
        {profile.monogram}
      </a>
      <button className={styles.menuButton} type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu" data-menu-btn>
        <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
          <rect y="15" width="32" height="1.5" fill="currentColor" />
          <rect data-bar="lower" x="0" y="22" width="32" height="1.5" fill="currentColor" />
          <rect data-bar="upper" x="0" y="8" width="32" height="1.5" fill="currentColor" />
        </svg>
      </button>
      <div className={styles.meta}>
        <p className={styles.edition}>{profile.edition}</p>
        <a className={styles.name} href="#top" data-goto="top">{profile.name}°</a>
        <p className={styles.year}>© {year}</p>
      </div>
    </header>
  );
}
