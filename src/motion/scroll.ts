import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export type Scroll = {
  lenis: Lenis | null;
  scrollTo: (y: number, options?: { immediate?: boolean }) => void;
  /** Several things can hold the page still (intro, menu, case study); scrolling resumes when all let go. */
  lock: (key: string, locked: boolean) => void;
  destroy: () => void;
};

/** Smooth scrolling with Lenis, kept in step with ScrollTrigger. */
export function createScroll({ smooth, reduce }: { smooth: boolean; reduce: boolean }): Scroll {
  let lenis: Lenis | null = null;
  let tick: ((time: number) => void) | null = null;

  if (smooth) {
    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 1.08, smoothWheel: true });
    instance.on('scroll', ScrollTrigger.update);
    tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    lenis = instance;
  }

  const locks = new Set<string>();

  return {
    lenis,
    scrollTo(y, { immediate = false } = {}) {
      if (lenis) lenis.scrollTo(y, { immediate, force: true, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });
    },
    lock(key, locked) {
      if (locked) locks.add(key);
      else locks.delete(key);
      if (!lenis) return;
      if (locks.size) lenis.stop();
      else lenis.start();
    },
    destroy() {
      if (tick) gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis?.destroy();
      lenis = null;
    },
  };
}
