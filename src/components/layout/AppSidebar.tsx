
import React from 'react';
import { 
  Sidebar, 
  SidebarContent,
  useSidebar
} from "@/components/ui/sidebar";
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
import { useI18n } from '@/hooks/useI18n';
import { useWindowSize } from '@/hooks/useWindowSize';

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

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { t } = useI18n();
  const { openMobile, setOpenMobile } = useSidebar();
  const { isMobile } = useWindowSize();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="py-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-4 md:px-6 py-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary hover:text-secondary-foreground ${isActive ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground'
                }`
              }
              onClick={handleNavClick}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {t(item.name)}
            </NavLink>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
