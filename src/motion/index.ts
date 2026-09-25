import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initAbout } from './about';
import { initClock } from './clock';
import { createDarkroom } from './darkroom';
import { $, $$, createDisposer, isDesktop, prefersReducedMotion } from './dom';
import { playEntrance, prepEntrance } from './enter';
import { initExperience, initServices, initWorkHover } from './hovers';
import { runIntro } from './intro';
import { createMenu } from './menu';
import { createRail } from './rail';
import { initReveals } from './reveals';
import { createScroll } from './scroll';
import { createStory } from './story';
import { createTransitions } from './transitions';
import { createWorkWindow } from './work-window';
import { initWorks } from './works';

/** Resolves when web fonts are ready (or after 2.5 s), so measurements are final. */
const whenFontsReady = () => new Promise<void>((resolve) => {
  const timer = setTimeout(resolve, 2500);
  document.fonts.ready.then(() => { clearTimeout(timer); resolve(); });
});

/**
 * Starts every scroll and hover effect on the page and returns a function that
 * undoes all of it. Everything is found through data-* attributes, so the
 * components stay plain server-rendered markup, and each page only gets the
 * effects whose markup it contains.
 */
export function initMotion(): () => void {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const root = document.documentElement;
  const reduce = prefersReducedMotion();
  const motion = !reduce;
  const dispose = createDisposer();
  const ctx = gsap.context(() => {});
  const cleanups: Array<() => void> = [];
  let disposed = false;

  root.classList.add('motion-ready');

  // The work reel loops on its own; hold it still for visitors who prefer less motion.
  const reel = $<HTMLVideoElement>('[data-mw-video]');
  if (reel && reduce) { reel.removeAttribute('autoplay'); reel.pause(); }

  const scroll = createScroll({ smooth: motion, reduce });
  const transitions = createTransitions({ dispose, reduce });
  const workWindow = createWorkWindow();
  const darkroom = createDarkroom();
  /** Pages built as a sideways story (home, about) versus ordinary scrolling pages. */
  const hasStory = Boolean($('[data-pin]'));

  let story!: ReturnType<typeof createStory>;
  let rail!: ReturnType<typeof createRail>;
  let menu!: ReturnType<typeof createMenu>;

  ctx.add(() => {
    story = createStory({ reduce, scroll, workWindow, darkroom });
    cleanups.push(initWorks({ reduce }));
    rail = createRail({ dispose, workWindow, darkroom });
    menu = createMenu({ dispose, motion, reduce, scroll, rail, targetY: story.targetY });
    initWorkHover({ dispose, reduce, rail, isMenuOpen: menu.isOpen });
    cleanups.push(initExperience({ dispose }));
    cleanups.push(initServices({ reduce }));
    cleanups.push(initAbout({ dispose, reduce, storyTimeline: story.timeline }));
    initClock({ dispose });
    if (motion) prepEntrance();
  });

  // Keyboard users: bring a focused element's panel into view on desktop.
  const track = $('[data-track]');
  if (track) {
    dispose.on(track, 'focusin', (e) => {
      if (!isDesktop() || !story.trigger) return;
      const target = e.target as HTMLElement;
      const panel = target.closest<HTMLElement>('[data-panel]');
      if (!panel?.id) return;
      const r = target.getBoundingClientRect();
      if (r.left < 64 || r.right > window.innerWidth) scroll.scrollTo(story.targetY(panel.id), { immediate: reduce });
    });
  }

  // Old links to case studies (/#kiln) now go to the project's page.
  const hash = decodeURIComponent(window.location.hash.slice(1));
  if (hash && !document.getElementById(hash) && $(`a[href="/works/${CSS.escape(hash)}"]`)) {
    window.location.replace(`/works/${hash}`);
  }

  whenFontsReady().then(() => {
    if (disposed) return;
    ctx.add(() => {
      story.rebuild();
      ScrollTrigger.refresh();

      // Arriving at a section of the home page from another page (/#contact):
      // jump there while the page is still covered, before any reveal is set
      // up, so nothing plays or moves where the visitor can see it.
      const target = hash && document.getElementById(hash) ? hash : '';
      const jump = () => {
        if (!target) return;
        scroll.scrollTo(story.targetY(target), { immediate: true });
        ScrollTrigger.update();
      };

      if (!motion) {
        $('[data-clients-list]')?.setAttribute('data-interactive', '');
        jump();
        return;
      }
      if (root.classList.contains('is-intro')) {
        scroll.lock('intro', true);
        menu.bars('half');
        runIntro({
          rail: rail.element,
          openMenuIcon: (duration, ease) => menu.bars('full', duration, ease),
          onDone: () => {
            root.classList.remove('is-intro');
            if (rail.element) gsap.set(rail.element, { clearProps: 'opacity' });
            scroll.lock('intro', false);
            rail.request();
          },
        });
        cleanups.push(initReveals(hasStory ? story.timeline : null));
      } else {
        jump();
        cleanups.push(initReveals(hasStory ? story.timeline : null));
        // Let the browser paint the final position under the cover, then lift it.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (!disposed) transitions.enter(() => playEntrance());
        }));
      }
    });
  });

  return () => {
    disposed = true;
    dispose.dispose();
    cleanups.forEach((fn) => fn());
    story?.destroy();
    ctx.revert();
    ScrollTrigger.getAll().forEach((t) => t.kill());
    scroll.destroy();
    $$('[data-clients-list]').forEach((el) => el.removeAttribute('data-interactive'));
    root.classList.remove('motion-ready', 'menu-open');
  };
}
