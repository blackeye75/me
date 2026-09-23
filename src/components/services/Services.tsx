import type { ServicesSection } from '@/content';
import { Cover } from '../cover/Cover';
import { Panel, tones } from '../story/Story';
import styles from './Services.module.css';

/** Chapter III. A statement followed by one column per service. */
export function Services({ services }: { services: ServicesSection }) {
  return (
    <Panel id="services" className={styles.services} tone={tones.dark} fit data-services aria-labelledby="services-title">
      <div className={styles.intro}>
        <p className="chapter" data-reveal>{services.chapter}</p>
        <div className={styles.introCopy}>
          <h2 className="label" id="services-title" data-reveal>{services.label}</h2>
          <p className={styles.lead} data-reveal>{services.lead}</p>
        </div>
      </div>
      {services.items.map((service, i) => (
        <article key={service.title.join(' ')} className={styles.item} data-svc tabIndex={0}>
          <div className={styles.bg} data-svc-bg aria-hidden="true">
            <div className={styles.media} data-svc-media>
              <Cover cover={service.cover} className={styles.fill} />
            </div>
          </div>
          <p className={styles.num} data-reveal>{String(i + 1).padStart(2, '0')}</p>
          <h3 className={styles.title} data-reveal>
            {service.title.map((line, j) => <span key={line}>{j > 0 && <br />}{line}</span>)}
          </h3>
          <div className={styles.desc}>
            <p data-reveal>{service.description}</p>
            <p className={styles.tools} data-reveal>{service.tools}</p>
          </div>
        </article>
      ))}
    </Panel>
  );
}
