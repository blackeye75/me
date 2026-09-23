import type { Disposer } from './dom';

/**
 * Live local time in the owner's time zone (set on <main data-timezone>).
 * Elements are looked up on every tick because text reveals can replace them.
 */
export function initClock({ dispose }: { dispose: Disposer }) {
  const timeZone = document.querySelector<HTMLElement>('[data-timezone]')?.dataset.timezone;
  const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
  let format: Intl.DateTimeFormat;
  try {
    format = new Intl.DateTimeFormat('en-GB', { ...options, timeZone });
  } catch {
    format = new Intl.DateTimeFormat('en-GB', options);
  }
  const tick = () => {
    const time = format.format(new Date());
    document.querySelectorAll('[data-clock]').forEach((el) => { el.textContent = time; });
  };
  tick();
  const id = window.setInterval(tick, 1000);
  dispose.add(() => window.clearInterval(id));
}
