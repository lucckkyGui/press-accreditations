
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { FailedEmailEntry } from './types';

export const useEmailRetryQueue = (eventId: string, onEmailSent: () => void) => {
  const [failedEmails, setFailedEmails] = useState<FailedEmailEntry[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const { executeWithRetry } = useErrorHandler();

  // Load mock failed emails (in real app this would be from API)
  useEffect(() => {
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
        lastAttempt: new Date(Date.now() - 3600000),
        nextRetry: new Date(Date.now() + 1800000)
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
        lastAttempt: new Date(Date.now() - 1800000),
        nextRetry: new Date(Date.now() + 600000)
      }
    ];
    
    setFailedEmails(mockFailedEmails);
  }, [eventId]);

  const retryFailedEmail = async (failedEmail: FailedEmailEntry) => {
    try {
      await executeWithRetry(
        async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (Math.random() > 0.7) {
            throw new Error('Email delivery failed');
          }
          
          return { success: true };
        },
        `Retry email to ${failedEmail.guest.email}`,
        { maxRetries: 2 }
      );

      setFailedEmails(prev => prev.filter(e => e.id !== failedEmail.id));
      toast.success(`Email to ${failedEmail.guest.email} sent successfully!`);
      onEmailSent();
      
    } catch (error) {
      setFailedEmails(prev => prev.map(e => 
        e.id === failedEmail.id 
          ? {
              ...e,
              attempts: e.attempts + 1,
              lastAttempt: new Date(),
              nextRetry: new Date(Date.now() + Math.pow(2, e.attempts) * 60000)
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

  const canRetry = (entry: FailedEmailEntry) => {
    return new Date() >= entry.nextRetry && entry.attempts < 5;
  };

  return {
    failedEmails,
    isRetrying,
    retryProgress,
    retryFailedEmail,
    retryAllFailed,
    removeFromQueue,
    canRetry
  };
};
