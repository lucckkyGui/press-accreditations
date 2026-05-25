import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Calendar, Users, QrCode, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/dashboard', icon: BarChart3, label: 'Panel' },
  { path: '/events', icon: Calendar, label: 'Wydarzenia' },
  { path: '/guests', icon: Users, label: 'Goście' },
  { path: '/scanner', icon: QrCode, label: 'Skaner' },
  { path: '/settings', icon: Settings, label: 'Więcej' },
];

const MobileTabBar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-lg border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map(tab => {
          const active = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all min-w-[56px]',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-10 h-7 rounded-full transition-all',
                active && 'bg-primary/10 scale-110'
              )}>
                <tab.icon className="h-[18px] w-[18px]" />
              </div>
              <span className={cn(
                'text-[10px] font-medium leading-tight',
                active && 'font-bold'
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
