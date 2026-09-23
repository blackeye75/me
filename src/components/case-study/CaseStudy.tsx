import type { Project } from '@/content';
import { Cover } from '../cover/Cover';
import { CodeBlock } from './CodeBlock';
import styles from './CaseStudy.module.css';

type Props = {
  project: Project;
  index: number;
  total: number;
  next: Project;
};

const pad = (n: number) => String(n).padStart(2, '0');

/** A full-screen case study. Opened by the motion layer when a link with `data-case` is used. */
export function CaseStudy({ project, index, total, next }: Props) {
  const study = project.caseStudy;
  const titleId = `${project.slug}-title`;

  return (
    <dialog className={styles.case} id={project.slug} aria-labelledby={titleId} data-case-dialog data-lenis-prevent>
      <div className={styles.scroll} data-case-scroll>
        <div className={styles.bar}>
          <button className={styles.back} type="button" data-close>← Back</button>
          <span className={styles.pos}>{pad(index + 1)} / {pad(total)}</span>
        </div>
        <article>
          <header className={`${styles.head} ${styles.wrap}`}>
            <p className="eyebrow">{project.category} — {project.year}</p>
            <h2 className={styles.title} id={titleId}>{project.name}</h2>
            <p className={styles.lead}>{study.overview}</p>
          </header>
          <dl className={`${styles.meta} ${styles.wrap}`}>
            <div><dt>Client</dt><dd>{study.client}</dd></div>
            <div><dt>Role</dt><dd>{study.role}</dd></div>
            <div><dt>Year</dt><dd>{project.year}</dd></div>
            <div><dt>Stack</dt><dd>{study.stack}</dd></div>
            <div>
              <dt>Links</dt>
              <dd className={styles.links}>
                {study.links.map((link) => (
                  <a key={link.href + link.label} href={link.href} target="_blank" rel="noopener">{link.label}</a>
                ))}
                <span className={styles.status} data-status={project.status}>{project.statusLabel}</span>
              </dd>
            </div>
          </dl>
          <div className={`${styles.coverWrap} ${styles.wrap}`}>
            <Cover cover={project.cover} className={styles.fill} />
          </div>
          <div className={`${styles.body} ${styles.wrap}`}>
            <section className={styles.sec}>
              <h3>The problem</h3>
              <div><p>{study.problem}</p></div>
            </section>
            <section className={styles.sec}>
              <h3>Approach</h3>
              <div><p>{study.approach}</p></div>
            </section>
            <section className={styles.sec}>
              <h3>Key decisions</h3>
              <div>
                <ul className={styles.decisions}>
                  {study.decisions.map((d) => (
                    <li key={d.title}><strong>{d.title}</strong> {d.body}</li>
                  ))}
                </ul>
              </div>
            </section>
            <section className={styles.sec}>
              <h3>In the code</h3>
              <div><CodeBlock code={study.code} /></div>
            </section>
            <section className={styles.sec}>
              <h3>Outcome</h3>
              <div>
                <dl className={styles.metrics}>
                  {study.metrics.map((m) => (
                    <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>
                  ))}
                </dl>
                <p>{study.outcome}</p>
              </div>
            </section>
          </div>
        </article>
        <button className={styles.next} type="button" data-open={next.slug}>
          <span className="eyebrow">Next project</span>
          <span className={styles.nextTitle}>{next.name} <span aria-hidden="true">→</span></span>
        </button>
      </div>
    </dialog>
  );
}

/** Every case study, each linking to the next in a loop. */
export function CaseStudies({ projects }: { projects: Project[] }) {
  return (
    <>
      {projects.map((project, i) => (
        <CaseStudy key={project.slug} project={project} index={i} total={projects.length} next={projects[(i + 1) % projects.length]} />
      ))}
    </>
  );
}
