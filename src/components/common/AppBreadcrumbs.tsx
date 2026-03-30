
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  events: 'Wydarzenia',
  guests: 'Goście',
  scanner: 'Skaner QR',
  ticketing: 'Bilety',
  settings: 'Ustawienia',
  profile: 'Profil',
  notifications: 'Powiadomienia',
  'press-releases': 'Media / Prasa',
  'media-portal': 'Portal mediowy',
  'rfid-scanner': 'Skaner RFID',
  wristbands: 'Opaski RFID',
  'zone-heatmap': 'Heatmapa stref',
  'post-event-report': 'Raport końcowy',
  'sponsor-report': 'Raport sponsorski',
  'invitation-editor': 'Edytor zaproszeń',
  'embed-widget': 'Widget embed',
  waitlist: 'Lista oczekujących',
  'ai-support': 'AI Support',
  help: 'Pomoc',
  orders: 'Zamówienia',
  purchase: 'Zakup',
  account: 'Konto',
};

const AppBreadcrumbs = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          if (segment === 'dashboard') return null;
          const path = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const label = routeLabels[segment] || segment;

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default AppBreadcrumbs;
