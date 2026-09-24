import type { ReactNode } from 'react';
import { SignOutButton } from './SignOutButton';
import styles from './admin.module.css';

type Props = { title: string; name: string; signOut?: boolean; children: ReactNode };

/** A full-screen message in the admin: setup steps, missing access, errors. */
export function Notice({ title, name, signOut, children }: Props) {
  return (
    <div className={styles.root}>
      <div className={styles.split}>
        <div className={styles.poster}>
          <span className={styles.brandSub}>{name} · Studio</span>
          <p className={styles.posterTitle}>{title}</p>
          <p className={styles.posterNote}>The content admin for this portfolio.</p>
        </div>
        <div className={styles.panel}>
          <div className={styles.notice}>
            {children}
            <div className={styles.inline}>
              <a className={`${styles.btn} ${styles.quiet}`} href="/">View site ↗</a>
              {signOut && <SignOutButton className={`${styles.btn}`} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
