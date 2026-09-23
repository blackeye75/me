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
  const motion = hasGsap && !reduce;

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
    if (lenis) lenis.scrollTo(y, { immediate, force: true, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: immediate || reduce ? 'auto' : 'smooth' });
  };

  // Several things can hold the scroll (intro, menu, case study); release only when all let go.
  const locks = new Set();
  const lockScroll = (key, locked) => {
    if (locked) locks.add(key); else locks.delete(key);
    if (!lenis) return;
    if (locks.size) lenis.stop(); else lenis.start();
  };

  const fontsReady = new Promise((resolve) => {
    const timer = setTimeout(resolve, 2500);
    (document.fonts?.ready ?? Promise.resolve()).then(() => { clearTimeout(timer); resolve(); });
  });

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

  // Lines drop back into their masks, last line first.
  const hideLines = (el, { duration = 1.2, ease = 'power3.inOut' } = {}) => {
    if (!SplitText) return gsap.to(el, { opacity: 0, duration: duration * 0.5 });
    const split = SplitText.create(el, { type: 'lines', mask: 'lines' });
    return gsap.timeline()
      .to(split.lines, { yPercent: 102, duration, ease, stagger: { each: 0.07, from: 'end' } })
      .set(el, { opacity: 0 })
      .call(() => split.revert());
  };

  // Pre-wrapped single lines ([data-line] inside .mask).
  const riseLines = (els, { duration = 1.7, stagger = 0.07, ease = 'power3.out' } = {}) =>
    gsap.fromTo(els, { yPercent: 102, opacity: 1 }, { yPercent: 0, duration, ease, stagger, force3D: true });

  // A colour block wipes in from the left, then the image slides in over it.
  const prepImage = (shell) => gsap.set($('[data-ir-media]', shell), { clipPath: 'inset(0% 100% 0% 0%)', xPercent: -10 });
  const revealImage = (shell, { duration = 0.7, delay = 0.2, ease = 'power2.out' } = {}) => {
    const overlay = $('[data-ir-overlay]', shell);
    const media = $('[data-ir-media]', shell);
    gsap.set(overlay, { autoAlpha: 1, clipPath: 'inset(0% 100% 0% 0%)' });
    return gsap.timeline({ onComplete: () => gsap.set(overlay, { autoAlpha: 0 }) })
      .to(overlay, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease }, 0)
      .to(media, { clipPath: 'inset(0% 0% 0% 0%)', xPercent: 0, duration, ease }, delay);
  };

  /* ------------------------------------------------------------------
     Horizontal story (desktop) and "The Work" window
     ------------------------------------------------------------------ */
  const pin = $('[data-pin]');
  const track = $('[data-track]');
  const mw = $('[data-mw]');
  const rect = $('[data-mw-rect]');
  const inner = $('[data-mw-inner]');
  const slot = $('[data-mw-slot]');
  const wordA = $('[data-mw-a]');
  const wordB = $('[data-mw-b]');

  const hTl = hasGsap ? gsap.timeline({ defaults: { ease: 'none' } }) : null;
  let hST = null;
  const seg = { before: 0, pause: 0 };   // scroll distances, used to jump to a panel
  const mwOpen = { w: 0, h: 0 };          // current size of the window, for the rail colour
  let rebuild = () => {};

  const debounce = (fn, ms) => { let id; return () => { clearTimeout(id); id = setTimeout(fn, ms); }; };

  const measureWindow = (vertical) => {
    const W = mw.clientWidth;
    const H = mw.clientHeight;
    const rw = slot.offsetWidth;
    const rh = slot.offsetHeight;
    return { W, H, rw, rh, vertical, cover: Math.max((W + 8) / rw, (H + 8) / rh) };
  };

  // t = 0: closed; t = 1: covers the whole panel. The window stays centred and the
  // words move with its edges, so they part exactly in the middle of the screen.
  const setWindow = (t, d) => {
    const w = d.rw * d.cover * t;
    const h = d.rh * d.cover * t;
    const ix = Math.max(-4, (d.W - w) / 2);
    const iy = Math.max(-4, (d.H - h) / 2);
    rect.style.clipPath = `inset(${iy}px ${ix}px ${iy}px ${ix}px)`;
    inner.style.transform = `scale(${1.2 - 0.2 * t})`;
    if (d.vertical) {
      wordA.style.transform = `translate3d(0, ${(d.rh - h) / 2}px, 0)`;
      wordB.style.transform = `translate3d(0, ${(h - d.rh) / 2}px, 0)`;
    } else {
      wordA.style.transform = `translate3d(${(d.rw - w) / 2}px, 0, 0)`;
      wordB.style.transform = `translate3d(${(w - d.rw) / 2}px, 0, 0)`;
    }
    mwOpen.w = w;
    mwOpen.h = h;
  };

  const resetWindow = () => {
    rect.style.clipPath = '';
    inner.style.transform = '';
    wordA.style.transform = '';
    wordB.style.transform = '';
    mwOpen.w = slot.offsetWidth;
    mwOpen.h = slot.offsetHeight;
  };

  if (hasGsap) {
    const mm = gsap.matchMedia();

    mm.add(DESKTOP, () => {
      const box = { t: 0 };
      const build = () => {
        const progress = hST ? hST.progress : null;
        hST?.kill(true);
        hTl.clear();
        gsap.set(track, { clearProps: 'transform' });
        resetWindow();

        const vw = pin.clientWidth;
        const vh = pin.clientHeight;
        const maxX = Math.max(0, track.scrollWidth - vw);

        if (reduce) {
          hTl.fromTo(track, { x: 0 }, { x: -maxX, duration: maxX });
          seg.before = Infinity;
          seg.pause = 0;
          hST = ScrollTrigger.create({ trigger: pin, animation: hTl, start: 'top top', end: `+=${maxX}`, pin: true, scrub: true, anticipatePin: 1 });
        } else {
          // Slide until "The Work" is centred, hold for one screen height while the window opens, then carry on.
          const d = measureWindow(false);
          const before = Math.max(0, mw.offsetLeft - (vw - mw.offsetWidth) / 2);
          const pause = vh;
          const after = Math.max(0, maxX - before);
          box.t = 0;
          setWindow(0, d);
          hTl
            .fromTo(track, { x: 0 }, { x: -before, duration: before })
            .addLabel('expand')
            .fromTo(box, { t: 0 }, { t: 1, duration: pause, onUpdate: () => setWindow(box.t, d) }, 'expand')
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
      let lastHeight = innerHeight;
      const onResize = debounce(() => {
        if (innerWidth === lastWidth && Math.abs(innerHeight - lastHeight) < 2) return;
        lastWidth = innerWidth;
        lastHeight = innerHeight;
        build();
      }, 150);
      addEventListener('resize', onResize);

      return () => {
        removeEventListener('resize', onResize);
        rebuild = () => {};
        hST?.kill(true);
        hST = null;
        hTl.clear();
        gsap.set(track, { clearProps: 'all' });
        resetWindow();
      };
    });

    mm.add(MOBILE, () => {
      if (reduce) return undefined;
      let st = null;
      let tl = null;
      const box = { t: 0 };
      const build = () => {
        st?.kill(true);
        tl?.kill();
        resetWindow();
        const d = measureWindow(true);
        box.t = 0;
        setWindow(0, d);
        tl = gsap.timeline({ defaults: { ease: 'none' } })
          .fromTo(box, { t: 0 }, { t: 1, onUpdate: () => setWindow(box.t, d) });
        st = ScrollTrigger.create({ trigger: mw, animation: tl, start: 'top top', end: `+=${d.H}`, pin: true, scrub: true, anticipatePin: 1 });
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
        resetWindow();
      };
    });
  }

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
     Rail: colours follow the panel underneath, plus scroll progress
     ------------------------------------------------------------------ */
  const rail = $('[data-rail]');
  const panels = $$('[data-panel]');
  const progress = $('[data-progress]');
  const workList = $('[data-work-list]');
  let railPanel = null;
  let railDark = null;
  let menuIsOpen = false;
  let pointer = null;
  let frame = 0;
  let showWork = () => {};
  let hideWork = () => {};
  let activeWork = -1;
  const workItems = $$('[data-work-item]');

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
    let overWindow = false;
    if (hit === mw) {
      const r = mw.getBoundingClientRect();
      overWindow = Math.abs(x - (r.left + r.width / 2)) < mwOpen.w / 2 && Math.abs(y - (r.top + r.height / 2)) < mwOpen.h / 2;
    }
    if (hit && (hit !== railPanel || overWindow !== railDark)) {
      railPanel = hit;
      railDark = overWindow;
      if (!menuIsOpen) {
        if (overWindow) paintRail('#262220', '#f3eee8', '#5a524d');
        else paintRail(hit.dataset.railBg, hit.dataset.railFg, hit.dataset.railLine);
      }
    }
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    progress.style.transform = desktop ? `scaleY(${p})` : `scaleX(${p})`;

    // The strip can move under a still cursor: keep the work hover in sync.
    if (pointer && desktop && workList && !menuIsOpen) {
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

  /* Menu icon: three bars; the outer two shrink away while the menu is open */
  const barLower = $('[data-bar="lower"]');
  const barUpper = $('[data-bar="upper"]');
  const bars = (state, duration = 0.7, ease = 'power2.inOut') => {
    if (!hasGsap || !barLower) return;
    const full = state !== 'closed';
    if (reduce) duration = 0;
    gsap.to(barLower, { attr: { width: full ? 32 : 0 }, duration, ease, overwrite: 'auto' });
    gsap.to(barUpper, { attr: { x: full ? 0 : 32, width: full ? 32 : 0 }, duration, ease, overwrite: 'auto' });
  };

  /* ------------------------------------------------------------------
     Intro: the first year rises, the years roll up to today while a bar
     fills along the bottom, then the name rises in word by word.
     ------------------------------------------------------------------ */
  const runIntro = () => {
    const strip = $('[data-years]');
    const firstYear = $('[data-year-first]');
    const yearRow = $('[data-year-row]');
    const base = $('[data-hero-base]');
    const nameEl = $('[data-hero-name]');
    const words = $$('[data-name-word]');
    const tagline = $('[data-hero-tagline]');
    const journey = $('[data-hero-journey]');
    const metas = $$('[data-hero-meta]');
    const n = isDesktop() ? 1 : 0.86;
    const cells = strip.children.length;

    lockScroll('intro', true);
    gsap.set(barLower, { attr: { width: 16 } });
    gsap.set(barUpper, { attr: { x: 16, width: 16 } });

    const chars = SplitText ? SplitText.create(firstYear, { type: 'chars', charsClass: 'char' }).chars : [firstYear];
    gsap.set(yearRow, { opacity: 1 });
    gsap.set(words, { yPercent: 102 });

    const tl = gsap.timeline();
    tl.fromTo(chars, { yPercent: 102 }, { yPercent: 0, duration: 1.7 * n, ease: 'power4.inOut', stagger: 0.07 * n }, 0);
    const startDone = 1.7 * n + 0.07 * n * (chars.length - 1);
    if (isDesktop()) tl.call(() => revealLines(journey, { duration: 1.7 * n }), [], 0);
    tl.to(rail, { opacity: 1, duration: 2.5 * n, ease: 'power3.out' }, 0.5 * n);

    const roll = 2.85 * n;
    tl.to(strip, { yPercent: (-100 * (cells - 1)) / cells, duration: roll, ease: 'power4.inOut' }, startDone);
    tl.to(base, { scaleX: 1, duration: roll, ease: 'power4.inOut' }, startDone);

    const handoff = startDone + roll - 0.42 * n;
    tl.to(yearRow, { yPercent: -100, duration: 1.78 * n, ease: 'power4.inOut' }, handoff);
    if (isDesktop()) tl.call(() => hideLines(journey, { duration: 1.2 * n }), [], handoff);
    tl.call(() => bars('open', 2, 'power2.out'), [], handoff);

    const nameAt = handoff + 1.78 * n * 0.5;
    tl.set(nameEl, { opacity: 1 }, nameAt);
    tl.to(words, { yPercent: 0, duration: 1.7 * n, ease: 'power3.out', stagger: 0.2 * n }, nameAt);

    const tagAt = nameAt + 0.2 * n * (words.length - 1) + 0.4 * n;
    tl.call(() => revealLines(tagline, { duration: 1.7 * n, stagger: 0.2 * n }), [], tagAt);
    tl.call(() => metas.forEach((m) => revealLines(m, { duration: 1.7 * n })), [], tagAt + 0.3 * n);
    tl.to(base, { height: '100%', duration: 1.1 * n, ease: 'power2.inOut' }, startDone + roll);

    tl.call(() => {
      root.classList.remove('is-intro');
      gsap.set(rail, { clearProps: 'opacity' });
      lockScroll('intro', false);
      requestUpdate();
    }, [], tagAt + 0.5 * n);
  };

  /* ------------------------------------------------------------------
     Section reveals (registered once fonts are in, so positions are right)
     ------------------------------------------------------------------ */
  const clientsList = $('[data-clients-list]');

  const initReveals = () => {
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

    // Chapter IV: names rise one by one, "And more" last.
    whenSeen(clientsList, () => {
      riseLines($$('[data-line]', clientsList), { stagger: 0.15 })
        .eventCallback('onComplete', () => clientsList.classList.add('is-interactive'));
    }, { hStart: 'left 75%', vStart: 'top 85%' });

    // Footer: the title rises word by word, then the contact lines.
    const footer = $('[data-footer]');
    whenSeen(footer, () => {
      gsap.fromTo($$('.ft-word', footer), { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1.7, ease: 'power3.out', stagger: 0.2 });
      gsap.fromTo($$('[data-ft-line]', footer), { yPercent: 102, opacity: 1 }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.6 });
    }, { hStart: 'left 60%', vStart: 'top 70%' });

    ScrollTrigger.refresh();
  };

  if (motion) {
    fontsReady.then(() => {
      rebuild();
      ScrollTrigger.refresh();
      if (root.classList.contains('is-intro')) runIntro();
      initReveals();
    });
  } else {
    clientsList?.classList.add('is-interactive');
    if (hasGsap) fontsReady.then(() => { rebuild(); ScrollTrigger.refresh(); });
  }

  /* ------------------------------------------------------------------
     Chapter II hover: preview grows from the centre, other names fade
     ------------------------------------------------------------------ */
  const workImgs = $$('[data-work-img]');
  const workPh = $('[data-work-ph]');
  const workHovers = workItems.map((it) => $('[data-work-hover]', it));
  let workToken = 0;

  showWork = (i) => {
    if (!hasGsap || !isDesktop() || i < 0 || i === activeWork) return;
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

  hideWork = () => {
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

  /* ------------------------------------------------------------------
     Menu: wipes open from left to right, links rise in one by one
     ------------------------------------------------------------------ */
  const menuBtn = $('[data-menu-btn]');
  const menu = $('#menu');
  const menuPanel = $('[data-menu-panel]');
  const menuClose = $('[data-menu-close]');
  const menuItems = $$('.menu-item', menu);
  const menuMain = $('main');
  let menuTl = null;

  const navFor = { top: 'top', about: 'about', 'the-work': 'work', work: 'work', services: 'experience', experience: 'experience', contact: 'contact' };
  const markActive = () => {
    const current = navFor[railPanel?.id] ?? 'top';
    menuItems.forEach((it) => it.classList.toggle('is-active', it.dataset.nav === current));
  };

  const openMenu = () => {
    if (menuIsOpen) return;
    menuIsOpen = true;
    markActive();
    menu.classList.add('is-open');
    menu.inert = false;
    if (menuMain) menuMain.inert = true;
    root.classList.add('menu-open');
    lockScroll('menu', true);
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.setAttribute('aria-label', 'Close menu');
    paintRail('#2e2b28', '#f3eee8', '#5a524d');
    bars('closed');

    const focusFirst = () => (isDesktop() ? menuClose : $('a', menu))?.focus({ preventScroll: true });
    if (!motion) { focusFirst(); return; }

    menuTl?.kill();
    const lines = $$('[data-menu-line]', menu);
    gsap.set(lines, { yPercent: 102 });
    menuTl = gsap.timeline({ onComplete: focusFirst })
      .fromTo(menuPanel, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.88, ease: 'power3.out' }, 0)
      .to($$('[data-menu-line]', menuClose), { yPercent: 0, duration: 1, ease: 'power2.out' }, 0.12);
    menuItems.forEach((it, i) => {
      menuTl.to($$('[data-menu-line]', it), { yPercent: 0, duration: 1, ease: 'power2.out', stagger: 0.07 }, 0.14 + i * 0.15);
    });
    $$('[data-menu-social]', menu).forEach((a, i) => {
      menuTl.to(a, { yPercent: 0, duration: 1, ease: 'power2.out' }, 0.22 + i * 0.1);
    });
  };

  const closeMenu = (after) => {
    if (!menuIsOpen) return;
    const finish = () => {
      menu.classList.remove('is-open');
      menu.inert = true;
      if (menuMain) menuMain.inert = false;
      root.classList.remove('menu-open');
      menuIsOpen = false;
      railPanel = null;
      lockScroll('menu', false);
      update();
      if (typeof after === 'function') after();
    };
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
    bars('open');
    if (!motion) { finish(); return; }
    menuTl?.kill();
    menuTl = gsap.timeline({ onComplete: finish })
      .to($$('[data-menu-line]', menu), { yPercent: 102, duration: 0.5, ease: 'power3.in', stagger: { each: 0.02, from: 'end' } }, 0)
      .to(menuPanel, { clipPath: 'inset(0% 100% 0% 0%)', duration: 0.58, ease: 'power3.in' }, 0.08);
  };

  menu.inert = true;
  menuBtn.addEventListener('click', () => (menuIsOpen ? closeMenu() : openMenu()));
  menuClose?.addEventListener('click', () => closeMenu(() => menuBtn.focus({ preventScroll: true })));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuIsOpen) closeMenu(() => menuBtn.focus({ preventScroll: true }));
  });

  $$('[data-goto]').forEach((link) => link.addEventListener('click', (e) => {
    e.preventDefault();
    const go = () => scrollToY(targetY(link.dataset.goto));
    if (menuIsOpen) closeMenu(go); else go();
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
    if (menuIsOpen) closeMenu();
    dialog.showModal();
    $('.case-scroll', dialog).scrollTop = 0;
    $('[data-close]', dialog)?.focus();
    root.classList.add('case-open');
    lockScroll('case', true);
    current = id;
    if (!fromHistory) setHash(id);
  };

  cases.forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (quietClose) { quietClose = false; return; }
      root.classList.remove('case-open');
      lockScroll('case', false);
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
