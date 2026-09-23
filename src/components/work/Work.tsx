import type { Project, WorkSection } from '@/content';
import { Cover } from '../cover/Cover';
import { cornerClass, Panel, tones } from '../story/Story';
import styles from './Work.module.css';

type Props = {
  work: WorkSection;
  projects: Project[];
};

/** Chapter II. Each project name opens its case study. */
export function Work({ work, projects }: Props) {
  const first = projects[0];

  return (
    <Panel id="work" className={styles.work} tone={tones.sand} aria-labelledby="work-title">
      <p className={`chapter ${cornerClass}`} data-reveal>{work.chapter}</p>

      <div className={styles.preview} aria-hidden="true">
        <span className={styles.placeholder} data-work-ph />
        {projects.map((project) => (
          <span key={project.slug} className={styles.img} data-work-img>
            <Cover cover={project.cover} className={styles.fill} />
          </span>
        ))}
      </div>

      <div className={styles.col}>
        <h2 className="label" id="work-title" data-reveal>{work.label}</h2>
        <ol className={styles.list} data-work-list>
          {projects.map((project, i) => (
            <li key={project.slug} className={styles.item} data-work-item>
              <a className={styles.link} href={`#${project.slug}`} data-case={project.slug}>
                <span className="mask"><span className={styles.name} data-rise>{project.name}</span></span>
                <span className={styles.meta}>{project.category} · {project.year}</span>
                <span className={styles.arrow} aria-hidden="true">↗</span>
              </a>
              {i < projects.length - 1 && <span className={styles.rule} data-work-rule />}
              <span className={`${styles.rule} ${styles.ruleHover}`} data-work-hover />
            </li>
          ))}
        </ol>
        <div className={styles.foot}>
          <p className="label" data-reveal>{work.note}</p>
          {first && (
            <a className="link-arrow" href={`#${first.slug}`} data-case={first.slug} data-reveal>
              <span className="link-text">{work.cta}</span> <span aria-hidden="true">→</span>
            </a>
          )}
        </div>
      </div>
    </Panel>
  );
}
