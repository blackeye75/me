/* Folio — developer edition
   Motion: GSAP + ScrollTrigger + SplitText, smooth scrolling by Lenis.
   Desktop: the whole story is one pinned strip that scrolls sideways.
   Phones: panels stack vertically with the same reveals. */
(() => {
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const DESKTOP = '(min-width: 768px)';
  const MOBILE = '(max-width: 767px)';
  const isDesktop = () => matchMedia(DESKTOP).matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  const hasGsap = Boolean(gsap && ScrollTrigger);

  if (!hasGsap) root.classList.remove('has-h', 'motion', 'is-intro');
  root.classList.add('motion-ready');

  /* ------------------------------------------------------------------
     Smooth scrolling
     ------------------------------------------------------------------ */
  let lenis = null;
  if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
    if (SplitText) gsap.registerPlugin(SplitText);
    if (!reduce && Lenis) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1.08, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  const scrollToY = (y, { immediate = false } = {}) => {
    if (lenis) {
      lenis.scrollTo(y, { immediate, force: true, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    } else {
      window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });
    }
  };
  const lockScroll = (locked) => {
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  };

  /* ------------------------------------------------------------------
     Small things: year, clock, copy email
     ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  const clocks = $$('[data-clock]');
  if (clocks.length) {
    const options = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
    let format;
    try {
      format = new Intl.DateTimeFormat('en-GB', { ...options, timeZone: $('[data-timezone]')?.dataset.timezone });
    } catch {
      format = new Intl.DateTimeFormat('en-GB', options);
    }
    const tick = () => { const t = format.format(new Date()); clocks.forEach((el) => { el.textContent = t; }); };
    tick();
    setInterval(tick, 10000);
  }

  const copyStatus = $('[data-copy-status]');
  $$('[data-copy]').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      let copied = true;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
      } catch {
        copied = false;
        const target = $('[data-email]');
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          getSelection().removeAllRanges();
          getSelection().addRange(range);
        }
      }
      btn.textContent = copied ? 'Copied' : 'Press Ctrl+C';
      if (copyStatus) copyStatus.textContent = copied ? 'Email address copied' : 'Email address selected';
      setTimeout(() => { btn.textContent = label; }, 2200);
    });
  });

  /* ------------------------------------------------------------------
     Horizontal story (desktop) and "The work" expansion
     ------------------------------------------------------------------ */
  const pin = $('[data-pin]');
  const track = $('[data-track]');
  const mw = $('[data-mw]');
  const rect = $('[data-mw-rect]');
  const inner = $('[data-mw-inner]');
  const wordA = $('[data-mw-a]');
  const wordB = $('[data-mw-b]');

  // One timeline for the whole sideways journey. Inner triggers use it as their container.
  const hTl = hasGsap ? gsap.timeline({ defaults: { ease: 'none' } }) : null;
  let hST = null;
  const seg = { pause: 0, before: 0 };   // scroll distances, used to jump to a panel
  let rebuild = () => {};

  const debounce = (fn, ms) => { let id; return () => { clearTimeout(id); id = setTimeout(fn, ms); }; };
  const gapOf = (el, prop) => parseFloat(getComputedStyle(el)[prop]) || 0;

  if (hasGsap) {
    const mm = gsap.matchMedia();

    mm.add(DESKTOP, () => {
      const build = () => {
        const progress = hST ? hST.progress : null;
        hST?.kill(true);
        hTl.clear();
        gsap.set([track, rect, wordA, wordB, inner], { clearProps: 'transform' });

        const vw = pin.clientWidth;
        const vh = pin.clientHeight;
        const maxX = Math.max(0, track.scrollWidth - vw);
        const rw = rect.offsetWidth;
        const rh = rect.offsetHeight;
        const cover = Math.max((vw + 8) / rw, (vh + 8) / rh);
        gsap.set(inner, { width: vw, height: vh, xPercent: -50, yPercent: -50, scale: 1 / cover });

        if (reduce) {
          gsap.set(rect, { scale: 1 });
          hTl.fromTo(track, { x: 0 }, { x: -maxX, duration: maxX });
          seg.before = Infinity;
          seg.pause = 0;
          hST = ScrollTrigger.create({ trigger: pin, animation: hTl, start: 'top top', end: `+=${maxX}`, pin: true, scrub: true, anticipatePin: 1 });
        } else {
          // Slide until "The work" is centred, pause while the rectangle fills the screen, then carry on.
          const before = Math.max(0, mw.offsetLeft - (vw - mw.offsetWidth) / 2);
          const pause = vh;
          const after = Math.max(0, maxX - before);
          const gap = gapOf(rect.parentElement, 'columnGap');
          const half = rw / 2;
          const halfCover = (rw * cover) / 2;

          gsap.set(rect, { scale: 0, transformOrigin: '50% 50%' });
          hTl
            .fromTo(track, { x: 0 }, { x: -before, duration: before })
            .addLabel('expand')
            .fromTo(rect, { scale: 0 }, { scale: cover, duration: pause }, 'expand')
            .fromTo(wordA, { x: half + gap / 2 }, { x: half - halfCover, duration: pause }, 'expand')
            .fromTo(wordB, { x: -(half + gap / 2) }, { x: halfCover - half, duration: pause }, 'expand')
            .fromTo(track, { x: -before }, { x: -maxX, duration: after });

          seg.before = before;
          seg.pause = pause;
          hST = ScrollTrigger.create({
            trigger: pin,
            animation: hTl,
            start: 'top top',
            end: `+=${before + pause + after}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            refreshPriority: 1,
          });
        }

        ScrollTrigger.refresh();
        if (progress !== null) scrollToY(hST.start + (hST.end - hST.start) * progress, { immediate: true });
      };

      build();
      rebuild = build;
      let lastWidth = innerWidth;
      const onResize = debounce(() => {
        if (innerWidth === lastWidth && Math.abs(pin.clientHeight - innerHeight) < 2) return;
        lastWidth = innerWidth;
        build();
      }, 150);
      addEventListener('resize', onResize);

      return () => {
        removeEventListener('resize', onResize);
        rebuild = () => {};
        hST?.kill(true);
        hST = null;
        hTl.clear();
        gsap.set([track, rect, wordA, wordB, inner], { clearProps: 'all' });
      };
    });

    mm.add(MOBILE, () => {
      if (reduce) return undefined;
      let st = null;
      let tl = null;
      const build = () => {
        st?.kill(true);
        tl?.kill();
        gsap.set([rect, wordA, wordB, inner], { clearProps: 'transform' });
        const w = mw.offsetWidth;
        const h = mw.offsetHeight;
        const rw = rect.offsetWidth;
        const rh = rect.offsetHeight;
        const cover = Math.max((w + 8) / rw, (h + 8) / rh);
        const gap = gapOf(rect.parentElement, 'rowGap');
        const half = rh / 2;
        const halfCover = (rh * cover) / 2;
        gsap.set(inner, { width: w, height: h, xPercent: -50, yPercent: -50, scale: 1 / cover });
        gsap.set(rect, { scale: 0 });
        tl = gsap.timeline({ defaults: { ease: 'none' } })
          .fromTo(rect, { scale: 0 }, { scale: cover }, 0)
          .fromTo(wordA, { y: half + gap / 2 }, { y: half - halfCover }, 0)
          .fromTo(wordB, { y: -(half + gap / 2) }, { y: halfCover - half }, 0);
        st = ScrollTrigger.create({ trigger: mw, animation: tl, start: 'top top', end: `+=${h}`, pin: true, scrub: true, anticipatePin: 1 });
      };
      build();
      rebuild = build;
      let lastWidth = innerWidth;
      const onResize = debounce(() => {
        if (innerWidth === lastWidth) return;   // ignore the mobile address bar
        lastWidth = innerWidth;
        build();
        ScrollTrigger.refresh();
      }, 150);
      addEventListener('resize', onResize);
      return () => {
        removeEventListener('resize', onResize);
        rebuild = () => {};
        st?.kill(true);
        tl?.kill();
        gsap.set([rect, wordA, wordB, inner], { clearProps: 'all' });
      };
    });

    document.fonts?.ready.then(() => { rebuild(); ScrollTrigger.refresh(); });
  }

  /* ------------------------------------------------------------------
     Reveal helpers
     ------------------------------------------------------------------ */

  // Lines rise out of a mask, one after another.
  const revealLines = (el, { duration = 1.7, stagger = 0.07, ease = 'power3.out' } = {}) => {
    const tl = gsap.timeline();
    tl.set(el, { opacity: 1 }, 0);
    if (!SplitText) {
      tl.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: duration * 0.6, ease }, 0);
      return tl;
    }
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    tl.fromTo(split.lines, { yPercent: 102 }, { yPercent: 0, duration, ease, stagger }, 0);
    tl.call(() => split.revert());
    return tl;
  };

  // Pre-wrapped single lines ([data-line] inside .mask).
  const riseLines = (els, { duration = 1.7, stagger = 0.07, ease = 'power3.out' } = {}) =>
    gsap.fromTo(els, { yPercent: 102, opacity: 1 }, { yPercent: 0, duration, ease, stagger, force3D: true });

  // A colour block wipes in from the left, then the image slides in over it.
  const prepImage = (shell) => {
    gsap.set($('[data-ir-media]', shell), { clipPath: 'inset(0% 100% 0% 0%)', xPercent: -10 });
  };
  const revealImage = (shell, { duration = 0.7, delay = 0.2, ease = 'power2.out' } = {}) => {
    const overlay = $('[data-ir-overlay]', shell);
    const media = $('[data-ir-media]', shell);
    gsap.set(overlay, { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' });
    return gsap.timeline({ onComplete: () => gsap.set(overlay, { autoAlpha: 0 }) })
      .to(overlay, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease }, 0)
      .to(media, { clipPath: 'inset(0% 0% 0% 0%)', xPercent: 0, duration, ease }, delay);
  };

  // Run fn once when trigger comes into view: sideways on desktop, downwards on phones.
  const whenSeen = (trigger, fn, { hStart = 'left 80%', vStart = 'top 80%' } = {}) => {
    let done = false;
    const run = () => { if (!done) { done = true; fn(); } };
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      const st = ScrollTrigger.create({ trigger, containerAnimation: hTl, start: hStart, once: true, onEnter: run });
      return () => st.kill();
    });
    mm.add(MOBILE, () => {
      const st = ScrollTrigger.create({ trigger, start: vStart, once: true, onEnter: run });
      return () => st.kill();
    });
  };

  /* ------------------------------------------------------------------
     Section motion
     ------------------------------------------------------------------ */
  const rail = $('[data-rail]');
  const workList = $('[data-work-list]');
  const clientsList = $('[data-clients-list]');

  if (hasGsap && !reduce) {
    // Intro: the years roll up to today, then the name slides in (first visit only).
    if (root.classList.contains('is-intro')) {
      const stack = $('[data-hero-stack]');
      const strip = $('[data-years]');
      const heroTexts = $$('[data-hero-text]');
      const steps = strip.children.length;
      lockScroll(true);
      gsap.timeline({
        delay: 0.2,
        onComplete: () => {
          root.classList.remove('is-intro');
          gsap.set([stack, rail], { clearProps: 'transform,opacity' });
          lockScroll(false);
        },
      })
        .to(strip, { yPercent: (-100 * (steps - 1)) / steps, duration: 2.85, ease: 'power4.inOut' })
        .to(stack, { yPercent: -50, duration: 1.78, ease: 'power4.inOut' }, '-=0.35')
        .add(() => heroTexts.forEach((el, i) => revealLines(el, { duration: 1.2 }).delay(i * 0.12)), '-=0.8')
        .to(rail, { opacity: 1, duration: 0.8, ease: 'power3.out' }, '<');
    }

    // Chapter I: label, intro and quote rise in sequence, then the portrait.
    const aboutParts = $$('[data-about-part]');
    const portrait = $('[data-image-reveal]');
    if (portrait) prepImage(portrait);
    whenSeen($('.about-right'), () => {
      const tl = gsap.timeline();
      aboutParts.forEach((el, i) => tl.add(revealLines(el), i * 0.12));
      if (portrait) tl.add(revealImage(portrait), aboutParts.length * 0.12);
    });

    // Every other labelled line reveals on its own.
    $$('[data-reveal]').forEach((el) => {
      const inServices = Boolean(el.closest('[data-services]'));
      whenSeen(el, () => revealLines(el), { hStart: inServices ? 'left 60%' : 'left 80%' });
    });

    // Chapter II: names rise and the dividers draw.
    whenSeen(workList, () => {
      riseLines($$('[data-line]', workList), { duration: 1, stagger: 0.12 });
      gsap.to($$('[data-work-rule]', workList), { scaleX: 1, duration: 1, ease: 'power3.out', stagger: 0.12 });
    }, { hStart: 'left 50%', vStart: 'top 85%' });

    // Chapter IV: names rise one by one, "And more" last at half strength.
    whenSeen(clientsList, () => {
      const lines = $$('[data-line]', clientsList);
      riseLines(lines, { stagger: 0.15 }).eventCallback('onComplete', () => clientsList.classList.add('is-interactive'));
    }, { hStart: 'left 75%', vStart: 'top 85%' });

    // Footer: the title rises word by word, then the contact lines.
    const footer = $('[data-footer]');
    whenSeen(footer, () => {
      gsap.fromTo($$('.ft-word', footer), { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: 1.6, ease: 'power4.out', stagger: 0.12 });
      gsap.fromTo($$('[data-ft-line]', footer), { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.5 });
    }, { hStart: 'left 60%', vStart: 'top 70%' });
  } else {
    clientsList?.classList.add('is-interactive');
  }

  /* ------------------------------------------------------------------
     Chapter II hover: preview grows from the centre, other names fade
     ------------------------------------------------------------------ */
  const workItems = $$('[data-work-item]');
  const workImgs = $$('[data-work-img]');
  const workPh = $('[data-work-ph]');
  const workHovers = workItems.map((it) => $('[data-work-hover]', it));
  let activeWork = -1;
  let workToken = 0;

  const showWork = (i) => {
    if (!hasGsap || !isDesktop() || i === activeWork) return;
    activeWork = i;
    const token = ++workToken;
    if (workPh) workPh.style.opacity = '0';
    let z = 2;
    workImgs.forEach((img, j) => {
      if (j !== i && gsap.getProperty(img, 'autoAlpha') > 0) {
        gsap.killTweensOf(img);
        gsap.set(img, { scale: 1, zIndex: z++ });
      }
    });
    const img = workImgs[i];
    gsap.killTweensOf(img);
    gsap.set(img, { autoAlpha: 1, scale: reduce ? 1 : 0, zIndex: z + 1 });
    gsap.to(img, {
      scale: 1,
      duration: reduce ? 0 : 0.45,
      ease: 'power3.out',
      onComplete: () => {
        if (token !== workToken) return;
        workImgs.forEach((other, j) => { if (j !== i) gsap.set(other, { autoAlpha: 0, scale: 0, zIndex: 0 }); });
        gsap.set(img, { zIndex: 1 });
      },
    });
    workItems.forEach((it, j) => {
      it.classList.toggle('is-dim', j !== i);
      it.classList.toggle('is-active', j === i);
    });
    workHovers.forEach((line, j) => {
      if (line) gsap.to(line, { scaleX: j === i ? 1 : 0, duration: j === i ? 1 : 0.3, ease: 'power3.out', overwrite: 'auto' });
    });
  };

  const hideWork = () => {
    if (!hasGsap || activeWork < 0) return;
    activeWork = -1;
    const token = ++workToken;
    if (workPh) workPh.style.opacity = '1';
    workImgs.forEach((img) => {
      if (gsap.getProperty(img, 'autoAlpha') > 0) {
        gsap.to(img, { scale: 0, duration: reduce ? 0 : 0.45, ease: 'power3.out', overwrite: 'auto', onComplete: () => { if (token === workToken) gsap.set(img, { autoAlpha: 0 }); } });
      }
    });
    workItems.forEach((it) => it.classList.remove('is-dim', 'is-active'));
    gsap.to(workHovers.filter(Boolean), { scaleX: 0, duration: 1, ease: 'power3.out', overwrite: 'auto' });
  };

  if (hasGsap) gsap.set(workImgs, { autoAlpha: 0, scale: 0 });
  workItems.forEach((it, i) => {
    it.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') showWork(i); });
    it.addEventListener('focusin', () => showWork(i));
  });
  workList?.addEventListener('pointerleave', hideWork);
  workList?.addEventListener('focusout', (e) => { if (!workList.contains(e.relatedTarget)) hideWork(); });

  /* Chapter IV hover: other names fade */
  const clients = $$('[data-client]:not([data-client-more])');
  clients.forEach((row, i) => {
    const on = () => {
      if (!isDesktop() || !clientsList.classList.contains('is-interactive')) return;
      clients.forEach((r, j) => { r.classList.toggle('is-dim', j !== i); r.classList.toggle('is-active', j === i); });
    };
    row.addEventListener('pointerenter', on);
    row.addEventListener('focusin', on);
  });
  clientsList?.addEventListener('pointerleave', () => clients.forEach((r) => r.classList.remove('is-dim', 'is-active')));

  /* ------------------------------------------------------------------
     Chapter III: backgrounds wipe up on hover (desktop), fade in on scroll (phones)
     ------------------------------------------------------------------ */
  if (hasGsap) {
    const mm = gsap.matchMedia();
    mm.add(DESKTOP, () => {
      const cleanups = [];
      $$('[data-svc]').forEach((svc) => {
        const bg = $('[data-svc-bg]', svc);
        const media = $('[data-svc-media]', svc);
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
        const focusOut = (e) => { if (!svc.contains(e.relatedTarget)) leave(); };
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
      const triggers = [];
      $$('[data-svc]').forEach((svc) => {
        const bg = $('[data-svc-bg]', svc);
        const media = $('[data-svc-media]', svc);
        if (reduce) { gsap.set(bg, { autoAlpha: 1 }); return; }
        gsap.set(bg, { autoAlpha: 0 });
        const tl = gsap.timeline({ paused: true })
          .to(bg, { autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, 0)
          .to(media, { scale: 1.2, duration: 0.8, ease: 'power3.out' }, 0);
        triggers.push(ScrollTrigger.create({ trigger: svc, start: 'bottom bottom', end: 'top top', toggleActions: 'play reverse play reverse', animation: tl }));
      });
      return () => triggers.forEach((st) => st.kill());
    });
  }

  /* ------------------------------------------------------------------
     Rail: colours follow the panel underneath, plus scroll progress.
     Also re-checks the work hover when the strip moves under a still cursor.
     ------------------------------------------------------------------ */
  const panels = $$('[data-panel]');
  const progress = $('[data-progress]');
  let railPanel = null;
  let railDark = null;
  let pointer = null;
  let frame = 0;

  const paintRail = (bg, fg, line) => {
    rail.style.setProperty('--rail-bg', bg);
    rail.style.setProperty('--rail-fg', fg);
    rail.style.setProperty('--rail-line', line);
  };

  const inside = (r, x, y) => x >= r.left && x < r.right && y >= r.top && y < r.bottom;

  const update = () => {
    frame = 0;
    const desktop = isDesktop();
    const x = desktop ? 32 : innerWidth / 2;
    const y = desktop ? innerHeight / 2 : 28;
    const hit = panels.find((p) => inside(p.getBoundingClientRect(), x, y));
    // When the rectangle has filled the screen, the rail turns dark with it.
    const overRect = hit === mw && inside(rect.getBoundingClientRect(), x, y);
    if (hit && (hit !== railPanel || overRect !== railDark)) {
      railPanel = hit;
      railDark = overRect;
      if (overRect) paintRail('#262220', '#f3eee8', '#5a524d');
      else paintRail(hit.dataset.railBg, hit.dataset.railFg, hit.dataset.railLine);
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    progress.style.transform = desktop ? `scaleY(${p})` : `scaleX(${p})`;

    if (pointer && desktop && workList) {
      const el = document.elementFromPoint(pointer.x, pointer.y)?.closest('[data-work-item]');
      if (el) showWork(workItems.indexOf(el));
      else if (activeWork >= 0 && !workList.matches(':hover')) hideWork();
    }
  };
  const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
  addEventListener('scroll', requestUpdate, { passive: true });
  addEventListener('resize', requestUpdate, { passive: true });
  addEventListener('pointermove', (e) => { if (e.pointerType !== 'touch') pointer = { x: e.clientX, y: e.clientY }; }, { passive: true });
  if (hasGsap) ScrollTrigger.addEventListener('refresh', requestUpdate);
  update();

  /* ------------------------------------------------------------------
     Navigation: scroll positions for each panel
     ------------------------------------------------------------------ */
  const targetY = (id) => {
    const el = document.getElementById(id);
    if (!el || id === 'top') return 0;
    if (isDesktop() && hST) {
      const left = el.offsetLeft;
      const distance = left <= seg.before ? left : seg.before + seg.pause + (left - seg.before);
      return hST.start + distance;
    }
    return el.getBoundingClientRect().top + scrollY - (isDesktop() ? 0 : 56);
  };

  /* Menu */
  const menuBtn = $('[data-menu-btn]');
  const menu = $('#menu');
  const pageRegions = [$('main')].filter(Boolean);
  const isMenuOpen = () => menu.classList.contains('is-open');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    pageRegions.forEach((el) => { el.inert = open; });
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    lockScroll(open);
    if (open) $('a', menu)?.focus({ preventScroll: true });
  };
  menu.inert = true;
  menuBtn.addEventListener('click', () => setMenu(!isMenuOpen()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen()) { setMenu(false); menuBtn.focus(); }
  });

  $$('[data-goto]').forEach((link) => link.addEventListener('click', (e) => {
    e.preventDefault();
    const wasOpen = isMenuOpen();
    if (wasOpen) setMenu(false);
    const go = () => scrollToY(targetY(link.dataset.goto));
    if (wasOpen) setTimeout(go, 350); else go();
  }));

  // Keyboard users: bring a focused element's panel into view on desktop.
  track.addEventListener('focusin', (e) => {
    if (!isDesktop() || !hST) return;
    const panel = e.target.closest('[data-panel]');
    if (!panel || !panel.id) return;
    const r = e.target.getBoundingClientRect();
    if (r.left < 64 || r.right > innerWidth) scrollToY(targetY(panel.id), { immediate: reduce });
  });

  /* ------------------------------------------------------------------
     Case studies (full-screen dialogs, deep-linkable as #id)
     ------------------------------------------------------------------ */
  const cases = new Map($$('dialog.case').map((d) => [d.id, d]));
  let current = null;
  let pushed = false;
  let quietClose = false;

  const setHash = (id) => {
    try {
      if (pushed) history.replaceState({ caseId: id }, '', `#${id}`);
      else { history.pushState({ caseId: id }, '', `#${id}`); pushed = true; }
    } catch { /* history unavailable in some sandboxes; the dialog still works */ }
  };

  const openCase = (id, { fromHistory = false } = {}) => {
    const dialog = cases.get(id);
    if (!dialog || current === id) return;
    if (current) { quietClose = true; cases.get(current).close(); }
    if (isMenuOpen()) setMenu(false);
    dialog.showModal();
    $('.case-scroll', dialog).scrollTop = 0;
    $('[data-close]', dialog)?.focus();
    root.classList.add('case-open');
    lockScroll(true);
    current = id;
    if (!fromHistory) setHash(id);
  };

  cases.forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (quietClose) { quietClose = false; return; }
      root.classList.remove('case-open');
      lockScroll(false);
      const closedId = current;
      current = null;
      if (pushed) {
        pushed = false;
        try { history.back(); } catch { /* ignore */ }
      } else if (location.hash) {
        try { history.replaceState(null, '', location.pathname + location.search); } catch { /* ignore */ }
      }
      $(`[data-case="${closedId}"]`)?.focus({ preventScroll: true });
    });
    $$('[data-close]', dialog).forEach((btn) => btn.addEventListener('click', () => dialog.close()));
  });

  $$('[data-case]').forEach((link) => link.addEventListener('click', (e) => {
    e.preventDefault();
    openCase(link.dataset.case);
  }));
  $$('[data-open]').forEach((btn) => btn.addEventListener('click', () => openCase(btn.dataset.open)));

  addEventListener('popstate', () => {
    const id = location.hash.slice(1);
    if (cases.has(id)) openCase(id, { fromHistory: true });
    else if (current) { pushed = false; cases.get(current).close(); }
  });

  const initial = location.hash.slice(1);
  if (cases.has(initial)) openCase(initial, { fromHistory: true });
})();
