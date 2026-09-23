import type { ExperienceSection } from '@/content';
import { cornerClass, Panel, tones } from '../story/Story';
import { Lines } from '../text/Lines';
import styles from './Experience.module.css';

/** Chapter IV. Names rise one by one; on desktop each shows its logo on hover. */
export function Experience({ experience }: { experience: ExperienceSection }) {
  return (
    <Panel id="experience" className={styles.experience} tone={tones.sand} aria-labelledby="experience-title">
      <p className={`chapter ${cornerClass}`} data-reveal>{experience.chapter}</p>
      <p className={`${styles.note} small`} data-reveal><Lines text={experience.note} /></p>
      <div className={styles.col}>
        <h2 className="label" id="experience-title" data-reveal>{experience.label}</h2>
        <ul className={styles.list} data-clients-list>
          {experience.items.map((item) => (
            <li key={item.company} className={styles.item} data-client>
              <span className={styles.logo} aria-hidden="true">
                {/* Logos are small SVGs; a plain img keeps them crisp at any size. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.logo} alt="" width={80} height={80} loading="lazy" decoding="async" />
              </span>
              <span className="mask"><span className={styles.name} data-rise>{item.company}</span></span>
              <span className={styles.meta}>{item.role} · {item.period}</span>
            </li>
          ))}
          <li className={`${styles.item} ${styles.more}`} data-client data-client-more>
            <span className="mask"><span className={styles.name} data-rise>{experience.moreLabel}</span></span>
          </li>
        </ul>
      </div>
    </Panel>
  );
}
