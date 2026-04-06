
import { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  /** Only active on these paths (prefix match). Empty = global */
  pages?: string[];
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const shortcuts: ShortcutConfig[] = [
    // Global navigation
    { key: 'k', ctrl: true, meta: true, action: () => navigate('/dashboard'), description: 'Idź do Dashboard' },
    { key: 'e', ctrl: true, meta: true, action: () => navigate('/events'), description: 'Idź do Wydarzeń' },
    { key: 'g', ctrl: true, meta: true, action: () => navigate('/guests'), description: 'Idź do Gości' },
    { key: 's', ctrl: true, meta: true, action: () => navigate('/scanner'), description: 'Otwórz Skaner' },
    { key: 'n', ctrl: true, meta: true, action: () => navigate('/notifications'), description: 'Powiadomienia' },
    
    // Contextual — Events page: N to open new event dialog
    {
      key: 'n', action: () => {
        const btn = document.querySelector('[data-new-event-btn]') as HTMLButtonElement;
        btn?.click();
      },
      description: 'Nowe wydarzenie',
      pages: ['/events'],
    },
    // Contextual — Guests page: N to open new guest dialog
    {
      key: 'n', action: () => {
        const btn = document.querySelector('[data-new-guest-btn]') as HTMLButtonElement;
        btn?.click();
      },
      description: 'Nowy gość',
      pages: ['/guests'],
    },
    // Global: / to focus search
    {
      key: '/', action: () => {
        const searchInput = document.querySelector('input[placeholder*="szukaj" i], input[placeholder*="wyszukaj" i], input[placeholder*="search" i]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Szukaj',
    },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

    for (const shortcut of shortcuts) {
      // Check page scope
      if (shortcut.pages && shortcut.pages.length > 0) {
        if (!shortcut.pages.some(p => location.pathname.startsWith(p))) continue;
      }

      if (shortcut.ctrl || shortcut.meta) {
        const modifierPressed = (e.ctrlKey && shortcut.ctrl) || (e.metaKey && shortcut.meta);
        if (modifierPressed && e.key.toLowerCase() === shortcut.key) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      } else {
        if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === shortcut.key) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    }

    if (e.key === 'Escape') {
      const openDialog = document.querySelector('[data-state="open"][role="dialog"]');
      if (openDialog) {
        const closeBtn = openDialog.querySelector('button[data-dismiss], button[aria-label="Close"]') as HTMLButtonElement;
        closeBtn?.click();
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
};
