
import { Guest } from '@/types';

export interface FailedEmailEntry {
  id: string;
  guest: Guest;
  error: string;
  attempts: number;
  lastAttempt: Date;
  nextRetry: Date;
}

export interface EmailRetryQueueProps {
  eventId: string;
  onEmailSent: () => void;
}
