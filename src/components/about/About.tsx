import Image from 'next/image';
import type { About as AboutData, Image as ImageData } from '@/content';
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
            <a className="link-arrow" href="#experience" data-goto="experience" data-reveal>
              <span className="link-text">{about.moreLabel}</span> <span aria-hidden="true">→</span>
            </a>
          </div>
          <figure className={styles.portrait} data-image-reveal>
            <span className={styles.overlay} data-ir-overlay />
            <span className={styles.media} data-ir-media>
              <span className={styles.placeholder} role="img" aria-label={about.portraitAlt}>
                <span className={styles.head}>
                  <Image src={logo.src} alt="" width={logo.width} height={logo.height} sizes="(min-width: 768px) 16vw, 200px" />
                </span>
              </span>
            </span>
          </figure>
        </div>
      </div>
    </Panel>
  );
}
