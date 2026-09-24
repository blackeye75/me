import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, DESKTOP, MOBILE } from './dom';
import { prepImage, revealImage, revealLines, riseLines } from './reveal';

type SeenOptions = { hStart?: string; vStart?: string };

/**
 * Registers the reveal of every section. Each runs once, when its trigger
 * comes into view: sideways inside the story on desktop (when the page has
 * one), otherwise downwards.
 */
export function initReveals(storyTimeline: gsap.core.Timeline | null) {
  const mm = gsap.matchMedia();

  /** Reveals not yet played, so the end of the page can play any that never reached their start. */
  const pending = new Map<Element, () => void>();

  const whenSeen = (trigger: Element | null, run: () => void, { hStart = 'left 80%', vStart = 'top 80%' }: SeenOptions = {}) => {
    if (!trigger) return;
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      pending.delete(trigger);
      run();
    };
    pending.set(trigger, once);
    if (storyTimeline) {
      mm.add(DESKTOP, () => {
        const st = ScrollTrigger.create({ trigger, containerAnimation: storyTimeline, start: hStart, once: true, onEnter: once });
        return () => st.kill();
      });
    }
    mm.add(storyTimeline ? MOBILE : 'all', () => {
      const st = ScrollTrigger.create({ trigger, start: vStart, once: true, onEnter: once });
      return () => st.kill();
    });
  };

  // Home, Chapter I. Desktop: label, intro and quote rise in sequence, then the portrait.
  // Phones: the column is laid out without its wrapper box (display: contents),
  // so each part reveals as it scrolls into view, and so does the portrait.
  const about = $('[data-about]');
  const aboutParts = $$('[data-about-part]');
  const portrait = about ? $('[data-image-reveal]', about) : null;
  if (portrait) prepImage(portrait);
  if (about && storyTimeline) {
    let done = false;
    mm.add(DESKTOP, () => {
      const st = ScrollTrigger.create({
        trigger: about,
        containerAnimation: storyTimeline,
        start: 'left 80%',
        once: true,
        onEnter: () => {
          if (done) return;
          done = true;
          const tl = gsap.timeline();
          aboutParts.forEach((el, i) => tl.add(revealLines(el), i * 0.12));
          if (portrait) tl.add(revealImage(portrait), aboutParts.length * 0.12);
        },
      });
      return () => st.kill();
    });
    mm.add(MOBILE, () => {
      const triggers = [...aboutParts, ...(portrait ? [portrait] : [])].map((el) => ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          if (done) return;
          if (el === portrait) revealImage(portrait, { duration: 1 });
          else revealLines(el);
        },
      }));
      return () => triggers.forEach((st) => st.kill());
    });
  }

  // Other pictures wipe in on their own (the page's lead picture is part of its entrance).
  $$('[data-image-reveal]:not([data-enter-image])').forEach((shell) => {
    if (shell === portrait) return;
    prepImage(shell);
    whenSeen(shell, () => revealImage(shell, { duration: 0.9 }), { hStart: 'left 85%', vStart: 'top 85%' });
  });

  // Every other labelled line reveals on its own. Chapter III waits until further in.
  $$('[data-reveal]').forEach((el) => {
    const inServices = Boolean(el.closest('[data-services]'));
    whenSeen(el, () => revealLines(el), { hStart: inServices ? 'left 60%' : 'left 80%', vStart: 'top 88%' });
  });

  // Blocks that don't split into lines (metrics, code) fade up.
  $$('[data-fade]').forEach((el) => {
    whenSeen(el, () => gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }), { vStart: 'top 90%' });
  });

  // Home, Chapter II: names rise and the dividers draw.
  const workList = $('[data-work-list]');
  whenSeen(workList, () => {
    riseLines($$('[data-rise]', workList!), { duration: 1, stagger: 0.12 });
    gsap.to($$('[data-work-rule]', workList!), { scaleX: 1, duration: 1, ease: 'power3.out', stagger: 0.12 });
  }, { hStart: 'left 50%', vStart: 'top 85%' });

  // Home, Chapter IV: names rise one by one, "And more" last; hover works once they're in.
  const clientsList = $('[data-clients-list]');
  whenSeen(clientsList, () => {
    riseLines($$('[data-rise]', clientsList!), { stagger: 0.15 })
      .eventCallback('onComplete', () => clientsList!.setAttribute('data-interactive', ''));
  }, { hStart: 'left 75%', vStart: 'top 85%' });

  // Titles set in masks (About: "Career journey") and timeline rows.
  $$('h2 [data-rise]').forEach((line) => {
    if (line.closest('[data-rows], [data-work-list], [data-clients-list], [data-footer]')) return;
    whenSeen(line.closest('h2'), () => riseLines([line], { duration: 1.4 }), { hStart: 'left 80%' });
  });
  $$('[data-rows]').forEach((rows) => {
    whenSeen(rows, () => {
      riseLines($$('[data-rise]', rows), { duration: 1.1, stagger: 0.06 });
      gsap.to($$('[data-row-rule]', rows), { scaleX: 1, duration: 1.2, ease: 'power3.out', stagger: 0.1 });
    }, { hStart: 'left 70%', vStart: 'top 85%' });
  });

  // Footer: the title rises word by word, then the contact lines.
  const footer = $('[data-footer]');
  whenSeen(footer, () => {
    gsap.fromTo($$('[data-ft-word]', footer!), { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1.7, ease: 'power3.out', stagger: 0.2 });
    gsap.fromTo($$('[data-ft-line]', footer!), { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.6 });
  }, { hStart: 'left 60%', vStart: 'top 70%' });

  // Things near the right or bottom edge of the last screen may never reach their
  // start line; once the page can't scroll further, reveal whatever is on screen.
  const atEnd = ScrollTrigger.create({
    start: () => ScrollTrigger.maxScroll(window) - 2,
    end: 'max',
    onEnter: () => pending.forEach((run, el) => {
      const r = el.getBoundingClientRect();
      if (r.left < window.innerWidth && r.right > 0 && r.top < window.innerHeight && r.bottom > 0) run();
    }),
  });

  ScrollTrigger.refresh();
  return () => { atEnd.kill(); mm.revert(); };
}
