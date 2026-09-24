import type { WorkSection } from '@/content';
import { Panel, tones } from '../story/Story';
import styles from './TheWork.module.css';

/** The pause between chapters: a window opens from the centre onto the work reel. */
export function TheWork({ work }: { work: WorkSection }) {
  return (
    <Panel id="the-work" className={styles.theWork} tone={tones.paper} bleed data-mw aria-label={`${work.intro.before} ${work.intro.after}`}>
      <div className={styles.reveal} data-mw-rect aria-hidden="true">
        <div className={styles.inner} data-mw-inner>
          <video className={styles.video} poster={work.reel.poster} autoPlay muted loop playsInline preload="auto" data-mw-video>
            <source media="(max-width: 767px)" src={work.reel.portraitWebm} type="video/webm" />
            <source media="(max-width: 767px)" src={work.reel.portraitMp4} type="video/mp4" />
            <source src={work.reel.webm} type="video/webm" />
            <source src={work.reel.mp4} type="video/mp4" />
          </video>
        </div>
      </div>
      <div className={styles.row}>
        <span className={`${styles.word} ${styles.wordA}`} data-mw-a>{work.intro.before}</span>
        <span className={styles.slot} data-mw-slot aria-hidden="true" />
        <span className={`${styles.word} ${styles.wordB}`} data-mw-b>{work.intro.after}</span>
      </div>
    </Panel>
  );
}
