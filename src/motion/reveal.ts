import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { $ } from './dom';

type LineOptions = { duration?: number; stagger?: number; ease?: string };

/** Lines rise out of a mask, one after another. The split is undone afterwards. */
export function revealLines(el: Element, { duration = 1.7, stagger = 0.07, ease = 'power3.out' }: LineOptions = {}) {
  const tl = gsap.timeline();
  tl.set(el, { opacity: 1 }, 0);
  const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
  tl.fromTo(split.lines, { yPercent: 102 }, { yPercent: 0, duration, ease, stagger }, 0);
  tl.call(() => split.revert());
  return tl;
}

/** Lines drop back into their masks, last line first. */
export function hideLines(el: Element, { duration = 1.2, ease = 'power3.inOut' }: LineOptions = {}) {
  const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
  return gsap.timeline()
    .to(split.lines, { yPercent: 102, duration, ease, stagger: { each: 0.07, from: 'end' } })
    .set(el, { opacity: 0 })
    .call(() => split.revert());
}

/** Pre-wrapped single lines (an element inside a `.mask`) rise into view. */
export function riseLines(els: Element[], { duration = 1.7, stagger = 0.07, ease = 'power3.out' }: LineOptions = {}) {
  return gsap.fromTo(els, { yPercent: 102, opacity: 1 }, { yPercent: 0, duration, ease, stagger, force3D: true });
}

/** Hides an image before its reveal. */
export function prepImage(shell: Element) {
  const media = $('[data-ir-media]', shell);
  if (media) gsap.set(media, { clipPath: 'inset(0% 100% 0% 0%)', xPercent: -10 });
}

/** A colour block wipes in from the left, then the image slides in over it. */
export function revealImage(shell: Element, { duration = 0.7, delay = 0.2, ease = 'power2.out' } = {}) {
  const overlay = $('[data-ir-overlay]', shell);
  const media = $('[data-ir-media]', shell);
  const tl = gsap.timeline({ onComplete: () => { if (overlay) gsap.set(overlay, { autoAlpha: 0 }); } });
  if (overlay) {
    gsap.set(overlay, { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' });
    tl.to(overlay, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease }, 0);
  }
  if (media) tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', xPercent: 0, duration, ease }, delay);
  return tl;
}
