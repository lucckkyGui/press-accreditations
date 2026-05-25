
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FailedEmailEntry } from './types';
import { AlertTriangle, RefreshCw, Clock, CheckCircle, XCircle, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface EnhancedEmailRetryQueueProps {
  eventId: string;
  onEmailSent: () => void;
}

interface RetryStrategy {
  id: string;
  name: string;
  maxRetries: number;
  baseDelay: number;
  backoffMultiplier: number;
  description: string;
}

const retryStrategies: RetryStrategy[] = [
  {
    id: 'conservative',
    name: 'Konserwatywna',
    maxRetries: 3,
    baseDelay: 300000, // 5 minut
    backoffMultiplier: 2,
    description: 'Bezpieczna strategia z długimi opóźnieniami'
  },
  {
    id: 'aggressive',
    name: 'Agresywna',
    maxRetries: 5,
    baseDelay: 60000, // 1 minuta
    backoffMultiplier: 1.5,
    description: 'Szybsze retry dla pilnych wysyłek'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    maxRetries: 7,
    baseDelay: 120000, // 2 minuty
    backoffMultiplier: 1.8,
    description: 'Zoptymalizowana dla dużych wolumenów'
  }
];

const EnhancedEmailRetryQueue: React.FC<EnhancedEmailRetryQueueProps> = ({
  eventId,
  onEmailSent
}) => {
  const [failedEmails, setFailedEmails] = useState<FailedEmailEntry[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('conservative');
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(false);
  const [retryStats, setRetryStats] = useState({
    totalRetries: 0,
    successfulRetries: 0,
    permanentFailures: 0
  });

  const { executeWithRetry } = useErrorHandler();

  // Symulacja ładowania failed emaili
  useEffect(() => {
    const mockFailedEmails: FailedEmailEntry[] = [
      {
        id: '1',
        guest: {
          id: 'guest-1',
          firstName: 'Jan',
          lastName: 'Kowalski',
          email: 'jan.kowalski@invalid-domain.com',
          ticketType: 'uczestnik',
          zones: [],
          status: 'invited',
          qrCode: 'qr-1'
        },
        error: 'Invalid email domain - DNS lookup failed',
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
          email: 'anna.nowak@blocked-domain.com',
          ticketType: 'media',
          zones: [],
          status: 'invited',
          qrCode: 'qr-2'
        },
        error: 'Rate limit exceeded - server throttling',
        attempts: 1,
        lastAttempt: new Date(Date.now() - 1800000),
        nextRetry: new Date(Date.now() + 600000)
      },
      {
        id: '3',
        guest: {
          id: 'guest-3',
          firstName: 'Piotr',
          lastName: 'Wiśniewski',
          email: 'piotr.wisniewski@temporary-error.com',
          ticketType: 'media',
          zones: [],
          status: 'invited',
          qrCode: 'qr-3'
        },
        error: 'Temporary server error - 503 Service Unavailable',
        attempts: 3,
        lastAttempt: new Date(Date.now() - 900000),
        nextRetry: new Date(Date.now() + 1200000)
      }
    ];
    
    setFailedEmails(mockFailedEmails);
  }, [eventId]);

  const getCurrentStrategy = () => {
    return retryStrategies.find(s => s.id === selectedStrategy) || retryStrategies[0];
  };

  const calculateNextRetryTime = (attempts: number, strategy: RetryStrategy) => {
    const delay = strategy.baseDelay * Math.pow(strategy.backoffMultiplier, attempts - 1);
    return new Date(Date.now() + delay);
  };

  const categorizeError = (error: string) => {
    if (error.includes('DNS') || error.includes('domain')) return 'dns';
    if (error.includes('rate limit') || error.includes('throttling')) return 'rate_limit';
    if (error.includes('503') || error.includes('temporary')) return 'temporary';
    if (error.includes('bounce') || error.includes('invalid')) return 'permanent';
    return 'unknown';
  };

  const shouldRetry = (entry: FailedEmailEntry, strategy: RetryStrategy) => {
    if (entry.attempts >= strategy.maxRetries) return false;
    
    const errorType = categorizeError(entry.error);
    if (errorType === 'permanent') return false;
    
    return new Date() >= entry.nextRetry;
  };

  const retryFailedEmail = async (failedEmail: FailedEmailEntry) => {
    const strategy = getCurrentStrategy();
    
    try {
      await executeWithRetry(
        async () => {
          // Symulacja retry z różnymi prawdopodobieństwami sukcesu na podstawie typu błędu
          const errorType = categorizeError(failedEmail.error);
          let successRate = 0.7; // domyślna
          
          switch (errorType) {
            case 'temporary': successRate = 0.9; break;
            case 'rate_limit': successRate = 0.8; break;
            case 'dns': successRate = 0.6; break;
            case 'permanent': successRate = 0.1; break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (Math.random() > successRate) {
            throw new Error(`Retry failed: ${failedEmail.error}`);
          }
          
          return { success: true };
        },
        `Retry email to ${failedEmail.guest.email}`,
        { maxRetries: 1 }
      );

      // Sukces - usuń z kolejki
      setFailedEmails(prev => prev.filter(e => e.id !== failedEmail.id));
      setRetryStats(prev => ({
        ...prev,
        totalRetries: prev.totalRetries + 1,
        successfulRetries: prev.successfulRetries + 1
      }));
      
      toast.success(`Email to ${failedEmail.guest.email} sent successfully!`);
      onEmailSent();
      
    } catch (error) {
      // Niepowodzenie - aktualizuj wpis
      const newAttempts = failedEmail.attempts + 1;
      const nextRetry = calculateNextRetryTime(newAttempts, strategy);
      
      setFailedEmails(prev => prev.map(e => 
        e.id === failedEmail.id 
          ? {
              ...e,
              attempts: newAttempts,
              lastAttempt: new Date(),
              nextRetry,
              error: `${e.error} (Attempt ${newAttempts})`
            }
          : e
      ));

      setRetryStats(prev => ({
        ...prev,
        totalRetries: prev.totalRetries + 1,
        permanentFailures: newAttempts >= strategy.maxRetries ? prev.permanentFailures + 1 : prev.permanentFailures
      }));

      if (newAttempts >= strategy.maxRetries) {
        toast.error(`Permanent failure for ${failedEmail.guest.email} after ${newAttempts} attempts`);
      }
    }
  };

  const retryAllFailed = async () => {
    const strategy = getCurrentStrategy();
    const eligibleEmails = failedEmails.filter(email => shouldRetry(email, strategy));
    
    if (eligibleEmails.length === 0) {
      toast.warning('No emails are eligible for retry at this time');
      return;
    }

    setIsRetrying(true);
    setRetryProgress(0);
    
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < eligibleEmails.length; i += batchSize) {
      batches.push(eligibleEmails.slice(i, i + batchSize));
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
      
      toast.success(`Retry process completed for ${eligibleEmails.length} emails!`);
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

  const clearAllPermanentFailures = () => {
    const strategy = getCurrentStrategy();
    setFailedEmails(prev => prev.filter(e => e.attempts < strategy.maxRetries));
    toast.success('Cleared all permanent failures');
  };

  const strategy = getCurrentStrategy();
  const eligibleForRetry = failedEmails.filter(email => shouldRetry(email, strategy));
  const permanentFailures = failedEmails.filter(email => email.attempts >= strategy.maxRetries);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Enhanced Email Retry Queue
          <Badge variant="secondary">{failedEmails.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {failedEmails.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No failed emails in queue. All emails sent successfully!
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Strategia retry */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <label className="text-sm font-medium">Strategia retry:</label>
              </div>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {retryStrategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id}>
                      <div>
                        <div className="font-medium">{strategy.name}</div>
                        <div className="text-xs text-muted-foreground">{strategy.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                Max {strategy.maxRetries} prób, delay: {strategy.baseDelay/60000}min, 
                backoff: x{strategy.backoffMultiplier}
              </div>
            </div>

            {/* Statystyki */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{eligibleForRetry.length}</div>
                <div className="text-xs text-muted-foreground">Gotowe do retry</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{permanentFailures.length}</div>
                <div className="text-xs text-muted-foreground">Permanentne błędy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{retryStats.successfulRetries}</div>
                <div className="text-xs text-muted-foreground">Udane retry</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {retryStats.totalRetries > 0 ? Math.round((retryStats.successfulRetries / retryStats.totalRetries) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Success rate</div>
              </div>
            </div>

            {/* Kontrole */}
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={retryAllFailed}
                  disabled={isRetrying || eligibleForRetry.length === 0}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                  Retry {eligibleForRetry.length} emails
                </Button>
                
                {permanentFailures.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllPermanentFailures}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Clear {permanentFailures.length} permanent
                  </Button>
                )}
              </div>
            </div>

            {/* Progress retry */}
            {isRetrying && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Retrying failed emails...</span>
                  <span>{Math.round(retryProgress)}%</span>
                </div>
                <Progress value={retryProgress} />
              </div>
            )}

            {/* Lista failed emaili */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {failedEmails.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {entry.guest.firstName} {entry.guest.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground">{entry.guest.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={entry.attempts >= strategy.maxRetries ? 'destructive' : 'secondary'}>
                        {entry.attempts}/{strategy.maxRetries} attempts
                      </Badge>
                      <Badge variant="outline" className={categorizeError(entry.error)}>
                        {categorizeError(entry.error)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <div>Error: {entry.error}</div>
                    <div>Last attempt: {entry.lastAttempt.toLocaleString('pl-PL')}</div>
                    <div>Next retry: {entry.nextRetry.toLocaleString('pl-PL')}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryFailedEmail(entry)}
                      disabled={isRetrying || !shouldRetry(entry, strategy)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry now
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromQueue(entry.id)}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
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

export default EnhancedEmailRetryQueue;
