import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, DESKTOP } from './dom';

/**
 * The works page on desktop: the page is pinned and scrolling slides the row of
 * cards sideways. (On phones the cards reveal like everything else; see reveals.ts.)
 */
export function initWorks({ reduce }: { reduce: boolean }) {
  const section = $('[data-works]');
  const row = $('[data-works-row]');
  if (!section || !row) return () => {};
  const mm = gsap.matchMedia();

  mm.add(DESKTOP, () => {
    const distance = () => Math.max(0, row.getBoundingClientRect().left + row.scrollWidth - window.innerWidth);
    const tween = gsap.fromTo(row, { x: 0 }, { x: () => -distance(), ease: 'none' });
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: () => `+=${Math.max(1, distance())}`,
      pin: true,
      scrub: reduce ? true : 0.6,
      animation: tween,
      invalidateOnRefresh: true,
    });
    return () => { st.kill(); tween.kill(); gsap.set(row, { clearProps: 'transform' }); };
  });

  return () => mm.revert();
}
