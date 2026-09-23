import type { FooterSection, Profile } from '@/content';
import { CopyEmail } from '../copy-email/CopyEmail';
import { Panel, tones } from '../story/Story';
import { Lines } from '../text/Lines';
import styles from './Footer.module.css';

type Props = {
  footer: FooterSection;
  profile: Profile;
  year: number;
};

/** The closing panel. The title rises word by word, then the contact lines. */
export function Footer({ footer, profile, year }: Props) {
  return (
    <Panel as="footer" id="contact" className={styles.footer} tone={tones.night} data-footer>
      <div className={styles.top}>
        <h2 className={styles.title}>
          {footer.titleLines.map((line) => (
            <span key={line} className="mask"><span className={styles.word} data-rise data-ft-word>{line}</span></span>
          ))}
        </h2>
        <ul className={styles.social}>
          {profile.socials.map((link) => (
            <li key={link.href} className="mask">
              <a href={link.href} target="_blank" rel="noopener" data-ft-line>{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.bottom}>
        <div className={styles.contact}>
          <p className="label"><span className="mask"><span data-ft-line>{footer.contactLabel}</span></span></p>
          <p className={styles.emailRow}>
            <span className="mask">
              <span data-ft-line>
                <a className={styles.email} href={`mailto:${profile.email}`} data-email>{profile.email}</a>
              </span>
            </span>
            <CopyEmail email={profile.email} className={styles.copy} />
          </p>
        </div>
        <p className={`label ${styles.sign}`} data-reveal><Lines text={footer.sign} /></p>
        <p className={`label ${styles.copyright}`} data-reveal>© {year} {profile.name}<br />{footer.credit}</p>
      </div>
    </Panel>
  );
}
