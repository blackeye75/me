import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { $, $$, DESKTOP, type Disposer, isDesktop, MOBILE } from './dom';

/**
 * The About page. The philosophy quote lights up letter by letter as it
 * scrolls past, and hovering a hobby shows its picture in the frame.
 */
export function initAbout({ dispose, reduce, storyTimeline }: { dispose: Disposer; reduce: boolean; storyTimeline: gsap.core.Timeline }) {
  const mm = gsap.matchMedia();

  const quote = $('[data-fill]');
  if (quote && !reduce) {
    const split = SplitText.create(quote, { type: 'words,chars', charsClass: 'char' });
    const light = gsap.fromTo(split.chars, { color: '#5f5a54' }, { color: '#f3eee8', ease: 'none', stagger: 0.1, paused: true });
    const panel = quote.closest('[data-panel]') ?? quote;
    mm.add(DESKTOP, () => {
      const st = ScrollTrigger.create({ trigger: panel, containerAnimation: storyTimeline, start: 'left 75%', end: 'right 70%', scrub: true, animation: light });
      return () => st.kill();
    });
    mm.add(MOBILE, () => {
      const st = ScrollTrigger.create({ trigger: quote, start: 'top 80%', end: 'bottom 45%', scrub: true, animation: light });
      return () => st.kill();
    });
    dispose.add(() => { light.kill(); split.revert(); });
  }

  // The hobby words sit inside a line reveal, which rebuilds their markup, so
  // listen on the paragraph and find the word under the pointer each time.
  const frame = $('[data-hobby-frame]');
  const text = $('[data-hobby]')?.parentElement?.closest('p') ?? null;
  const pictures = frame ? $$('[data-hobby-img]', frame) : [];
  let active = -1;
  const words = () => (text ? $$('[data-hobby]', text) : []);
  const show = (i: number) => {
    if (!isDesktop() || i === active || !pictures[i]) return;
    const previous = pictures[active];
    active = i;
    words().forEach((w) => w.toggleAttribute('data-active', Number(w.dataset.hobby) === i));
    pictures.forEach((p) => gsap.set(p, { zIndex: p === pictures[i] ? 2 : p === previous ? 1 : 0 }));
    gsap.fromTo(pictures[i], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.15 }, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: reduce ? 0 : 0.8, ease: 'power3.out', overwrite: true });
  };
  const hide = () => {
    if (active < 0) return;
    const picture = pictures[active];
    active = -1;
    words().forEach((w) => w.removeAttribute('data-active'));
    gsap.to(picture, { clipPath: 'inset(0% 0% 100% 0%)', duration: reduce ? 0 : 0.6, ease: 'power3.inOut', overwrite: true });
  };
  const hobbyAt = (e: Event) => (e.target as Element | null)?.closest?.<HTMLElement>('[data-hobby]') ?? null;
  if (text && pictures.length) {
    const enter = (e: Event) => { const w = hobbyAt(e); if (w) show(Number(w.dataset.hobby)); else hide(); };
    dispose.on(text, 'pointerover', enter);
    dispose.on(text, 'focusin', enter);
    dispose.on(text, 'pointerleave', hide);
    dispose.on(text, 'focusout', hide);
  }

  return () => mm.revert();
}
