
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface EmailRetryProgressProps {
  isRetrying: boolean;
  retryProgress: number;
}

const EmailRetryProgress: React.FC<EmailRetryProgressProps> = ({
  isRetrying,
  retryProgress
}) => {
  if (!isRetrying) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Retrying failed emails...</span>
        <span>{Math.round(retryProgress)}%</span>
      </div>
      <Progress value={retryProgress} />
    </div>
  );
};

export default EmailRetryProgress;
