/**
 * Sets the layout and motion classes on <html> before the first paint, so
 * nothing flashes: the home page starts with its intro, other pages start
 * covered, and the cover lifts once the motion layer is ready. If the motion
 * script never arrives, the safety timer removes it all.
 *
 * It runs as an inline script in <head> (app/layout.tsx), which the browser
 * executes while parsing, before it paints anything. Keep it self-contained:
 * it is turned into a string with toString().
 */
export function boot() {
  const root = document.documentElement;
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const home = path === '/';
  const sideways = home || path === '/about' || path === '/works';
  if (!sideways && !/^\/works\/[^/]+$/.test(path)) return;
  root.classList.add('js');
  if (sideways) root.classList.add('has-h');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('motion', home && !location.hash ? 'is-intro' : 'is-entering');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  setTimeout(() => {
    if (!root.classList.contains('motion-ready')) root.classList.remove('is-intro', 'is-entering', 'is-lifting', 'motion', 'has-h');
  }, 4000);
}

/** boot() as the source of an inline script. */
export const bootScript = `(${boot.toString()})();`;
