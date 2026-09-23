import type { Darkroom } from './darkroom';
import { $, $$, type Disposer, isDesktop } from './dom';
import type { WorkWindow } from './work-window';

type Tone = { bg: string; fg: string; line: string };

const WINDOW_TONE: Tone = { bg: '#262220', fg: '#f3eee8', line: '#5a524d' };
const PRINT_TONE: Tone = { bg: '#faf9f6', fg: '#2e2b28', line: '#b8b3ac' };

/**
 * The rail takes the colours of the panel underneath it (or of "The Work"
 * window and the darkroom print once they reach it) and shows scroll progress.
 */
export function createRail({ dispose, workWindow, darkroom }: { dispose: Disposer; workWindow: WorkWindow; darkroom: Darkroom }) {
  const rail = $('[data-rail]');
  const progress = $('[data-progress]');
  const tip = $('[data-progress-tip]');
  const panels = $$('[data-panel]');
  let current: HTMLElement | null = null;
  let tone = '';
  let held: Tone | null = null;
  let frame = 0;
  const listeners = new Set<() => void>();

  const paint = (t: Tone) => {
    if (!rail) return;
    rail.style.setProperty('--rail-bg', t.bg);
    rail.style.setProperty('--rail-fg', t.fg);
    rail.style.setProperty('--rail-line', t.line);
  };

  const inside = (r: DOMRect, x: number, y: number) => x >= r.left && x < r.right && y >= r.top && y < r.bottom;

  const update = () => {
    frame = 0;
    if (!rail) return;
    const desktop = isDesktop();
    const x = desktop ? 32 : window.innerWidth / 2;
    const y = desktop ? window.innerHeight / 2 : 28;
    const hit = panels.find((p) => inside(p.getBoundingClientRect(), x, y)) ?? null;

    let next = 'panel';
    if (hit && hit === workWindow.panel) {
      const r = hit.getBoundingClientRect();
      if (Math.abs(x - (r.left + r.width / 2)) < workWindow.open.w / 2 && Math.abs(y - (r.top + r.height / 2)) < workWindow.open.h / 2) next = 'window';
    }
    if (hit && hit === darkroom.panel) {
      const r = hit.getBoundingClientRect();
      if (Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < darkroom.state.r) next = 'print';
    }
    if (hit && (hit !== current || next !== tone)) {
      current = hit;
      tone = next;
      if (!held) {
        if (next === 'window') paint(WINDOW_TONE);
        else if (next === 'print') paint(PRINT_TONE);
        else paint({ bg: hit.dataset.railBg!, fg: hit.dataset.railFg!, line: hit.dataset.railLine! });
      }
    }

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) progress.style.transform = desktop ? `scaleY(${p})` : `scaleX(${p})`;
    if (tip) {
      tip.style.transform = desktop
        ? `translate3d(-50%, calc(${p * rail.clientHeight}px - 50%), 0)`
        : `translate3d(calc(${p * rail.clientWidth}px - 50%), 50%, 0)`;
      tip.toggleAttribute('data-on', p > 0.002);
    }
    listeners.forEach((fn) => fn());
  };

  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  dispose.on(window, 'scroll', request, { passive: true });
  dispose.on(window, 'resize', request, { passive: true });
  dispose.add(() => cancelAnimationFrame(frame));
  update();

  return {
    element: rail,
    request,
    /** The panel currently under the rail. */
    get current() { return current; },
    /** Holds the rail in given colours (while the menu is open), or releases it. */
    hold(t: Tone | null) {
      held = t;
      if (t) paint(t);
      else { current = null; update(); }
    },
    /** Runs after every scroll frame. */
    onFrame(fn: () => void) { listeners.add(fn); },
  };
}

export type Rail = ReturnType<typeof createRail>;
