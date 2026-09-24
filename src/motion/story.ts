import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Darkroom } from './darkroom';
import { $, debounce, DESKTOP, isDesktop, MOBILE } from './dom';
import type { Scroll } from './scroll';
import type { WorkWindow } from './work-window';

type Pause = { at: number; len: number };

/**
 * The horizontal story.
 *
 * Desktop: the whole page is one pinned strip that scrolls sideways. It holds
 * still twice: once while "The Work" window opens (one screen height) and once
 * for the darkroom (1.6 screen heights).
 * Phones: panels stack vertically; those two sections pin in place instead.
 */
export function createStory({ reduce, scroll, workWindow, darkroom }: {
  reduce: boolean;
  scroll: Scroll;
  workWindow: WorkWindow;
  darkroom: Darkroom;
}) {
  const pin = $('[data-pin]');
  const track = $('[data-track]');
  /** One timeline for the sideways journey. Other triggers use it as their container. */
  const timeline = gsap.timeline({ defaults: { ease: 'none' } });
  let trigger: ScrollTrigger | null = null;
  let pauses: Pause[] = [];
  let rebuild = () => {};
  const mm = gsap.matchMedia();

  if (pin && track) {
    mm.add(DESKTOP, () => {
      const box = { t: 0 };

      const build = () => {
        const progress = trigger ? trigger.progress : null;
        trigger?.kill(true);
        timeline.clear();
        gsap.set(track, { clearProps: 'transform' });
        workWindow.reset();
        darkroom.reset();

        const vw = pin.clientWidth;
        const vh = pin.clientHeight;
        const maxX = Math.max(0, track.scrollWidth - vw);

        if (reduce || !workWindow.ready) {
          timeline.fromTo(track, { x: 0 }, { x: -maxX, duration: maxX });
          pauses = [];
          trigger = ScrollTrigger.create({ trigger: pin, animation: timeline, start: 'top top', end: `+=${maxX}`, pin: true, scrub: true, anticipatePin: 1 });
        } else {
          const size = workWindow.measure(false);
          const mw = workWindow.panel!;
          const dr = darkroom.panel;
          const before = Math.max(0, mw.offsetLeft - (vw - mw.offsetWidth) / 2);
          const pause = vh;
          const drAt = dr && darkroom.ready ? Math.max(before, dr.offsetLeft - (vw - dr.offsetWidth) / 2) : maxX;
          const drPause = dr && darkroom.ready ? vh * 1.6 : 0;

          box.t = 0;
          workWindow.set(0, size);
          timeline
            .fromTo(track, { x: 0 }, { x: -before, duration: before })
            .addLabel('expand')
            .fromTo(box, { t: 0 }, { t: 1, duration: pause, onUpdate: () => workWindow.set(box.t, size) }, 'expand')
            .fromTo(track, { x: -before }, { x: -drAt, duration: drAt - before })
            .addLabel('darkroom');
          darkroom.addTo(timeline, 'darkroom', drPause);
          timeline.fromTo(track, { x: -drAt }, { x: -maxX, duration: Math.max(0, maxX - drAt) }, `darkroom+=${drPause}`);

          pauses = [{ at: before, len: pause }, { at: drAt, len: drPause }];
          trigger = ScrollTrigger.create({
            trigger: pin,
            animation: timeline,
            start: 'top top',
            end: `+=${maxX + pause + drPause}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            refreshPriority: 1,
          });
        }

        ScrollTrigger.refresh();
        if (progress !== null) scroll.scrollTo(trigger.start + (trigger.end - trigger.start) * progress, { immediate: true });
      };

      build();
      rebuild = build;

      // Rebuild whenever the visible size changes, including when a scrollbar
      // appears or disappears (which doesn't fire a resize event).
      let lastWidth = pin.clientWidth;
      let lastHeight = window.innerHeight;
      const onResize = debounce(() => {
        if (pin.clientWidth === lastWidth && Math.abs(window.innerHeight - lastHeight) < 2) return;
        lastWidth = pin.clientWidth;
        lastHeight = window.innerHeight;
        build();
      }, 150);
      window.addEventListener('resize', onResize);
      const observer = new ResizeObserver(onResize);
      observer.observe(document.body);

      return () => {
        onResize.cancel();
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        rebuild = () => {};
        trigger?.kill(true);
        trigger = null;
        timeline.clear();
        gsap.set(track, { clearProps: 'all' });
        workWindow.reset();
        darkroom.reset();
      };
    });

    mm.add(MOBILE, () => {
      if (reduce) return undefined;
      let windowTrigger: ScrollTrigger | null = null;
      let windowTl: gsap.core.Timeline | null = null;
      let darkroomTrigger: ScrollTrigger | null = null;
      let darkroomTl: gsap.core.Timeline | null = null;
      const box = { t: 0 };

      const build = () => {
        windowTrigger?.kill(true);
        windowTl?.kill();
        darkroomTrigger?.kill(true);
        darkroomTl?.kill();
        workWindow.reset();
        darkroom.reset();

        // The panels sit in a flex column, where pin spacing is off by default; switch it on.
        // These pins are rebuilt after other triggers exist, so they measure first
        // (refreshPriority) and everything below accounts for their extra scroll.
        if (workWindow.ready) {
          const size = workWindow.measure(true);
          box.t = 0;
          workWindow.set(0, size);
          windowTl = gsap.timeline({ defaults: { ease: 'none' } })
            .fromTo(box, { t: 0 }, { t: 1, onUpdate: () => workWindow.set(box.t, size) });
          windowTrigger = ScrollTrigger.create({ trigger: workWindow.panel, animation: windowTl, start: 'top top', end: `+=${size.H}`, pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, refreshPriority: 1 });
        }
        if (darkroom.ready) {
          const len = darkroom.panel!.clientHeight * 1.6;
          darkroomTl = gsap.timeline({ defaults: { ease: 'none' } });
          darkroom.addTo(darkroomTl, 0, len);
          darkroomTrigger = ScrollTrigger.create({ trigger: darkroom.panel, animation: darkroomTl, start: 'top top', end: `+=${len}`, pin: true, pinSpacing: true, scrub: true, anticipatePin: 1, refreshPriority: 1 });
        }
      };

      build();
      rebuild = build;
      let lastWidth = window.innerWidth;
      const onResize = debounce(() => {
        if (window.innerWidth === lastWidth) return; // ignore the mobile address bar
        lastWidth = window.innerWidth;
        build();
        ScrollTrigger.refresh();
      }, 150);
      window.addEventListener('resize', onResize);

      return () => {
        onResize.cancel();
        window.removeEventListener('resize', onResize);
        rebuild = () => {};
        windowTrigger?.kill(true);
        windowTl?.kill();
        darkroomTrigger?.kill(true);
        darkroomTl?.kill();
        workWindow.reset();
        darkroom.reset();
      };
    });
  }

  /** Scroll position that brings the panel with this id into view. */
  const targetY = (id: string) => {
    const el = document.getElementById(id);
    if (!el || id === 'top') return 0;
    if (isDesktop() && trigger) {
      const left = el.offsetLeft;
      const held = pauses.reduce((sum, p) => (left > p.at ? sum + p.len : sum), 0);
      return trigger.start + left + held;
    }
    return el.getBoundingClientRect().top + window.scrollY - (isDesktop() ? 0 : ($('[data-rail]')?.offsetHeight ?? 64));
  };

  return {
    timeline,
    get trigger() { return trigger; },
    rebuild: () => rebuild(),
    targetY,
    destroy: () => {
      mm.revert();
      timeline.kill();
    },
  };
}

export type Story = ReturnType<typeof createStory>;
