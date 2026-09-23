import { $, $$, type Disposer } from './dom';
import type { Scroll } from './scroll';

/**
 * Case studies are native <dialog> elements. Links with data-case open them,
 * and each one is deep-linkable as #slug, with the Back button closing it.
 */
export function initCaseStudies({ dispose, scroll, closeMenu }: { dispose: Disposer; scroll: Scroll; closeMenu: () => void }) {
  const root = document.documentElement;
  const dialogs = new Map($$<HTMLDialogElement>('dialog[data-case-dialog]').map((d) => [d.id, d]));
  let current: string | null = null;
  let pushed = false;
  let quietClose = false;

  const setHash = (id: string) => {
    try {
      if (pushed) history.replaceState({ caseId: id }, '', `#${id}`);
      else { history.pushState({ caseId: id }, '', `#${id}`); pushed = true; }
    } catch { /* history can be unavailable in sandboxed previews; the dialog still works */ }
  };

  const openCase = (id: string, { fromHistory = false } = {}) => {
    const dialog = dialogs.get(id);
    if (!dialog || current === id) return;
    if (current) { quietClose = true; dialogs.get(current)?.close(); }
    closeMenu();
    dialog.showModal();
    const scroller = $('[data-case-scroll]', dialog);
    if (scroller) scroller.scrollTop = 0;
    $('[data-close]', dialog)?.focus();
    root.classList.add('case-open');
    scroll.lock('case', true);
    current = id;
    if (!fromHistory) setHash(id);
  };

  dialogs.forEach((dialog) => {
    dispose.on(dialog, 'close', () => {
      if (quietClose) { quietClose = false; return; }
      root.classList.remove('case-open');
      scroll.lock('case', false);
      const closed = current;
      current = null;
      if (pushed) {
        pushed = false;
        try { history.back(); } catch { /* ignore */ }
      } else if (location.hash) {
        try { history.replaceState(null, '', location.pathname + location.search); } catch { /* ignore */ }
      }
      $(`[data-case="${closed}"]`)?.focus({ preventScroll: true });
    });
    $$('[data-close]', dialog).forEach((btn) => dispose.on(btn, 'click', () => dialog.close()));
  });

  $$('[data-case]').forEach((link) => {
    dispose.on(link, 'click', (e) => {
      e.preventDefault();
      openCase(link.dataset.case ?? '');
    });
  });
  $$('[data-open]').forEach((btn) => dispose.on(btn, 'click', () => openCase(btn.dataset.open ?? '')));

  dispose.on(window, 'popstate', () => {
    const id = location.hash.slice(1);
    if (dialogs.has(id)) openCase(id, { fromHistory: true });
    else if (current) { pushed = false; dialogs.get(current)?.close(); }
  });

  const initial = location.hash.slice(1);
  if (dialogs.has(initial)) openCase(initial, { fromHistory: true });

  dispose.add(() => {
    dialogs.forEach((d) => { if (d.open) d.close(); });
    root.classList.remove('case-open');
  });
}
