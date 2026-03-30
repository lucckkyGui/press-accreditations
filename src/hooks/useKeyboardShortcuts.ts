
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const shortcuts: ShortcutConfig[] = [
    { key: 'k', ctrl: true, meta: true, action: () => navigate('/dashboard'), description: 'Idź do Dashboard' },
    { key: 'e', ctrl: true, meta: true, action: () => navigate('/events'), description: 'Idź do Wydarzeń' },
    { key: 'g', ctrl: true, meta: true, action: () => navigate('/guests'), description: 'Idź do Gości' },
    { key: 's', ctrl: true, meta: true, action: () => navigate('/scanner'), description: 'Otwórz Skaner' },
    { key: 'n', ctrl: true, meta: true, action: () => navigate('/notifications'), description: 'Powiadomienia' },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger in inputs/textareas
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

    for (const shortcut of shortcuts) {
      const modifierPressed = (e.ctrlKey && shortcut.ctrl) || (e.metaKey && shortcut.meta);
      if (modifierPressed && e.key.toLowerCase() === shortcut.key) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }

    // Escape to close any open dialog
    if (e.key === 'Escape') {
      const openDialog = document.querySelector('[data-state="open"][role="dialog"]');
      if (openDialog) {
        const closeBtn = openDialog.querySelector('button[data-dismiss], button[aria-label="Close"]') as HTMLButtonElement;
        closeBtn?.click();
      }
    }
  }, [navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
};
