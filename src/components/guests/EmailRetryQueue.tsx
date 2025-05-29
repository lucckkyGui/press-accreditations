
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  EmailRetryQueueHeader,
  EmailRetryQueueEmpty,
  EmailRetryQueueControls,
  EmailRetryProgress,
  FailedEmailsList,
  useEmailRetryQueue
} from './email-retry';
import { EmailRetryQueueProps } from './email-retry/types';

const EmailRetryQueue: React.FC<EmailRetryQueueProps> = ({
  eventId,
  onEmailSent
}) => {
  const {
    failedEmails,
    isRetrying,
    retryProgress,
    retryFailedEmail,
    retryAllFailed,
    removeFromQueue,
    canRetry
  } = useEmailRetryQueue(eventId, onEmailSent);

  const readyForRetryCount = failedEmails.filter(canRetry).length;

  return (
    <Card>
      <EmailRetryQueueHeader failedEmailsCount={failedEmails.length} />
      <CardContent className="space-y-4">
        {failedEmails.length === 0 ? (
          <EmailRetryQueueEmpty />
        ) : (
          <>
            <EmailRetryQueueControls
              readyForRetryCount={readyForRetryCount}
              isRetrying={isRetrying}
              failedEmailsCount={failedEmails.length}
              onRetryAll={retryAllFailed}
            />

            <EmailRetryProgress
              isRetrying={isRetrying}
              retryProgress={retryProgress}
            />

            <FailedEmailsList
              failedEmails={failedEmails}
              isRetrying={isRetrying}
              canRetry={canRetry}
              onRetryEmail={retryFailedEmail}
              onRemoveFromQueue={removeFromQueue}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailRetryQueue;
