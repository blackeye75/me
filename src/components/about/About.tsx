import type { About as AboutData, Image as ImageData } from '@/content';
import { Portrait } from '../portrait/Portrait';
import { Panel, tones } from '../story/Story';
import { Lines } from '../text/Lines';
import styles from './About.module.css';

type Props = {
  about: AboutData;
  logo: ImageData;
};

/** Chapter I. The label, intro and quote rise in sequence, then the portrait wipes in. */
export function About({ about, logo }: Props) {
  return (
    <Panel id="about" className={styles.about} tone={tones.paper} aria-labelledby="about-title">
      <div className={styles.left}>
        <p className="chapter" data-reveal>{about.chapter}</p>
        <p className={`${styles.hobbies} small`} data-reveal>{about.hobbies}</p>
      </div>
      <div className={styles.right} data-about>
        <div className={styles.copy}>
          <h2 className="label" id="about-title" data-about-part>{about.label}</h2>
          <p className={styles.intro} data-about-part>{about.intro}</p>
        </div>
        <div className={styles.bottom}>
          <div className={styles.quoteCol}>
            <p className={`${styles.quote} label`} data-about-part><Lines text={about.quote} /></p>
            <a className={`link-arrow ${styles.more}`} href="/about" data-reveal>
              <span className="link-text">{about.moreLabel}</span> <span aria-hidden="true">→</span>
            </a>
          </div>
          <figure className={styles.portrait} data-image-reveal>
            <span className={styles.overlay} data-ir-overlay />
            <span className={styles.media} data-ir-media>
              <Portrait logo={logo} alt={about.portraitAlt} sizes="(min-width: 768px) 16vw, 70vw" />
            </span>
          </figure>
        </div>
      </div>
    </Panel>
  );
}
