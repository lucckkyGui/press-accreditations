import { useCallback, useRef, useState } from 'react';

/**
 * Prevents double-clicks on form submissions.
 * Wraps an async handler and disables subsequent calls until the first resolves.
 */
export function useSubmitGuard<T extends (...args: any[]) => Promise<any>>(
  handler: T,
  cooldownMs = 1000
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastSubmit = useRef(0);

  const guardedHandler = useCallback(
    async (...args: Parameters<T>) => {
      const now = Date.now();
      if (isSubmitting || now - lastSubmit.current < cooldownMs) return;
      
      setIsSubmitting(true);
      lastSubmit.current = now;
      try {
        return await handler(...args);
      } finally {
        setIsSubmitting(false);
      }
    },
    [handler, cooldownMs, isSubmitting]
  ) as (...args: Parameters<T>) => Promise<ReturnType<T>>;

  return { guardedHandler, isSubmitting };
}
