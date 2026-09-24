import Image from 'next/image';
import type { Project, WorksPage } from '@/content';
import styles from './WorksList.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** All projects. On desktop the row of cards slides sideways as you scroll; on phones they stack. */
export function WorksList({ page, projects }: { page: WorksPage; projects: Project[] }) {
  return (
    <section className={styles.works} data-works data-panel data-rail-bg="#edeae6" data-rail-fg="#2e2b28" data-rail-line="#b8b3ac" aria-labelledby="works-title">
      <header className={styles.head}>
        <h1 className={styles.title} id="works-title">
          <span className="mask"><span className={styles.line} data-enter-line>{page.title}</span></span>
        </h1>
        <span className={styles.count} aria-label={`${projects.length} projects`}>
          <span className="mask"><span className={styles.line} data-enter-line>({projects.length})</span></span>
        </span>
        <p className="sr-only">{page.intro}</p>
      </header>
      <ol className={styles.row} data-works-row>
        {projects.map((project, i) => {
          const tall = i % 2 === 1;
          const image = tall ? project.images.tall : project.images.hero;
          return (
            <li key={project.slug} className={styles.card} data-tall={tall ? '' : undefined} data-work-card>
              <a className={styles.link} href={`/works/${project.slug}`}>
                <span className={styles.media} data-card-media>
                  <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 21vw, 92vw" className={styles.img} priority={i < 3} />
                </span>
                <span className={styles.caption}>
                  <span className={styles.num}>{pad(i + 1)}.</span>
                  <span className={styles.text}>
                    <span className={styles.cat}>{project.category} — {project.year}</span>
                    <span className={styles.name}>{project.name}</span>
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
