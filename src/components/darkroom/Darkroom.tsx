import Image from 'next/image';
import type { DarkroomSection, Image as ImageData } from '@/content';
import { Panel, tones } from '../story/Story';
import { Lines } from '../text/Lines';
import styles from './Darkroom.module.css';

type Props = {
  darkroom: DarkroomSection;
  logo: ImageData;
};

/** One copy of the composition. The negative is decorative; the print carries the heading. */
function Composition({ darkroom, logo, isPrint }: Props & { isPrint: boolean }) {
  const [first, second] = darkroom.words;
  const Title = isPrint ? 'h2' : 'p';

  return (
    <>
      <p className={`chapter ${styles.chapter}`}>{darkroom.chapter}</p>
      <p className={`${styles.meta} ${styles.time}`}>Dev time <span data-dr-time>00:00</span></p>
      <Title className={styles.title} id={isPrint ? 'darkroom-title' : undefined} aria-label={isPrint ? `${first} ${second}` : undefined}>
        <span className={`${styles.word} ${styles.wordA}`} aria-hidden="true">
          <span className={styles.line}>
            {[...first].map((char, i) => (
              <span key={i} className={styles.char} data-dr-letter data-dir={i % 2 === 0 ? 1 : -1}>{char}</span>
            ))}
          </span>
        </span>
        <span className={`${styles.word} ${styles.wordB}`} aria-hidden="true">
          <span className={styles.track} data-dr-track>{second}</span>
        </span>
      </Title>
      <div className={styles.logoWrap}>
        <div className={styles.logo} data-dr-logo>
          <Image src={logo.src} alt="" width={logo.width} height={logo.height} sizes="(min-width: 768px) 26vw, 50vw" />
        </div>
      </div>
      <p className={`${styles.meta} ${styles.stop}`}>Aperture <span data-dr-stop>f/22</span></p>
      <p className={`${styles.meta} ${styles.note}`}><Lines text={darkroom.note} /></p>
    </>
  );
}

/** Chapter V. The motion layer holds this panel still while the print develops. */
export function Darkroom({ darkroom, logo }: Props) {
  return (
    <Panel id="darkroom" className={styles.darkroom} tone={tones.darkroom} bleed data-dr aria-labelledby="darkroom-title">
      <div className={`${styles.layer} ${styles.neg}`} data-dr-neg aria-hidden="true">
        <Composition darkroom={darkroom} logo={logo} isPrint={false} />
      </div>
      <div className={`${styles.layer} ${styles.print}`} data-dr-print data-timer-seconds={darkroom.timerSeconds}>
        <Composition darkroom={darkroom} logo={logo} isPrint />
      </div>
    </Panel>
  );
}
