import React, { useState, useEffect, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  QrCode,
  Settings,
  Bell,
  User,
  HelpCircle,
  Ticket,
  FileText,
} from 'lucide-react';

const routes = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, keywords: 'panel główny' },
  { label: 'Wydarzenia', path: '/events', icon: CalendarDays, keywords: 'events eventy' },
  { label: 'Goście', path: '/guests', icon: Users, keywords: 'guests lista gości' },
  { label: 'Skaner QR', path: '/scanner', icon: QrCode, keywords: 'scanner skanowanie check-in' },
  { label: 'Bilety', path: '/ticketing', icon: Ticket, keywords: 'tickets bilety sprzedaż' },
  { label: 'Powiadomienia', path: '/notifications', icon: Bell, keywords: 'notifications' },
  { label: 'Ustawienia', path: '/settings', icon: Settings, keywords: 'settings konfiguracja' },
  { label: 'Profil', path: '/profile', icon: User, keywords: 'profile konto' },
  { label: 'Centrum Pomocy', path: '/help', icon: HelpCircle, keywords: 'help pomoc faq' },
  { label: 'Komunikaty prasowe', path: '/press-releases', icon: FileText, keywords: 'press media prasa' },
];

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = useCallback((path: string) => {
    setOpen(false);
    navigate(path);
  }, [navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Wyszukaj stronę... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>Nie znaleziono wyników.</CommandEmpty>
        <CommandGroup heading="Nawigacja">
          {routes.map(route => (
            <CommandItem
              key={route.path}
              value={`${route.label} ${route.keywords}`}
              onSelect={() => handleSelect(route.path)}
            >
              <route.icon className="mr-2 h-4 w-4" />
              <span>{route.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
