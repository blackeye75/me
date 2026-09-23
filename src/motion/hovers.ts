import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, DESKTOP, type Disposer, isDesktop, MOBILE } from './dom';
import type { Rail } from './rail';

/** Chapter II: the hovered project's preview grows from the centre and the other names fade. */
export function initWorkHover({ dispose, reduce, rail, isMenuOpen }: { dispose: Disposer; reduce: boolean; rail: Rail; isMenuOpen: () => boolean }) {
  const list = $('[data-work-list]');
  if (!list) return;
  const items = $$('[data-work-item]', list);
  const imgs = $$('[data-work-img]');
  const placeholder = $('[data-work-ph]');
  const hovers = items.map((it) => $('[data-work-hover]', it));
  let active = -1;
  let token = 0;
  let pointer: { x: number; y: number } | null = null;

  gsap.set(imgs, { autoAlpha: 0, scale: 0 });

  const show = (i: number) => {
    if (!isDesktop() || i < 0 || i === active) return;
    active = i;
    const mine = ++token;
    if (placeholder) placeholder.style.opacity = '0';
    let z = 2;
    imgs.forEach((img, j) => {
      if (j !== i && Number(gsap.getProperty(img, 'autoAlpha')) > 0) {
        gsap.killTweensOf(img);
        gsap.set(img, { scale: 1, zIndex: z++ });
      }
    });
    const img = imgs[i];
    gsap.killTweensOf(img);
    gsap.set(img, { autoAlpha: 1, scale: reduce ? 1 : 0, zIndex: z + 1 });
    gsap.to(img, {
      scale: 1,
      duration: reduce ? 0 : 0.45,
      ease: 'power3.out',
      onComplete: () => {
        if (mine !== token) return;
        imgs.forEach((other, j) => { if (j !== i) gsap.set(other, { autoAlpha: 0, scale: 0, zIndex: 0 }); });
        gsap.set(img, { zIndex: 1 });
      },
    });
    items.forEach((it, j) => {
      it.toggleAttribute('data-dim', j !== i);
      it.toggleAttribute('data-active', j === i);
    });
    hovers.forEach((line, j) => {
      if (line) gsap.to(line, { scaleX: j === i ? 1 : 0, duration: j === i ? 1 : 0.3, ease: 'power3.out', overwrite: 'auto' });
    });
  };

  const hide = () => {
    if (active < 0) return;
    active = -1;
    const mine = ++token;
    if (placeholder) placeholder.style.opacity = '1';
    imgs.forEach((img) => {
      if (Number(gsap.getProperty(img, 'autoAlpha')) > 0) {
        gsap.to(img, { scale: 0, duration: reduce ? 0 : 0.45, ease: 'power3.out', overwrite: 'auto', onComplete: () => { if (mine === token) gsap.set(img, { autoAlpha: 0 }); } });
      }
    });
    items.forEach((it) => { it.removeAttribute('data-dim'); it.removeAttribute('data-active'); });
    gsap.to(hovers.filter(Boolean), { scaleX: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' });
  };

  items.forEach((it, i) => {
    dispose.on(it, 'pointerenter', (e) => { if ((e as PointerEvent).pointerType !== 'touch') show(i); });
    dispose.on(it, 'focusin', () => show(i));
  });
  dispose.on(list, 'pointerleave', hide);
  dispose.on(list, 'focusout', (e) => { if (!list.contains((e as FocusEvent).relatedTarget as Node | null)) hide(); });

  // The strip can move under a still cursor: keep the hover in step.
  dispose.on(window, 'pointermove', (e) => {
    const p = e as PointerEvent;
    if (p.pointerType !== 'touch') pointer = { x: p.clientX, y: p.clientY };
  }, { passive: true });
  rail.onFrame(() => {
    if (!pointer || !isDesktop() || isMenuOpen()) return;
    const el = document.elementFromPoint(pointer.x, pointer.y)?.closest<HTMLElement>('[data-work-item]');
    if (el) show(items.indexOf(el));
    else if (active >= 0 && !list.matches(':hover')) hide();
  });
}

/** Chapter IV: hovering a name fades the others (its logo tile is pure CSS). */
export function initExperienceHover({ dispose }: { dispose: Disposer }) {
  const list = $('[data-clients-list]');
  if (!list) return;
  const rows = $$('[data-client]:not([data-client-more])', list);
  rows.forEach((row, i) => {
    const on = () => {
      if (!isDesktop() || !list.hasAttribute('data-interactive')) return;
      rows.forEach((r, j) => {
        r.toggleAttribute('data-dim', j !== i);
        r.toggleAttribute('data-active', j === i);
      });
    };
    dispose.on(row, 'pointerenter', on);
    dispose.on(row, 'focusin', on);
  });
  dispose.on(list, 'pointerleave', () => rows.forEach((r) => { r.removeAttribute('data-dim'); r.removeAttribute('data-active'); }));
}

/** Chapter III: backgrounds wipe up on hover (desktop) or fade in while in view (phones). */
export function initServices({ reduce }: { reduce: boolean }) {
  const mm = gsap.matchMedia();
  const items = $$('[data-svc]');

  mm.add(DESKTOP, () => {
    const cleanups: Array<() => void> = [];
    items.forEach((svc) => {
      const bg = $('[data-svc-bg]', svc);
      const media = $('[data-svc-media]', svc);
      if (!bg || !media) return;
      const reset = () => { gsap.set(bg, { clipPath: 'inset(100% 0% 0% 0%)' }); gsap.set(media, { yPercent: 6 }); };
      const enter = () => {
        gsap.killTweensOf([bg, media]);
        if (reduce) { gsap.set(bg, { clipPath: 'inset(0% 0% 0% 0%)' }); return; }
        gsap.timeline()
          .to(bg, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'power3.out' }, 0)
          .to(media, { yPercent: -3, duration: 0.8, ease: 'power3.out' }, 0);
      };
      const leave = () => {
        gsap.killTweensOf([bg, media]);
        if (reduce) { reset(); return; }
        gsap.timeline({ onComplete: reset })
          .to(bg, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.8, ease: 'power3.out' }, 0)
          .to(media, { yPercent: -9, duration: 0.8, ease: 'power3.out' }, 0);
      };
      const focusOut = (e: FocusEvent) => { if (!svc.contains(e.relatedTarget as Node | null)) leave(); };
      reset();
      svc.addEventListener('pointerenter', enter);
      svc.addEventListener('pointerleave', leave);
      svc.addEventListener('focusin', enter);
      svc.addEventListener('focusout', focusOut);
      cleanups.push(() => {
        svc.removeEventListener('pointerenter', enter);
        svc.removeEventListener('pointerleave', leave);
        svc.removeEventListener('focusin', enter);
        svc.removeEventListener('focusout', focusOut);
        gsap.killTweensOf([bg, media]);
        gsap.set([bg, media], { clearProps: 'all' });
      });
    });
    return () => cleanups.forEach((fn) => fn());
  });

  mm.add(MOBILE, () => {
    const triggers: ScrollTrigger[] = [];
    items.forEach((svc) => {
      const bg = $('[data-svc-bg]', svc);
      const media = $('[data-svc-media]', svc);
      if (!bg || !media) return;
      if (reduce) { gsap.set(bg, { autoAlpha: 1 }); return; }
      gsap.set(bg, { autoAlpha: 0 });
      const tl = gsap.timeline({ paused: true })
        .to(bg, { autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, 0)
        .to(media, { scale: 1.2, duration: 0.8, ease: 'power3.out' }, 0);
      triggers.push(ScrollTrigger.create({ trigger: svc, start: 'bottom bottom', end: 'top top', toggleActions: 'play reverse play reverse', animation: tl }));
    });
    return () => triggers.forEach((st) => st.kill());
  });

  return () => mm.revert();
}
