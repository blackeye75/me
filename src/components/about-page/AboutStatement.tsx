import type { AboutPage } from '@/content';
import { Panel, tones } from '../story/Story';
import styles from './AboutStatement.module.css';

/** About, second panel: what I do in one sentence, and two short paragraphs. */
export function AboutStatement({ page }: { page: AboutPage }) {
  return (
    <Panel id="approach" className={styles.statement} tone={tones.sand} width="52vw" aria-label="Approach">
      <p className={styles.lead} data-reveal>{page.statement}</p>
      <div className={styles.cols}>
        {page.paragraphs.map((text) => <p key={text} data-reveal>{text}</p>)}
      </div>
    </Panel>
  );
}
