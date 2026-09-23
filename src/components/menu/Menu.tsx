import type { Link, NavItem } from '@/content';
import styles from './Menu.module.css';

type Props = {
  items: NavItem[];
  socials: Link[];
};

/** Full-screen navigation. Opening, closing and scrolling are handled by the motion layer. */
export function Menu({ items, socials }: Props) {
  return (
    <div className={styles.menu} id="menu" role="dialog" aria-modal="true" aria-label="Site navigation" data-menu data-lenis-prevent>
      <div className={styles.panel} data-menu-panel>
        <button className={styles.close} type="button" data-menu-close>
          <span className="mask"><span data-menu-line>Close</span></span>
        </button>
        <nav className={styles.nav} aria-label="Main">
          {items.map((item, i) => (
            <a key={item.target} className={styles.item} href={`#${item.target}`} data-goto={item.target} data-menu-item={item.target}>
              <span className={`mask ${styles.num}`}><span data-menu-line>{String(i + 1).padStart(2, '0')}.</span></span>
              <span className="mask"><span className={styles.word} data-menu-line>{item.label}</span></span>
            </a>
          ))}
        </nav>
        <div className={styles.social}>
          {socials.map((link) => (
            <span key={link.href} className="mask">
              <a href={link.href} target="_blank" rel="noopener" data-menu-line data-menu-social>{link.label}</a>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
