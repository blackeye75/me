import type { AboutPage } from '@/content';
import { Panel, tones } from '../story/Story';
import styles from './AboutPhilosophy.module.css';

/** About, third panel: the philosophy, which lights up letter by letter as it scrolls past. */
export function AboutPhilosophy({ page }: { page: AboutPage }) {
  return (
    <Panel id="philosophy" className={styles.philosophy} tone={tones.dark} width="46vw" aria-labelledby="philosophy-label">
      <p className={`label ${styles.label}`} id="philosophy-label" data-reveal>{page.philosophy.label}</p>
      <blockquote className={styles.quote} data-fill>{page.philosophy.quote}</blockquote>
    </Panel>
  );
}
