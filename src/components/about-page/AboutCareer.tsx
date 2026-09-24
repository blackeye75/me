import type { AboutPage } from '@/content';
import { Panel, tones } from '../story/Story';
import styles from './AboutCareer.module.css';

/** About, fourth panel: the career timeline. Rows rise in and their dividers draw. */
export function AboutCareer({ page }: { page: AboutPage }) {
  const { career } = page;
  return (
    <Panel id="career" className={styles.career} tone={tones.dark} aria-labelledby="career-title">
      <h2 className={styles.title} id="career-title">
        {career.title.map((line) => (
          <span key={line} className="mask"><span className={styles.line} data-rise>{line}</span></span>
        ))}
      </h2>
      <p className={`label ${styles.note}`} data-reveal>{career.note}</p>
      <ol className={styles.rows} data-rows>
        {career.items.map((item) => (
          <li key={item.period} className={styles.row}>
            <span className="mask"><span className={styles.period} data-rise>{item.period}</span></span>
            <span className="mask"><span className={styles.role} data-rise>{item.role}</span></span>
            <span className="mask"><span className={styles.company} data-rise>{item.company}</span></span>
            <span className={styles.rule} data-row-rule />
          </li>
        ))}
      </ol>
    </Panel>
  );
}
