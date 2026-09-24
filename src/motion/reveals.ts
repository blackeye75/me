import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, DESKTOP, MOBILE } from './dom';
import { prepImage, revealImage, revealLines, riseLines } from './reveal';

type Reveal = {
  /** Plays the reveal and returns its animation, so it can be finished early. */
  play: () => gsap.core.Animation | void;
  /** Puts the element back in its hidden state. Only runs while it is off screen. */
  hide: () => void;
  /** Removes the hidden state, for when the screen changes to a size this reveal doesn't run at. */
  clear?: () => void;
};

type WatchOptions = {
  hStart?: string;
  vStart?: string;
  /** Already on screen and revealed (by the page's entrance). */
  shown?: boolean;
  /** Only watch at this media query. */
  media?: string;
};

/* Hidden states, matching what each reveal animates from. */
const hideLines = (el: Element) => gsap.set(el, { opacity: 0 });
const hideRise = (els: Element[]) => { if (els.length) gsap.set(els, { yPercent: 102, opacity: 1 }); };
const hideRules = (els: Element[]) => { if (els.length) gsap.set(els, { scaleX: 0 }); };
const hideImage = (shell: Element) => {
  prepImage(shell);
  const overlay = $('[data-ir-overlay]', shell);
  if (overlay) gsap.set(overlay, { autoAlpha: 0 });
};

/**
 * Registers the reveal of every section. Each reveal plays when its element
 * comes into view, from either direction, and resets once the element is fully
 * off screen, so it plays again the next time. Sideways inside the story on
 * desktop (when the page has one), otherwise downwards.
 */
export function initReveals(storyTimeline: gsap.core.Timeline | null) {
  const mm = gsap.matchMedia();
  /** Every watched element and whether it is currently revealed. */
  const watched = new Map<Element, { shown: () => boolean; show: () => void }>();

  const watch = (trigger: Element | null, reveal: Reveal, { hStart = 'left 80%', vStart = 'top 80%', shown = false, media }: WatchOptions = {}) => {
    if (!trigger) return;
    let visible = shown;
    let anim: gsap.core.Animation | void;
    const show = () => {
      if (visible) return;
      visible = true;
      anim = reveal.play();
    };
    const reset = () => {
      if (!visible) return;
      visible = false;
      // Finish first, so anything the reveal set up (split lines) is put back.
      if (anim) { anim.progress(1, false); anim.kill(); anim = undefined; }
      reveal.hide();
    };
    watched.set(trigger, { shown: () => visible, show });

    // Coming back, a reveal plays as soon as the element clears the rail or header
    // (8%), a line even the first things on a page can reach.
    const sideways = (): ScrollTrigger[] => [
      ScrollTrigger.create({ trigger, containerAnimation: storyTimeline!, start: hStart, end: 'right 8%', onEnter: show, onEnterBack: show }),
      ScrollTrigger.create({ trigger, containerAnimation: storyTimeline!, start: 'left right', end: 'right left', onLeave: reset, onLeaveBack: reset }),
    ];
    const downwards = (): ScrollTrigger[] => [
      ScrollTrigger.create({ trigger, start: vStart, end: 'bottom 8%', onEnter: show, onEnterBack: show }),
      ScrollTrigger.create({ trigger, start: 'top bottom', end: 'bottom top', onLeave: reset, onLeaveBack: reset }),
    ];
    // Hidden from the start where the reveal runs, so nothing shows before it plays.
    const start = (create: () => ScrollTrigger[]) => {
      if (!visible) reveal.hide();
      const sts = create();
      return () => sts.forEach((st) => st.kill());
    };
    if (media) {
      mm.add(media, () => {
        const stop = start(media === DESKTOP && storyTimeline ? sideways : downwards);
        return () => { stop(); if (!visible) reveal.clear?.(); };
      });
    }
    else if (storyTimeline) {
      mm.add(DESKTOP, () => start(sideways));
      mm.add(MOBILE, () => start(downwards));
    } else mm.add('all', () => start(downwards));
  };

  const lines = (el: Element): Reveal => ({ play: () => revealLines(el), hide: () => hideLines(el) });
  const image = (shell: Element, duration = 0.9): Reveal => ({ play: () => revealImage(shell, { duration }), hide: () => hideImage(shell) });

  // Home, Chapter I. Desktop: label, intro and quote rise in sequence, then the portrait.
  // Phones: the column is laid out without its wrapper box (display: contents),
  // so each part reveals as it scrolls into view, and so does the portrait.
  const about = $('[data-about]');
  const aboutParts = $$('[data-about-part]');
  const portrait = about ? $('[data-image-reveal]', about) : null;
  if (portrait) prepImage(portrait);
  if (about && storyTimeline) {
    watch(about, {
      play: () => {
        const tl = gsap.timeline();
        aboutParts.forEach((el, i) => tl.add(revealLines(el), i * 0.12));
        if (portrait) tl.add(revealImage(portrait), aboutParts.length * 0.12);
        return tl;
      },
      hide: () => {
        aboutParts.forEach(hideLines);
        if (portrait) hideImage(portrait);
      },
    }, { media: DESKTOP });
    aboutParts.forEach((el) => watch(el, lines(el), { vStart: 'top 88%', media: MOBILE }));
    if (portrait) watch(portrait, image(portrait, 1), { vStart: 'top 88%', media: MOBILE });
  }

  // Other pictures wipe in on their own (the page's lead picture is part of its entrance).
  $$('[data-image-reveal]:not([data-enter-image])').forEach((shell) => {
    if (shell === portrait) return;
    prepImage(shell);
    watch(shell, image(shell), { hStart: 'left 85%', vStart: 'top 85%' });
  });

  // Every other labelled line reveals on its own. Chapter III waits until further in.
  $$('[data-reveal]').forEach((el) => {
    const inServices = Boolean(el.closest('[data-services]'));
    watch(el, lines(el), { hStart: inServices ? 'left 60%' : 'left 80%', vStart: 'top 88%' });
  });

  // Blocks that don't split into lines (metrics, code) fade up.
  $$('[data-fade]').forEach((el) => {
    watch(el, {
      play: () => gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }),
      hide: () => gsap.set(el, { opacity: 0 }),
    }, { vStart: 'top 90%' });
  });

  // Home, Chapter II: names rise and the dividers draw.
  const workList = $('[data-work-list]');
  if (workList) {
    const names = $$('[data-rise]', workList);
    const rules = $$('[data-work-rule]', workList);
    watch(workList, {
      play: () => gsap.timeline()
        .add(riseLines(names, { duration: 1, stagger: 0.12 }), 0)
        .to(rules, { scaleX: 1, duration: 1, ease: 'power3.out', stagger: 0.12 }, 0),
      hide: () => { hideRise(names); hideRules(rules); },
    }, { hStart: 'left 50%', vStart: 'top 85%' });
  }

  // Home, Chapter IV: names rise one by one, "And more" last; hover works once they're in.
  const clientsList = $('[data-clients-list]');
  if (clientsList) {
    const names = $$('[data-rise]', clientsList);
    watch(clientsList, {
      play: () => riseLines(names, { stagger: 0.15 }).eventCallback('onComplete', () => clientsList.setAttribute('data-interactive', '')),
      hide: () => hideRise(names),
    }, { hStart: 'left 75%', vStart: 'top 85%' });
  }

  // Titles set in masks (About: "Career journey") and timeline rows.
  $$('h2 [data-rise]').forEach((line) => {
    if (line.closest('[data-rows], [data-work-list], [data-clients-list], [data-footer]')) return;
    watch(line.closest('h2'), { play: () => riseLines([line], { duration: 1.4 }), hide: () => hideRise([line]) });
  });
  $$('[data-rows]').forEach((rows) => {
    const cells = $$('[data-rise]', rows);
    const rules = $$('[data-row-rule]', rows);
    watch(rows, {
      play: () => gsap.timeline()
        .add(riseLines(cells, { duration: 1.1, stagger: 0.06 }), 0)
        .to(rules, { scaleX: 1, duration: 1.2, ease: 'power3.out', stagger: 0.1 }, 0),
      hide: () => { hideRise(cells); hideRules(rules); },
    }, { hStart: 'left 70%', vStart: 'top 85%' });
  });

  // Footer: the title rises word by word, then the contact lines.
  const footer = $('[data-footer]');
  if (footer) {
    const words = $$('[data-ft-word]', footer);
    const contact = $$('[data-ft-line]', footer);
    watch(footer, {
      play: () => gsap.timeline()
        .fromTo(words, { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1.7, ease: 'power3.out', stagger: 0.2 }, 0)
        .fromTo(contact, { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12 }, 0.6),
      hide: () => hideRise([...words, ...contact]),
    }, { hStart: 'left 60%', vStart: 'top 70%' });
  }

  // Works page on phones: each card's picture opens upwards as it scrolls in.
  $$('[data-work-card] [data-card-media]').forEach((media) => {
    watch(media, {
      play: () => gsap.fromTo(media, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power3.out' }),
      hide: () => gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' }),
      clear: () => gsap.set(media, { clearProps: 'clipPath' }),
    }, { vStart: 'top 88%', media: MOBILE });
  });

  // What the page's entrance revealed replays too, once it has left the screen and comes back.
  $$('[data-enter]').forEach((el) => watch(el, lines(el), { shown: true }));
  $$('[data-enter-line]').forEach((line) => watch(line.parentElement, { play: () => riseLines([line], { duration: 1.4 }), hide: () => hideRise([line]) }, { shown: true }));
  $$('[data-enter-rows]').forEach((list) => {
    const rows = Array.from(list.children);
    watch(list, {
      play: () => gsap.fromTo(rows, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.06 }),
      hide: () => gsap.set(rows, { opacity: 0 }),
    }, { shown: true });
  });
  $$('[data-enter-image]').forEach((shell) => watch(shell, image(shell), { shown: true }));

  // Things near the right or bottom edge of the last screen may never reach their
  // start line; once the page can't scroll further, reveal whatever is on screen.
  const atEnd = ScrollTrigger.create({
    start: () => ScrollTrigger.maxScroll(window) - 2,
    end: 'max',
    onEnter: () => watched.forEach(({ shown, show }, el) => {
      if (shown()) return;
      const r = el.getBoundingClientRect();
      if (r.left < window.innerWidth && r.right > 0 && r.top < window.innerHeight && r.bottom > 0) show();
    }),
  });

  ScrollTrigger.refresh();
  return () => { atEnd.kill(); mm.revert(); };
}
