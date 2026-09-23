import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { $, $$, isDesktop } from './dom';
import { hideLines, revealLines } from './reveal';

type IntroOptions = {
  rail: HTMLElement | null;
  /** Grows the menu icon's outer bars from half to full width. */
  openMenuIcon: (duration: number, ease: string) => void;
  onDone: () => void;
};

/**
 * The intro, on every load: the first year rises in, the years roll up to
 * today while a bar fills along the bottom, the bar grows into the hero, and
 * the name rises word by word before the tagline and details.
 */
export function runIntro({ rail, openMenuIcon, onDone }: IntroOptions) {
  const strip = $('[data-years]');
  const firstYear = $('[data-year-first]');
  const yearRow = $('[data-year-row]');
  const base = $('[data-hero-base]');
  const glow = $('[data-hero-glow]');
  const nameEl = $('[data-hero-name]');
  const words = $$('[data-name-word]');
  const tagline = $('[data-hero-tagline]');
  const journey = $('[data-hero-journey]');
  const metas = $$('[data-hero-meta]');
  if (!strip || !firstYear || !yearRow || !base || !nameEl || !tagline) {
    onDone();
    return gsap.timeline();
  }

  const n = isDesktop() ? 1 : 0.86;
  const cells = strip.children.length;
  const chars = SplitText.create(firstYear, { type: 'chars', charsClass: 'char' }).chars;
  gsap.set(yearRow, { opacity: 1 });
  gsap.set(words, { yPercent: 102 });

  const tl = gsap.timeline();
  tl.fromTo(chars, { yPercent: 102 }, { yPercent: 0, duration: 1.7 * n, ease: 'power4.inOut', stagger: 0.07 * n }, 0);
  const startDone = 1.7 * n + 0.07 * n * (chars.length - 1);
  if (journey && isDesktop()) tl.call(() => { revealLines(journey, { duration: 1.7 * n }); }, [], 0);
  if (rail) tl.to(rail, { opacity: 1, duration: 2.5 * n, ease: 'power3.out' }, 0.5 * n);

  // The years roll while the bar fills along the bottom, led by its glow.
  const roll = 2.85 * n;
  tl.to(strip, { yPercent: (-100 * (cells - 1)) / cells, duration: roll, ease: 'power4.inOut' }, startDone);
  tl.to(base, { scaleX: 1, duration: roll, ease: 'power4.inOut' }, startDone);
  if (glow) {
    tl.fromTo(glow, { left: '0%', opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, startDone);
    tl.to(glow, { left: '100%', duration: roll, ease: 'power4.inOut' }, startDone);
    tl.to(glow, { opacity: 0, duration: 0.5, ease: 'power2.out' }, startDone + roll - 0.1);
  }

  // The year slides away and the name rises in.
  const handoff = startDone + roll - 0.42 * n;
  tl.to(yearRow, { yPercent: -100, duration: 1.78 * n, ease: 'power4.inOut' }, handoff);
  if (journey && isDesktop()) tl.call(() => { hideLines(journey, { duration: 1.2 * n }); }, [], handoff);
  tl.call(() => openMenuIcon(2, 'power2.out'), [], handoff);

  const nameAt = handoff + 1.78 * n * 0.5;
  tl.set(nameEl, { opacity: 1 }, nameAt);
  tl.to(words, { yPercent: 0, duration: 1.7 * n, ease: 'power3.out', stagger: 0.2 * n }, nameAt);

  const tagAt = nameAt + 0.2 * n * (words.length - 1) + 0.4 * n;
  tl.call(() => { revealLines(tagline, { duration: 1.7 * n, stagger: 0.2 * n }); }, [], tagAt);
  tl.call(() => metas.forEach((m) => revealLines(m, { duration: 1.7 * n })), [], tagAt + 0.3 * n);
  // The bar grows up into the hero background.
  tl.to(base, { height: '100%', duration: 1.1 * n, ease: 'power2.inOut' }, startDone + roll);

  tl.call(onDone, [], tagAt + 0.5 * n);
  return tl;
}
