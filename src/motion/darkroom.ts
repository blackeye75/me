import { gsap } from 'gsap';
import { $, $$ } from './dom';

const STOPS = ['f/22', 'f/16', 'f/11', 'f/8', 'f/5.6', 'f/4', 'f/2.8'];

/**
 * Chapter V: the darkroom. Adds its scroll-linked motion to any timeline, so the
 * same sequence runs inside the horizontal story (desktop) or its own pin (phones).
 */
export function createDarkroom() {
  const panel = $('[data-dr]');
  const neg = $('[data-dr-neg]');
  const print = $('[data-dr-print]');
  const ready = Boolean(panel && neg && print);
  const timerSeconds = Number(print?.dataset.timerSeconds ?? 90);
  /** Current aperture radius, used to colour the rail. */
  const state = { r: 0 };

  const setAperture = (a: number, W: number, H: number) => {
    const r = a * (Math.hypot(W, H) / 2 + 8);
    print!.style.clipPath = `circle(${r}px at 50% 50%)`;
    state.r = r;
    const stop = STOPS[Math.min(STOPS.length - 1, Math.floor(a * STOPS.length))];
    $$('[data-dr-stop]', panel!).forEach((el) => { el.textContent = stop; });
  };

  const setTimer = (p: number) => {
    const secs = Math.round(p * timerSeconds);
    const text = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
    $$('[data-dr-time]', panel!).forEach((el) => { el.textContent = text; });
  };

  const reset = () => {
    if (!ready) return;
    print!.style.clipPath = '';
    state.r = 0;
    gsap.set($$('[data-dr-letter], [data-dr-track], [data-dr-logo]', panel!), { clearProps: 'transform,letterSpacing' });
    gsap.set(neg!, { clearProps: '--glow,--dr-blur' });
  };

  /** Adds the sequence to `tl` at `at` (a label or time), lasting `len`. */
  const addTo = (tl: gsap.core.Timeline, at: string | number, len: number) => {
    if (!ready) return;
    const W = panel!.clientWidth;
    const H = panel!.clientHeight;
    const aperture = { a: 0 };
    const clock = { p: 0 };
    const pos = (offset: number) => (typeof at === 'number' ? at + offset : `${at}+=${offset}`);
    // Same delay for the same letter in both layers, so negative and print stay in register.
    const letterDelay = (_: number, el: Element) => Array.from(el.parentNode!.children).indexOf(el) * len * 0.03;

    setAperture(0, W, H);
    setTimer(0);

    // DARKROOM: letters rise and fall into place alternately, like teeth meshing.
    tl.fromTo($$('[data-dr-letter]', panel!),
      { yPercent: (_: number, el: HTMLElement) => Number(el.dataset.dir) * 110 },
      { yPercent: 0, duration: len * 0.2, ease: 'power3.out', stagger: letterDelay }, at);
    // ENGINEERING: slides in wide and tightens to its final spacing.
    tl.fromTo($$('[data-dr-track]', panel!),
      { xPercent: 28, letterSpacing: '0.45em' },
      { xPercent: 0, letterSpacing: '-0.01em', duration: len * 0.5, ease: 'power2.out' }, pos(len * 0.12));
    // The logo turns like a gear the whole way through and grows into place.
    tl.fromTo($$('[data-dr-logo]', panel!), { rotation: -150, scale: 0.72 }, { rotation: 210, scale: 1, duration: len, ease: 'none' }, at);
    // The enlarger comes into focus and the safelight warms up.
    tl.fromTo(neg!, { '--dr-blur': '10px', '--glow': 0.45 }, { '--dr-blur': '0px', '--glow': 0.95, duration: len * 0.5, ease: 'power1.out' }, at);
    // Development timer.
    tl.fromTo(clock, { p: 0 }, { p: 1, duration: len, ease: 'none', onUpdate: () => setTimer(clock.p) }, at);
    // The aperture opens from the centre onto the print.
    tl.fromTo(aperture, { a: 0 }, { a: 1, duration: len * 0.45, ease: 'power2.in', onUpdate: () => setAperture(aperture.a, W, H) }, pos(len * 0.55));
  };

  return { ready, panel, state, addTo, reset };
}

export type Darkroom = ReturnType<typeof createDarkroom>;
