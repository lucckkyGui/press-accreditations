
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

const EmailRetryQueueEmpty: React.FC = () => {
  return (
    <Alert>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription>
        No failed emails in queue. All emails sent successfully!
      </AlertDescription>
    </Alert>
  );
};

export default EmailRetryQueueEmpty;
