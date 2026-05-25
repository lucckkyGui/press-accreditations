import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'draft' | 'published' | 'active' | 'inactive' | 'approved' | 'rejected';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  confirmed: { label: 'Potwierdzony', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  pending: { label: 'Oczekujący', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  cancelled: { label: 'Anulowany', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  checked_in: { label: 'Zameldowany', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  draft: { label: 'Szkic', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
  published: { label: 'Opublikowany', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  active: { label: 'Aktywny', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  inactive: { label: 'Nieaktywny', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
  approved: { label: 'Zatwierdzony', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  rejected: { label: 'Odrzucony', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
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
