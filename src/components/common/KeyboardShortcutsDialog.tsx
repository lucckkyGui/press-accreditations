import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Otwórz paletę komend' },
  { keys: ['⌘', 'E'], description: 'Przejdź do Wydarzeń' },
  { keys: ['⌘', 'G'], description: 'Przejdź do Gości' },
  { keys: ['⌘', 'S'], description: 'Otwórz Skaner' },
  { keys: ['⌘', 'N'], description: 'Powiadomienia' },
  { keys: ['?'], description: 'Pokaż skróty klawiszowe' },
  { keys: ['Esc'], description: 'Zamknij dialog / modal' },
];

const KeyboardShortcutsDialog: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            Skróty klawiszowe
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-muted/50">
              <span className="text-sm text-foreground">{s.description}</span>
              <div className="flex gap-1">
                {s.keys.map((key, j) => (
                  <kbd
                    key={j}
                    className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-medium rounded-md border border-border bg-muted text-muted-foreground"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Naciśnij <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted text-xs">?</kbd> aby zamknąć
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;
