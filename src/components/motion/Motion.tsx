'use client';

import { useEffect } from 'react';
import { initMotion } from '@/motion';

/** Starts the page's motion once it has hydrated, and tears it down on unmount. */
export function Motion() {
  useEffect(() => initMotion(), []);
  return null;
}
