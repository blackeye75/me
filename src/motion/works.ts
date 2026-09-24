import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, DESKTOP, MOBILE } from './dom';

/**
 * The works page. Desktop: the page is pinned and scrolling slides the row of
 * cards sideways. Phones: each card's picture opens upwards as it scrolls in.
 */
export function initWorks({ reduce }: { reduce: boolean }) {
  const section = $('[data-works]');
  const row = $('[data-works-row]');
  if (!section || !row) return () => {};
  const cards = $$('[data-work-card]', row);
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

  mm.add(MOBILE, () => {
    if (reduce) return undefined;
    const triggers = cards.map((card) => {
      const media = $('[data-card-media]', card);
      const tl = gsap.timeline({ paused: true });
      if (media) tl.fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out' });
      return ScrollTrigger.create({ trigger: card, start: 'top 88%', once: true, onEnter: () => tl.play() });
    });
    return () => triggers.forEach((st) => st.kill());
  });

  return () => mm.revert();
}
