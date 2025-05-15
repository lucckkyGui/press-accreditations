
export type PressReleaseStatus = 'draft' | 'scheduled' | 'sent' | 'cancelled' | 'published' | 'archived';
export type PressReleaseType = 'announcement' | 'invitation' | 'statement' | 'other';

export interface PressRelease {
  id: string;
  title: string;
  content: string;
  status: PressReleaseStatus;
  type: PressReleaseType;
  publicationDate: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  sentAt?: string;
  createdBy: string;
  eventId?: string;
  mediaGroupIds: string[];
  mediaGroups?: string[];
  attachmentUrls?: string[];
  metrics?: {
    sentCount: number;
    deliveredCount: number;
    openCount: number;
    clickCount: number;
    responseCount: number;
  };
}

export interface PressReleaseForm {
  title: string;
  content: string;
  publicationDate: string;
  type: PressReleaseType;
  scheduledFor?: string;
  eventId?: string;
  mediaGroupIds: string[];
  attachmentUrls?: string[];
}

export interface PressReleasesQueryParams {
  status?: PressReleaseStatus | 'all';
  type?: PressReleaseType | 'all';
  eventId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
