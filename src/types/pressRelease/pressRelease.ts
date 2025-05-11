
import { PaginationParams, FilterParams } from '../api/apiResponse';

export type PressReleaseStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled';
export type PressReleaseType = 'announcement' | 'invitation' | 'statement' | 'other';

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  status: PressReleaseStatus;
  type: PressReleaseType;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  sentAt?: string;
  eventId?: string;
  createdBy: string;
  mediaGroups: string[];
  attachmentUrls?: string[];
  metrics?: PressReleaseMetrics;
}

export interface PressReleaseForm {
  title: string;
  content: string;
  type: PressReleaseType;
  scheduledFor?: string;
  eventId?: string;
  mediaGroups: string[];
  attachmentUrls?: string[];
}

export interface PressReleaseMetrics {
  sentCount: number;
  deliveredCount: number;
  openCount: number;
  clickCount: number;
  responseCount: number;
}

export interface PressReleaseQueryParams extends PaginationParams, FilterParams {
  status?: PressReleaseStatus | 'all';
  type?: PressReleaseType | 'all';
  eventId?: string;
  startDate?: string;
  endDate?: string;
}
