
import React from 'react';
import { LucideIcon, Calendar, Users, Bell, FileText, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-muted-foreground/50" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

// Pre-configured empty states
export const EmptyEvents = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon={Calendar}
    title="Brak wydarzeń"
    description="Nie masz jeszcze żadnych wydarzeń. Stwórz swoje pierwsze wydarzenie, aby rozpocząć."
    actionLabel="Stwórz wydarzenie"
    onAction={onAction}
  />
);

export const EmptyGuests = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon={Users}
    title="Brak gości"
    description="Lista gości jest pusta. Dodaj gości ręcznie lub zaimportuj z pliku."
    actionLabel="Dodaj gościa"
    onAction={onAction}
  />
);

export const EmptyNotifications = () => (
  <EmptyState
    icon={Bell}
    title="Brak powiadomień"
    description="Nie masz żadnych nowych powiadomień. Wróć tu, gdy pojawią się aktualizacje."
  />
);

export const EmptyReports = () => (
  <EmptyState
    icon={FileText}
    title="Brak raportów"
    description="Raporty pojawią się po zakończeniu wydarzenia i zebraniu danych check-in."
  />
);

export default EmptyState;
