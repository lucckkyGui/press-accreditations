
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Guest } from '@/types';
import { RefreshCw, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface FailedEmailEntry {
  id: string;
  guest: Guest;
  error: string;
  attempts: number;
  lastAttempt: Date;
  nextRetry: Date;
}

interface EmailRetryQueueProps {
  eventId: string;
  onEmailSent: () => void;
}

const EmailRetryQueue: React.FC<EmailRetryQueueProps> = ({
  eventId,
  onEmailSent
}) => {
  const [failedEmails, setFailedEmails] = useState<FailedEmailEntry[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const { executeWithRetry } = useErrorHandler();

  // Symulacja failowanych emaili
  useEffect(() => {
    // W rzeczywistej aplikacji to by było pobierane z API
    const mockFailedEmails: FailedEmailEntry[] = [
      {
        id: '1',
        guest: {
          id: 'guest-1',
          firstName: 'Jan',
          lastName: 'Kowalski',
          email: 'jan.kowalski@invalid-domain.com',
          zone: 'general',
          status: 'invited',
          qrCode: 'qr-1'
        },
        error: 'Invalid email domain',
        attempts: 2,
        lastAttempt: new Date(Date.now() - 3600000), // 1 hour ago
        nextRetry: new Date(Date.now() + 1800000) // 30 min from now
      },
      {
        id: '2',
        guest: {
          id: 'guest-2',
          firstName: 'Anna',
          lastName: 'Nowak',
          email: 'anna.nowak@example.com',
          zone: 'vip',
          status: 'invited',
          qrCode: 'qr-2'
        },
        error: 'Rate limit exceeded',
        attempts: 1,
        lastAttempt: new Date(Date.now() - 1800000), // 30 min ago
        nextRetry: new Date(Date.now() + 600000) // 10 min from now
      }
    ];
    
    setFailedEmails(mockFailedEmails);
  }, [eventId]);

  const retryFailedEmail = async (failedEmail: FailedEmailEntry) => {
    try {
      await executeWithRetry(
        async () => {
          // Symulacja wysyłki email
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 70% szans na sukces
          if (Math.random() > 0.7) {
            throw new Error('Email delivery failed');
          }
          
          return { success: true };
        },
        `Retry email to ${failedEmail.guest.email}`,
        { maxRetries: 2 }
      );

      // Usuń z listy failed
      setFailedEmails(prev => prev.filter(e => e.id !== failedEmail.id));
      toast.success(`Email to ${failedEmail.guest.email} sent successfully!`);
      onEmailSent();
      
    } catch (error) {
      // Zwiększ liczbę prób
      setFailedEmails(prev => prev.map(e => 
        e.id === failedEmail.id 
          ? {
              ...e,
              attempts: e.attempts + 1,
              lastAttempt: new Date(),
              nextRetry: new Date(Date.now() + Math.pow(2, e.attempts) * 60000) // Exponential backoff
            }
          : e
      ));
    }
  };

  const retryAllFailed = async () => {
    setIsRetrying(true);
    setRetryProgress(0);
    
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < failedEmails.length; i += batchSize) {
      batches.push(failedEmails.slice(i, i + batchSize));
    }

    try {
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        await Promise.allSettled(
          batch.map(failedEmail => retryFailedEmail(failedEmail))
        );
        
        const progress = ((batchIndex + 1) / batches.length) * 100;
        setRetryProgress(progress);
        
        // Krótka przerwa między batch'ami
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      toast.success('Retry process completed!');
    } catch (error) {
      toast.error('Error during retry process');
    } finally {
      setIsRetrying(false);
      setRetryProgress(0);
    }
  };

  const removeFromQueue = (id: string) => {
    setFailedEmails(prev => prev.filter(e => e.id !== id));
    toast.success('Removed from retry queue');
  };

  const getErrorBadgeVariant = (attempts: number) => {
    if (attempts >= 3) return 'destructive';
    if (attempts >= 2) return 'secondary';
    return 'outline';
  };

  const canRetry = (entry: FailedEmailEntry) => {
    return new Date() >= entry.nextRetry && entry.attempts < 5;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Email Retry Queue
          <Badge variant="secondary">{failedEmails.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {failedEmails.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No failed emails in queue. All emails sent successfully!
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {failedEmails.filter(canRetry).length} emails ready for retry
              </div>
              <Button
                onClick={retryAllFailed}
                disabled={isRetrying || failedEmails.length === 0}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                Retry All
              </Button>
            </div>

            {isRetrying && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Retrying failed emails...</span>
                  <span>{Math.round(retryProgress)}%</span>
                </div>
                <Progress value={retryProgress} />
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {failedEmails.map((entry) => (
                <div key={entry.id} className="p-4 border rounded-lg space-y-2">
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
                      onClick={() => retryFailedEmail(entry)}
                      disabled={!canRetry(entry) || isRetrying}
                      className="gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      Retry Now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromQueue(entry.id)}
                      disabled={isRetrying}
                      className="gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailRetryQueue;
