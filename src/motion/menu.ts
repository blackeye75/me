import { gsap } from 'gsap';
import { $, $$, type Disposer, isDesktop } from './dom';
import type { Rail } from './rail';
import type { Scroll } from './scroll';

const MENU_TONE = { bg: '#2e2b28', fg: '#f3eee8', line: '#5a524d' };

/** On the home page, the menu entry to highlight for the panel under the rail. */
const HOME_NAV_FOR: Record<string, string> = { contact: '/#contact' };

/**
 * Full-screen menu. The panel wipes open from left to right and the links rise
 * in one by one; closing runs it backwards. The icon's outer bars shrink away
 * while it is open.
 */
export function createMenu({ dispose, motion, reduce, scroll, rail, targetY }: {
  dispose: Disposer;
  motion: boolean;
  reduce: boolean;
  scroll: Scroll;
  rail: Rail;
  targetY: (id: string) => number;
}) {
  const root = document.documentElement;
  const button = $<HTMLButtonElement>('[data-menu-btn]');
  const menu = $('[data-menu]');
  const panel = $('[data-menu-panel]');
  const close = $('[data-menu-close]');
  const items = $$('[data-menu-item]');
  const main = $('main');
  const barLower = $<SVGRectElement>('[data-bar="lower"]');
  const barUpper = $<SVGRectElement>('[data-bar="upper"]');
  let open = false;
  let tl: gsap.core.Timeline | null = null;

  /** Full bars, or collapsed to the middle line. Used by the intro too. */
  const bars = (state: 'full' | 'half' | 'closed', duration = 0.7, ease = 'power2.inOut') => {
    if (!barLower || !barUpper) return;
    const d = reduce ? 0 : duration;
    if (state === 'half') {
      gsap.set(barLower, { attr: { width: 16 } });
      gsap.set(barUpper, { attr: { x: 16, width: 16 } });
      return;
    }
    const full = state === 'full';
    gsap.to(barLower, { attr: { width: full ? 32 : 0 }, duration: d, ease, overwrite: 'auto' });
    gsap.to(barUpper, { attr: { x: full ? 0 : 32, width: full ? 32 : 0 }, duration: d, ease, overwrite: 'auto' });
  };

  if (!button || !menu || !panel) return { bars, isOpen: () => false, close: (after?: () => void) => after?.() };

  // Other pages mark their entry when rendered; the home page follows the scroll.
  const home = window.location.pathname === '/';
  const markActive = () => {
    if (!home) return;
    const current = HOME_NAV_FOR[rail.current?.id ?? 'top'] ?? '/';
    items.forEach((it) => it.toggleAttribute('data-active', it.dataset.menuItem === current));
  };

  const openMenu = () => {
    if (open) return;
    open = true;
    markActive();
    menu.setAttribute('data-open', '');
    menu.inert = false;
    if (main) main.inert = true;
    root.classList.add('menu-open');
    scroll.lock('menu', true);
    button.setAttribute('aria-expanded', 'true');
    button.setAttribute('aria-label', 'Close menu');
    rail.hold(MENU_TONE);
    bars('closed');

    const focusFirst = () => (isDesktop() ? close : $('a', menu))?.focus({ preventScroll: true });
    if (!motion) { focusFirst(); return; }

    tl?.kill();
    gsap.set($$('[data-menu-line]', menu), { yPercent: 102 });
    tl = gsap.timeline({ onComplete: focusFirst })
      .fromTo(panel, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.88, ease: 'power3.out' }, 0);
    if (close) tl.to($$('[data-menu-line]', close), { yPercent: 0, duration: 1, ease: 'power2.out' }, 0.12);
    items.forEach((it, i) => {
      tl!.to($$('[data-menu-line]', it), { yPercent: 0, duration: 1, ease: 'power2.out', stagger: 0.07 }, 0.14 + i * 0.15);
    });
    $$('[data-menu-social]', menu).forEach((a, i) => {
      tl!.to(a, { yPercent: 0, duration: 1, ease: 'power2.out' }, 0.22 + i * 0.1);
    });
  };

  const closeMenu = (after?: () => void) => {
    if (!open) { after?.(); return; }
    const finish = () => {
      menu.removeAttribute('data-open');
      menu.inert = true;
      if (main) main.inert = false;
      root.classList.remove('menu-open');
      open = false;
      scroll.lock('menu', false);
      rail.hold(null);
      after?.();
    };
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    bars('full');
    if (!motion) { finish(); return; }
    tl?.kill();
    tl = gsap.timeline({ onComplete: finish })
      .to($$('[data-menu-line]', menu), { yPercent: 102, duration: 0.5, ease: 'power3.in', stagger: { each: 0.02, from: 'end' } }, 0)
      .to(panel, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.58, ease: 'power3.in' }, 0.08);
  };

  menu.inert = true;
  dispose.on(button, 'click', () => (open ? closeMenu() : openMenu()));
  if (close) dispose.on(close, 'click', () => closeMenu(() => button.focus({ preventScroll: true })));
  dispose.on(document, 'keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Escape' && open) closeMenu(() => button.focus({ preventScroll: true }));
  });

  // Any link with data-goto scrolls to its section on this page, closing the menu first.
  // Links to other pages are handled by the page transitions.
  $$('[data-goto]').forEach((link) => {
    dispose.on(link, 'click', (e) => {
      e.preventDefault();
      const go = () => scroll.scrollTo(targetY(link.dataset.goto ?? 'top'));
      if (open) closeMenu(go);
      else go();
    });
  });

  dispose.add(() => {
    tl?.kill();
    menu.removeAttribute('data-open');
    menu.inert = false;
    if (main) main.inert = false;
    root.classList.remove('menu-open');
  });

  return { bars, isOpen: () => open, close: closeMenu };
}

export type Menu = ReturnType<typeof createMenu>;
