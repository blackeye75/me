'use client';

import { useEffect, useLayoutEffect } from 'react';
import { initMotion } from '@/motion';
import { boot } from '@/motion/boot';

/** Starts the page's motion once it has hydrated, and tears it down on unmount. */
export function Motion() {
  // In development, React's Strict Mode remount resets <html> to its JSX
  // attributes, dropping the classes the inline boot script set. Put them
  // back before paint. Production keeps them, so this only runs in development.
  useLayoutEffect(() => {
    if (process.env.NODE_ENV !== 'production' && !document.documentElement.classList.contains('js')) boot();
  }, []);
  useEffect(() => initMotion(), []);
  return null;
}
