import { useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UndoOptions {
  message: string;
  duration?: number;
  onUndo: () => void | Promise<void>;
  onConfirm: () => void | Promise<void>;
}

/**
 * Shows a toast with an Undo button. If user clicks Undo within `duration` ms,
 * runs onUndo. Otherwise runs onConfirm.
 */
export function useUndoToast() {
  const pendingTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showUndoToast = useCallback(({ message, duration = 5000, onUndo, onConfirm }: UndoOptions) => {
    const id = crypto.randomUUID();
    
    const timer = setTimeout(async () => {
      pendingTimers.current.delete(id);
      await onConfirm();
    }, duration);
    
    pendingTimers.current.set(id, timer);

    toast(message, {
      duration,
      action: {
        label: 'Cofnij',
        onClick: async () => {
          const t = pendingTimers.current.get(id);
          if (t) {
            clearTimeout(t);
            pendingTimers.current.delete(id);
          }
          await onUndo();
          toast.success('Akcja cofnięta');
        },
      },
    });

    return id;
  }, []);

  return { showUndoToast };
}
