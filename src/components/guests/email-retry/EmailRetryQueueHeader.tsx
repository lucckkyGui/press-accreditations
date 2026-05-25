
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface EmailRetryQueueHeaderProps {
  failedEmailsCount: number;
}

const EmailRetryQueueHeader: React.FC<EmailRetryQueueHeaderProps> = ({
  failedEmailsCount
}) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        Email Retry Queue
        <Badge variant="secondary">{failedEmailsCount}</Badge>
      </CardTitle>
    </CardHeader>
  );
};

export default EmailRetryQueueHeader;
