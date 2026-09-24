import type { Link, NavItem } from '@/content';
import styles from './Menu.module.css';

type Props = {
  items: NavItem[];
  socials: Link[];
  /** The current page's path, e.g. "/about"; used to mark the active entry. */
  path: string;
};

/** On the home page, links to "/" or "/#section" scroll instead of loading the page again. */
const scrollTarget = (href: string, path: string) => {
  if (path !== '/') return undefined;
  if (href === '/') return 'top';
  return href.startsWith('/#') ? href.slice(2) : undefined;
};

/** Full-screen navigation. Opening, closing and scrolling are handled by the motion layer. */
export function Menu({ items, socials, path }: Props) {
  return (
    <div className={styles.menu} id="menu" role="dialog" aria-modal="true" aria-label="Site navigation" data-menu data-lenis-prevent>
      <div className={styles.panel} data-menu-panel>
        <button className={styles.close} type="button" data-menu-close>
          <span className="mask"><span data-menu-line>Close</span></span>
        </button>
        <nav className={styles.nav} aria-label="Main">
          {items.map((item, i) => {
            const current = item.href === path || (item.href !== '/' && !item.href.includes('#') && path.startsWith(`${item.href}/`));
            return (
              <a
                key={item.href}
                className={styles.item}
                href={item.href}
                data-goto={scrollTarget(item.href, path)}
                data-menu-item={item.href}
                data-active={current && path !== '/' ? '' : undefined}
                aria-current={current ? 'page' : undefined}
              >
                <span className={`mask ${styles.num}`}><span data-menu-line>{String(i + 1).padStart(2, '0')}.</span></span>
                <span className="mask"><span className={styles.word} data-menu-line>{item.label}</span></span>
              </a>
            );
          })}
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
