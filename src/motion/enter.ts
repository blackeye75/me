import { gsap } from 'gsap';
import { $$, isDesktop } from './dom';
import { prepImage, revealImage, revealLines, riseLines } from './reveal';

/** Hides what the page's entrance will reveal. Runs before the curtain lifts. */
export function prepEntrance() {
  $$('[data-enter-image]').forEach(prepImage);
  const cards = isDesktop() ? $$('[data-work-card]') : [];
  if (cards.length) gsap.set(cards, { opacity: 0 });
}

/**
 * The first things on a page arrive in order: big titles rise out of their
 * masks, then the text lines, table rows, the lead picture and the works cards.
 */
export function playEntrance() {
  const tl = gsap.timeline();
  const lines = $$('[data-enter-line]');
  if (lines.length) tl.add(riseLines(lines, { duration: 1.4, stagger: 0.1 }), 0);
  $$('[data-enter]').forEach((el, i) => tl.add(revealLines(el, { duration: 1.2 }), 0.25 + i * 0.06));
  $$('[data-enter-rows]').forEach((list) => {
    tl.fromTo(Array.from(list.children), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 }, 0.45);
  });
  $$('[data-enter-image]').forEach((el, i) => tl.add(revealImage(el, { duration: 0.9 }), 0.15 + i * 0.1));
  // Works page (desktop): the cards rise in one after another.
  const cards = isDesktop() ? $$('[data-work-card]') : [];
  if (cards.length) tl.fromTo(cards, { yPercent: 16, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: 'power3.out', stagger: 0.08 }, 0.2);
  return tl;
}
