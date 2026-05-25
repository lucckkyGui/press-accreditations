
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, XCircle } from 'lucide-react';
import { FailedEmailEntry } from './types';

interface FailedEmailItemProps {
  entry: FailedEmailEntry;
  canRetry: boolean;
  isRetrying: boolean;
  onRetry: (entry: FailedEmailEntry) => void;
  onRemove: (id: string) => void;
}

const FailedEmailItem: React.FC<FailedEmailItemProps> = ({
  entry,
  canRetry,
  isRetrying,
  onRetry,
  onRemove
}) => {
  const getErrorBadgeVariant = (attempts: number) => {
    if (attempts >= 3) return 'destructive';
    if (attempts >= 2) return 'secondary';
    return 'outline';
  };

  return (
    <div className="p-4 border rounded-lg space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">
            {entry.guest.firstName} {entry.guest.lastName}
          </div>
          <div className="text-sm text-muted-foreground">
            {entry.guest.email}
          </div>
        </div>
        <Badge variant={getErrorBadgeVariant(entry.attempts)}>
          {entry.attempts} attempts
        </Badge>
      </div>
      
      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
        {entry.error}
      </div>
      
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>
          Last attempt: {entry.lastAttempt.toLocaleString('pl-PL')}
        </span>
        <span>
          Next retry: {entry.nextRetry.toLocaleString('pl-PL')}
        </span>
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRetry(entry)}
          disabled={!canRetry || isRetrying}
          className="gap-1"
        >
          <Mail className="h-3 w-3" />
          Retry Now
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(entry.id)}
          disabled={isRetrying}
          className="gap-1"
        >
          <XCircle className="h-3 w-3" />
          Remove
        </Button>
      </div>
    </div>
  );
};

export default FailedEmailItem;
