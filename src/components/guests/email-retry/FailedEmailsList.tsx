
import React from 'react';
import FailedEmailItem from './FailedEmailItem';
import { FailedEmailEntry } from './types';

interface FailedEmailsListProps {
  failedEmails: FailedEmailEntry[];
  isRetrying: boolean;
  canRetry: (entry: FailedEmailEntry) => boolean;
  onRetryEmail: (entry: FailedEmailEntry) => void;
  onRemoveFromQueue: (id: string) => void;
}

const FailedEmailsList: React.FC<FailedEmailsListProps> = ({
  failedEmails,
  isRetrying,
  canRetry,
  onRetryEmail,
  onRemoveFromQueue
}) => {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {failedEmails.map((entry) => (
        <FailedEmailItem
          key={entry.id}
          entry={entry}
          canRetry={canRetry(entry)}
          isRetrying={isRetrying}
          onRetry={onRetryEmail}
          onRemove={onRemoveFromQueue}
        />
      ))}
    </div>
  );
};

export default FailedEmailsList;
