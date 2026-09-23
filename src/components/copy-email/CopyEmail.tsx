'use client';

import { useRef, useState } from 'react';

type Props = {
  email: string;
  className?: string;
  /** Selector of the element holding the address, selected when copying is blocked. */
  fallbackTarget?: string;
};

/** Copies the email address, or selects it when the browser blocks clipboard access. */
export function CopyEmail({ email, className, fallbackTarget = '[data-email]' }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'selected'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      const target = document.querySelector(fallbackTarget);
      const selection = window.getSelection();
      if (target && selection) {
        const range = document.createRange();
        range.selectNodeContents(target);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setState('selected');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2200);
  };

  return (
    <>
      <button className={className} type="button" onClick={copy}>
        {state === 'copied' ? 'Copied' : state === 'selected' ? 'Press Ctrl+C' : 'Copy'}
      </button>
      <span className="sr-only" role="status">
        {state === 'copied' ? 'Email address copied' : state === 'selected' ? 'Email address selected' : ''}
      </span>
    </>
  );
}
