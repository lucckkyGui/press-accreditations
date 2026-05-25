import React from 'react';
import { useAuth } from '@/hooks/auth';

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return 'Dobrej nocy';
  if (hour < 12) return 'Dzień dobry';
  if (hour < 18) return 'Witaj ponownie';
  return 'Dobry wieczór';
};

const DashboardGreeting: React.FC = () => {
  const { profile } = useAuth();
  const name = profile?.firstName || 'Organizatorze';
  const greeting = getGreeting();

  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
        {greeting}, {name} 👋
      </h1>
      <p className="text-muted-foreground mt-1">
        Oto podsumowanie Twoich wydarzeń i aktywności.
      </p>
    </div>
  );
};

export default DashboardGreeting;
