/** Typed shorthands for querying the page. */
export const $ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  scope.querySelector<T>(selector);

export const $$ = <T extends Element = HTMLElement>(selector: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(selector));

export const DESKTOP = '(min-width: 768px)';
export const MOBILE = '(max-width: 767px)';

export const isDesktop = () => window.matchMedia(DESKTOP).matches;
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const debounce = (fn: () => void, ms: number) => {
  let id: ReturnType<typeof setTimeout> | undefined;
  const run = () => {
    clearTimeout(id);
    id = setTimeout(fn, ms);
  };
  run.cancel = () => clearTimeout(id);
  return run;
};

/** Collects event listeners and cleanups so everything can be undone in one call. */
export function createDisposer() {
  const cleanups: Array<() => void> = [];
  return {
    on<K extends keyof WindowEventMap>(
      target: Window | Document | Element,
      type: K | string,
      listener: (event: Event) => void,
      options?: AddEventListenerOptions,
    ) {
      target.addEventListener(type, listener, options);
      cleanups.push(() => target.removeEventListener(type, listener, options));
    },
    add(cleanup: () => void) {
      cleanups.push(cleanup);
    },
    dispose() {
      while (cleanups.length) cleanups.pop()?.();
    },
  };
}

export type Disposer = ReturnType<typeof createDisposer>;
