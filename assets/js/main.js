/* Folio — developer edition. Plain JavaScript, no dependencies. */
(() => {
  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- Intro ---------- */
  const markReady = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));
  const loader = $('.loader');
  if (root.classList.contains('show-loader') && loader) {
    loader.addEventListener('animationend', (e) => {
      if (e.animationName !== 'loader-out') return;
      root.classList.add('is-ready');
      loader.remove();
    });
  } else {
    markReady();
  }

  /* ---------- Current year + live clocks ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  const clocks = $$('[data-clock]');
  if (clocks.length) {
    let format;
    try {
      const timeZone = $('[data-timezone]')?.dataset.timezone || undefined;
      format = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    } catch {
      format = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
    }
    const tick = () => {
      const time = format.format(new Date());
      clocks.forEach((el) => { el.textContent = time; });
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Full-screen menu ---------- */
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  const pageRegions = [$('main'), $('.site-footer')].filter(Boolean);
  const isMenuOpen = () => menu.classList.contains('is-open');

  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    pageRegions.forEach((el) => { el.inert = open; });
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    $('.menu-btn-label', menuBtn).textContent = open ? 'Close' : 'Menu';
    if (open) $('a', menu)?.focus({ preventScroll: true });
  };

  if (menu && menuBtn) {
    menu.inert = true;
    menuBtn.addEventListener('click', () => setMenu(!isMenuOpen()));
    menu.addEventListener('click', (e) => { if (e.target.closest('a[href^="#"]')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isMenuOpen()) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ---------- Theme: system → light → dark ---------- */
  const themeBtn = $('[data-theme-toggle]');
  const themeLabel = $('[data-theme-label]');
  const themes = ['system', 'light', 'dark'];
  let theme = root.getAttribute('data-theme') || 'system';

  const applyTheme = (next) => {
    theme = next;
    if (next === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', next);
    if (themeLabel) themeLabel.textContent = next[0].toUpperCase() + next.slice(1);
    try {
      if (next === 'system') localStorage.removeItem('folio-theme');
      else localStorage.setItem('folio-theme', next);
    } catch { /* storage unavailable: the choice lasts for this page view */ }
  };

  if (themeBtn) {
    if (themeLabel) themeLabel.textContent = theme[0].toUpperCase() + theme.slice(1);
    themeBtn.addEventListener('click', () => applyTheme(themes[(themes.indexOf(theme) + 1) % themes.length]));
  }

  /* ---------- Work list: cover follows the cursor ---------- */
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  $$('.work-link').forEach((link) => {
    const follow = (e) => {
      if (!finePointer.matches) return;
      const box = link.getBoundingClientRect();
      link.style.setProperty('--mx', `${e.clientX - box.left}px`);
      link.style.setProperty('--my', `${e.clientY - box.top}px`);
    };
    link.addEventListener('pointerenter', follow);
    link.addEventListener('pointermove', follow);
  });

  /* ---------- Case studies ---------- */
  const cases = new Map($$('dialog.case').map((d) => [d.id, d]));
  let current = null;       // id of the open case
  let pushed = false;       // did we add a history entry for it?
  let quietClose = false;   // closing only to switch to another case

  const setHash = (id) => {
    try {
      if (pushed) history.replaceState({ caseId: id }, '', `#${id}`);
      else { history.pushState({ caseId: id }, '', `#${id}`); pushed = true; }
    } catch { /* history unavailable (sandboxed preview): the dialog still works */ }
  };

  const openCase = (id, { fromHistory = false } = {}) => {
    const dialog = cases.get(id);
    if (!dialog || current === id) return;
    if (current) {
      quietClose = true;
      cases.get(current).close();
    }
    if (isMenuOpen()) setMenu(false);
    dialog.showModal();
    $('.case-scroll', dialog).scrollTop = 0;
    $('[data-close]', dialog).focus();
    root.classList.add('case-open');
    current = id;
    if (!fromHistory) setHash(id);
  };

  cases.forEach((dialog) => {
    dialog.addEventListener('close', () => {
      if (quietClose) { quietClose = false; return; }
      root.classList.remove('case-open');
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

  window.addEventListener('popstate', () => {
    const id = location.hash.slice(1);
    if (cases.has(id)) {
      openCase(id, { fromHistory: true });
    } else if (current) {
      pushed = false;
      cases.get(current).close();
    }
  });

  const initial = location.hash.slice(1);
  if (cases.has(initial)) openCase(initial, { fromHistory: true });

  /* ---------- Copy email ---------- */
  const copyStatus = $('[data-copy-status]');
  $$('[data-copy]').forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      let message;
      try {
        await navigator.clipboard.writeText(text);
        message = 'Copied';
      } catch {
        const target = $('[data-email]');
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          const selection = getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
        message = 'Selected. Press Ctrl+C';
      }
      btn.textContent = message;
      if (copyStatus) copyStatus.textContent = message === 'Copied' ? 'Email address copied' : 'Email address selected';
      setTimeout(() => { btn.textContent = label; }, 2200);
    });
  });
})();
