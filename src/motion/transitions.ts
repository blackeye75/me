import { gsap } from 'gsap';
import { $, type Disposer } from './dom';

/**
 * Page changes. Leaving: the curtain rises from the bottom to cover the page,
 * then the next page loads. Arriving: the page starts covered (set by the boot
 * script) and the curtain lifts away upwards, like turning a page.
 */
export function createTransitions({ dispose, reduce }: { dispose: Disposer; reduce: boolean }) {
  const root = document.documentElement;
  const curtain = $('[data-curtain]');
  let leaving = false;

  /**
   * Lifts the curtain; `onReveal` runs as the page starts to show. Until now the
   * page was covered by a plain cover in the stylesheet (see globals.css); the
   * curtain element, already covering the same way, takes over as it lifts.
   */
  const enter = (onReveal: () => void) => {
    if (!curtain || !root.classList.contains('is-entering')) {
      root.classList.remove('is-entering');
      onReveal();
      return;
    }
    gsap.set(curtain, { clipPath: 'inset(0% 0% 0% 0%)' });
    root.classList.add('is-lifting');
    gsap.timeline({
      onComplete: () => {
        root.classList.remove('is-entering', 'is-lifting');
        gsap.set(curtain, { clearProps: 'clipPath' });
      },
    })
      .to(curtain, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'power3.inOut' }, 0.05)
      .call(onReveal, [], 0.4);
  };

  const leave = (href: string) => {
    if (leaving) return;
    if (reduce || !curtain) { window.location.assign(href); return; }
    leaving = true;
    root.classList.add('is-leaving');
    gsap.fromTo(curtain, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.75,
      ease: 'power3.inOut',
      onComplete: () => window.location.assign(href),
    });
  };

  // Links to other pages of this site leave through the curtain.
  dispose.on(document, 'click', (event) => {
    const e = event as MouseEvent;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return;
    e.preventDefault();
    leave(url.href);
  });

  // Coming back through the browser's back/forward cache: take the curtain down.
  dispose.on(window, 'pageshow', (event) => {
    if (!(event as PageTransitionEvent).persisted) return;
    leaving = false;
    root.classList.remove('is-leaving', 'is-entering', 'is-lifting');
    if (curtain) gsap.set(curtain, { clearProps: 'all' });
  });

  dispose.add(() => {
    if (curtain) gsap.killTweensOf(curtain);
    root.classList.remove('is-leaving', 'is-entering', 'is-lifting');
  });

  return { enter, leave };
}

export type Transitions = ReturnType<typeof createTransitions>;
