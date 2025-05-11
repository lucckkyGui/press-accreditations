import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Home,
  CalendarDays,
  Settings,
  Users,
  QrCode,
  Ticket,
  BellRing,
  Send
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { useI18n } from '@/hooks/useI18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Wydarzenia', href: '/events', icon: CalendarDays },
  { name: 'Goście', href: '/guests', icon: Users },
  { name: 'Skaner', href: '/scanner', icon: QrCode },
  { name: 'Bilety', href: '/tickets', icon: Ticket },
  { name: 'Powiadomienia', href: '/notifications', icon: BellRing },
  { name: 'Komunikaty prasowe', href: '/press-releases', icon: Send },
  { name: 'Ustawienia', href: '/settings', icon: Settings },
];

const AppSidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { t } = useI18n();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0 border-r">
        <SheetHeader className="pl-6 pr-8 pt-6 pb-4">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>
            Nawigacja
          </SheetDescription>
        </SheetHeader>
        <div className="py-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-6 py-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary hover:text-secondary-foreground ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
                }`
              }
              onClick={onClose}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {t(item.name)}
            </NavLink>
          ))}
        </div>
        <div className="absolute bottom-0 w-full border-t">
          <Button variant="ghost" className="w-full rounded-none" onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
