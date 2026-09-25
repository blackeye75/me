import { ContentImage as Image } from '../image/ContentImage';
import type { Image as ImageData, Project, WorksPage } from '@/content';
import { CodeBlock } from './CodeBlock';
import styles from './CaseStudy.module.css';

type Props = {
  project: Project;
  next: Project;
  labels: WorksPage['labels'];
};

function Picture({ image, sizes, tall }: { image: ImageData; sizes: string; tall?: boolean }) {
  return (
    <figure className={tall ? `${styles.pic} ${styles.tall}` : styles.pic} data-image-reveal>
      <span className={styles.overlay} data-ir-overlay />
      <span className={styles.media} data-ir-media>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className={styles.img} />
      </span>
    </figure>
  );
}

/**
 * A project page. Desktop: the facts stay on the left while the pictures and the
 * write-up scroll past on the right. Phones: everything in one column.
 */
export function CaseStudy({ project, next, labels }: Props) {
  const study = project.caseStudy;
  const gallerySizes = '(min-width: 768px) 50vw, 100vw';

  return (
    <article className={styles.page} aria-labelledby="case-title" data-panel data-rail-bg="#faf9f6" data-rail-fg="#2e2b28" data-rail-line="#b8b3ac">
      <div className={styles.info} data-hold>
        <div className={styles.top}>
          <a className={styles.back} href="/works" data-enter><span aria-hidden="true">←</span> {labels.back}</a>
          <h1 className={styles.title} id="case-title">
            <span className="mask"><span className={styles.line} data-enter-line>{project.name}</span></span>
          </h1>
        </div>
        <div className={styles.facts}>
          <div className={styles.fact}>
            <h2 className="label" data-enter>{labels.overview}</h2>
            <p className={styles.overview} data-enter>{study.overview}</p>
          </div>
          <div className={styles.fact}>
            <h2 className="label" data-enter>{labels.details}</h2>
            <dl className={styles.details} data-enter-rows>
              <div><dt>{labels.client}</dt><dd>{study.client}</dd></div>
              <div><dt>{labels.year}</dt><dd>{project.year}</dd></div>
              <div><dt>{labels.role}</dt><dd>{study.role}</dd></div>
              <div><dt>{labels.stack}</dt><dd>{study.stack}</dd></div>
              <div>
                <dt>{labels.preview}</dt>
                <dd className={styles.links}>
                  {study.links.map((link) => (
                    <a key={link.href + link.label} href={link.href} target="_blank" rel="noopener">{link.label}</a>
                  ))}
                  <span className={styles.status} data-status={project.status}>{project.statusLabel}</span>
                </dd>
              </div>
            </dl>
          </div>
          <div className={`${styles.fact} ${styles.nextFact}`}>
            <h2 className="label" data-enter>{labels.next}</h2>
            <a className={styles.nextName} href={`/works/${next.slug}`} data-enter>{next.name}</a>
          </div>
        </div>
      </div>

      <div className={styles.gallery}>
        <Picture image={project.images.hero} sizes={gallerySizes} />
        <section className={styles.sec}>
          <h2 data-reveal>{labels.problem}</h2>
          <p data-reveal>{study.problem}</p>
        </section>
        <section className={styles.sec}>
          <h2 data-reveal>{labels.approach}</h2>
          <p data-reveal>{study.approach}</p>
        </section>
        <Picture image={project.images.detail} sizes={gallerySizes} />
        <section className={styles.sec}>
          <h2 data-reveal>{labels.decisions}</h2>
          <ul className={styles.decisions}>
            {study.decisions.map((d) => (
              <li key={d.title} data-reveal><strong>{d.title}</strong> {d.body}</li>
            ))}
          </ul>
        </section>
        <section className={styles.sec}>
          <h2 data-reveal>{labels.code}</h2>
          <div data-fade><CodeBlock code={study.code} /></div>
        </section>
        <Picture image={project.images.tall} sizes={gallerySizes} tall />
        <section className={styles.sec}>
          <h2 data-reveal>{labels.outcome}</h2>
          <dl className={styles.metrics}>
            {study.metrics.map((m) => (
              <div key={m.label} data-fade><dt>{m.label}</dt><dd>{m.value}</dd></div>
            ))}
          </dl>
          <p data-reveal>{study.outcome}</p>
        </section>
        <a className={styles.next} href={`/works/${next.slug}`}>
          <span className="label">{labels.next}</span>
          <span className={styles.nextTitle}>{next.name} <span aria-hidden="true">→</span></span>
        </a>
      </div>
    </article>
  );
}
