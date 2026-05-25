import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'draft' | 'published' | 'active' | 'inactive' | 'approved' | 'rejected';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  confirmed: { label: 'Potwierdzony', className: 'bg-success/10 text-success border-success/30' },
  pending: { label: 'Oczekujący', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  cancelled: { label: 'Anulowany', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  checked_in: { label: 'Zameldowany', className: 'bg-info/10 text-info border-info/30' },
  draft: { label: 'Szkic', className: 'bg-muted text-muted-foreground border-border' },
  published: { label: 'Opublikowany', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  active: { label: 'Aktywny', className: 'bg-success/10 text-success border-success/30' },
  inactive: { label: 'Nieaktywny', className: 'bg-muted text-muted-foreground border-border' },
  approved: { label: 'Zatwierdzony', className: 'bg-success/10 text-success border-success/30' },
  rejected: { label: 'Odrzucony', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
  customLabel?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, customLabel }) => {
  const config = statusConfig[status as StatusType] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium border', config.className, className)}>
      {customLabel || config.label}
    </Badge>
  );
};

export default StatusBadge;
