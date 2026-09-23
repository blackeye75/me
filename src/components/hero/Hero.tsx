import type { Intro, Profile } from '@/content';
import { Panel, tones } from '../story/Story';
import styles from './Hero.module.css';

type Props = {
  profile: Profile;
  intro: Intro;
};

/** Opening panel. Its pieces are hidden by the intro and revealed in sequence by the motion layer. */
export function Hero({ profile, intro }: Props) {
  const years = Array.from({ length: intro.toYear - intro.fromYear + 1 }, (_, i) => intro.fromYear + i);

  return (
    <Panel id="top" className={styles.hero} tone={tones.hero} bleed aria-label="Introduction">
      <div className={styles.base} data-hero-base aria-hidden="true" />
      <div className={styles.glow} data-hero-glow aria-hidden="true" />
      <div className={styles.year} aria-hidden="true">
        <div className={styles.yearRow} data-year-row>
          <div data-years>
            {years.map((year, i) => (
              <span key={year} className={styles.yearCell} data-year-first={i === 0 ? '' : undefined}>{year}</span>
            ))}
          </div>
        </div>
      </div>
      <h1 className={styles.name} data-hero-name>
        {profile.heroLines.map((line) => (
          <span key={line} className={styles.nameLine}>
            <span className={styles.word} data-name-word>{line}</span>
          </span>
        ))}
      </h1>
      <p className={styles.tagline} data-hero-tagline>{profile.tagline}</p>
      <p className={styles.journey} data-hero-journey aria-hidden="true">{intro.journey}</p>
      <p className={`${styles.meta} ${styles.loc}`} data-hero-meta>
        {profile.location.label}<br />({profile.location.offsetLabel}) <span className="mono" data-clock>--:--</span>
      </p>
      <p className={`${styles.meta} ${styles.open}`} data-hero-meta>
        {splitInTwo(profile.availability)}
      </p>
      <p className={styles.scroll} data-hero-meta>{intro.scrollHint}</p>
    </Panel>
  );
}

/** "Open for collaborations" → "Open for" / "collaborations", as in the design. */
function splitInTwo(text: string) {
  const i = text.lastIndexOf(' ');
  if (i < 0) return text;
  return <>{text.slice(0, i)}<br />{text.slice(i + 1)}</>;
}
