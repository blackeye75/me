import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, DESKTOP, MOBILE } from './dom';
import { prepImage, revealImage, revealLines, riseLines } from './reveal';

type SeenOptions = { hStart?: string; vStart?: string };

/**
 * Registers the reveal of every section. Each runs once, when its trigger
 * comes into view: sideways inside the story on desktop, downwards on phones.
 */
export function initReveals(storyTimeline: gsap.core.Timeline) {
  const mm = gsap.matchMedia();

  const whenSeen = (trigger: Element | null, run: () => void, { hStart = 'left 80%', vStart = 'top 80%' }: SeenOptions = {}) => {
    if (!trigger) return;
    let done = false;
    const once = () => {
      if (done) return;
      done = true;
      run();
    };
    mm.add(DESKTOP, () => {
      const st = ScrollTrigger.create({ trigger, containerAnimation: storyTimeline, start: hStart, once: true, onEnter: once });
      return () => st.kill();
    });
    mm.add(MOBILE, () => {
      const st = ScrollTrigger.create({ trigger, start: vStart, once: true, onEnter: once });
      return () => st.kill();
    });
  };

  // Chapter I: label, intro and quote rise in sequence, then the portrait.
  const aboutParts = $$('[data-about-part]');
  const portrait = $('[data-image-reveal]');
  if (portrait) prepImage(portrait);
  whenSeen($('[data-about]'), () => {
    const tl = gsap.timeline();
    aboutParts.forEach((el, i) => tl.add(revealLines(el), i * 0.12));
    if (portrait) tl.add(revealImage(portrait), aboutParts.length * 0.12);
  });

  // Every other labelled line reveals on its own. Chapter III waits until further in.
  $$('[data-reveal]').forEach((el) => {
    const inServices = Boolean(el.closest('[data-services]'));
    whenSeen(el, () => revealLines(el), { hStart: inServices ? 'left 60%' : 'left 80%' });
  });

  // Chapter II: names rise and the dividers draw.
  const workList = $('[data-work-list]');
  whenSeen(workList, () => {
    riseLines($$('[data-rise]', workList!), { duration: 1, stagger: 0.12 });
    gsap.to($$('[data-work-rule]', workList!), { scaleX: 1, duration: 1, ease: 'power3.out', stagger: 0.12 });
  }, { hStart: 'left 50%', vStart: 'top 85%' });

  // Chapter IV: names rise one by one, "And more" last; hover works once they're in.
  const clientsList = $('[data-clients-list]');
  whenSeen(clientsList, () => {
    riseLines($$('[data-rise]', clientsList!), { stagger: 0.15 })
      .eventCallback('onComplete', () => clientsList!.setAttribute('data-interactive', ''));
  }, { hStart: 'left 75%', vStart: 'top 85%' });

  // Footer: the title rises word by word, then the contact lines.
  const footer = $('[data-footer]');
  whenSeen(footer, () => {
    gsap.fromTo($$('[data-ft-word]', footer!), { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1.7, ease: 'power3.out', stagger: 0.2 });
    gsap.fromTo($$('[data-ft-line]', footer!), { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.6 });
  }, { hStart: 'left 60%', vStart: 'top 70%' });

  ScrollTrigger.refresh();
  return () => mm.revert();
}
