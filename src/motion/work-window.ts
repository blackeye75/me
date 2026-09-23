import { $ } from './dom';

export type WindowSize = {
  W: number;
  H: number;
  rw: number;
  rh: number;
  cover: number;
  vertical: boolean;
};

/**
 * "The Work": a centred window that opens from nothing to the full panel while
 * the words either side move with its edges, so they part exactly in the middle.
 */
export function createWorkWindow() {
  const panel = $('[data-mw]');
  const rect = $('[data-mw-rect]');
  const inner = $('[data-mw-inner]');
  const slot = $('[data-mw-slot]');
  const wordA = $('[data-mw-a]');
  const wordB = $('[data-mw-b]');
  const ready = Boolean(panel && rect && inner && slot && wordA && wordB);
  /** Current size of the opening, used to colour the rail. */
  const open = { w: 0, h: 0 };

  const measure = (vertical: boolean): WindowSize => {
    const W = panel!.clientWidth;
    const H = panel!.clientHeight;
    const rw = slot!.offsetWidth;
    const rh = slot!.offsetHeight;
    return { W, H, rw, rh, vertical, cover: Math.max((W + 8) / rw, (H + 8) / rh) };
  };

  /** t = 0: closed; t = 1: covers the whole panel. */
  const set = (t: number, d: WindowSize) => {
    const w = d.rw * d.cover * t;
    const h = d.rh * d.cover * t;
    const ix = Math.max(-4, (d.W - w) / 2);
    const iy = Math.max(-4, (d.H - h) / 2);
    rect!.style.clipPath = `inset(${iy}px ${ix}px ${iy}px ${ix}px)`;
    inner!.style.transform = `scale(${1.2 - 0.2 * t})`;
    if (d.vertical) {
      wordA!.style.transform = `translate3d(0, ${(d.rh - h) / 2}px, 0)`;
      wordB!.style.transform = `translate3d(0, ${(h - d.rh) / 2}px, 0)`;
    } else {
      wordA!.style.transform = `translate3d(${(d.rw - w) / 2}px, 0, 0)`;
      wordB!.style.transform = `translate3d(${(w - d.rw) / 2}px, 0, 0)`;
    }
    open.w = w;
    open.h = h;
  };

  const reset = () => {
    if (!ready) return;
    rect!.style.clipPath = '';
    inner!.style.transform = '';
    wordA!.style.transform = '';
    wordB!.style.transform = '';
    open.w = slot!.offsetWidth;
    open.h = slot!.offsetHeight;
  };

  return { ready, panel, measure, set, reset, open };
}

export type WorkWindow = ReturnType<typeof createWorkWindow>;
