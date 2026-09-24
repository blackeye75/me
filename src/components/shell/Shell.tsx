import type { ReactNode } from 'react';
import type { SiteContent } from '@/content';
import { Menu } from '../menu/Menu';
import { Motion } from '../motion/Motion';
import { Rail } from '../rail/Rail';
import styles from './Shell.module.css';

type Props = {
  content: SiteContent;
  /** The page's path, e.g. "/" or "/works/kiln". */
  path: string;
  children: ReactNode;
};

/** What every page shares: skip link, rail, menu, the page curtain and the motion layer. */
export function Shell({ content, path, children }: Props) {
  const { profile } = content;
  const year = new Date().getFullYear();

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Rail profile={profile} year={year} home={path === '/'} />
      <Menu items={content.nav} socials={profile.socials} path={path} />
      <main id="main" data-timezone={profile.location.timeZone}>
        {children}
      </main>
      {/* Covers the page between page loads; see motion/transitions.ts */}
      <div className={styles.curtain} data-curtain aria-hidden="true" />
      <Motion />
    </>
  );
}
