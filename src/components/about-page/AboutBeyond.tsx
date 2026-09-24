import { ContentImage as Image } from '../image/ContentImage';
import type { AboutPage, Profile } from '@/content';
import { Panel, tones } from '../story/Story';
import { Lines } from '../text/Lines';
import styles from './AboutBeyond.module.css';

/** About, last panel: life beyond code. Hovering a hobby shows its picture in the frame. */
export function AboutBeyond({ page, profile }: { page: AboutPage; profile: Profile }) {
  const { beyond } = page;
  const last = beyond.hobbies.length - 1;
  return (
    <Panel id="beyond" className={styles.beyond} tone={tones.sand} bleed="desktop" aria-label="Beyond code">
      <figure className={styles.photo} data-image-reveal>
        <span className={styles.overlay} data-ir-overlay />
        <span className={styles.media} data-ir-media>
          <Image src={beyond.image.src} alt={beyond.image.alt} fill sizes="(min-width: 768px) 46vw, 90vw" className={styles.img} />
        </span>
      </figure>
      <div className={styles.side}>
        <p className={styles.text} data-reveal>
          {beyond.lead}{' '}
          {beyond.hobbies.map((hobby, i) => (
            <span key={hobby.label}>
              {i === last && 'and '}
              <span className={styles.hobby} tabIndex={0} data-hobby={i}>{hobby.label}</span>
              {i < last && ', '}
            </span>
          ))}{' '}
          {beyond.tail}
        </p>
        <div className={styles.frame} aria-hidden="true" data-hobby-frame>
          {beyond.hobbies.map((hobby) => (
            <Image key={hobby.label} src={hobby.image.src} alt="" width={hobby.image.width} height={hobby.image.height} sizes="14vw" className={styles.hobbyImg} data-hobby-img />
          ))}
        </div>
        <div className={styles.bottom}>
          <p data-reveal><Lines text={beyond.availability} /></p>
          <p data-reveal>
            {beyond.emailLabel}<br />
            <a className={styles.email} href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
        </div>
      </div>
    </Panel>
  );
}
