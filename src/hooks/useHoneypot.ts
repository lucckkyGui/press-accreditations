import { useRef, useCallback } from 'react';

/**
 * Anti-bot honeypot hook — no external service required.
 * 
 * Usage:
 * 1. Render `honeypotProps.fields` in your form (invisible to users)
 * 2. Call `isBot()` before submitting
 */
export function useHoneypot(minSubmitTimeMs = 2000) {
  const loadedAt = useRef(Date.now());
  const honeypotValue = useRef('');

  const isBot = useCallback(() => {
    // Check 1: honeypot field was filled (bots auto-fill hidden fields)
    if (honeypotValue.current.length > 0) return true;
    // Check 2: form submitted too fast (< minSubmitTimeMs)
    if (Date.now() - loadedAt.current < minSubmitTimeMs) return true;
    return false;
  }, [minSubmitTimeMs]);

  const honeypotProps = {
    fields: {
      containerStyle: {
        position: 'absolute' as const,
        left: '-9999px',
        top: '-9999px',
        opacity: 0,
        height: 0,
        overflow: 'hidden' as const,
      },
      inputProps: {
        tabIndex: -1,
        autoComplete: 'off',
        'aria-hidden': true as const,
        value: honeypotValue.current,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          honeypotValue.current = e.target.value;
        },
      },
    },
  };

  const resetTimer = useCallback(() => {
    loadedAt.current = Date.now();
  }, []);

  return { isBot, honeypotProps, resetTimer };
}
