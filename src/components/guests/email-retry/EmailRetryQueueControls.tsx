
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface EmailRetryQueueControlsProps {
  readyForRetryCount: number;
  isRetrying: boolean;
  failedEmailsCount: number;
  onRetryAll: () => void;
}

const EmailRetryQueueControls: React.FC<EmailRetryQueueControlsProps> = ({
  readyForRetryCount,
  isRetrying,
  failedEmailsCount,
  onRetryAll
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        {readyForRetryCount} emails ready for retry
      </div>
      <Button
        onClick={onRetryAll}
        disabled={isRetrying || failedEmailsCount === 0}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
        Retry All
      </Button>
    </div>
  );
};

export default EmailRetryQueueControls;
