
export interface PressRelease {
  id: string;
  title: string;
  content: string;
  publicationDate: string;
  eventId?: string;
  mediaGroupIds: string[];
  attachmentUrls?: string[];
  status: PressReleaseStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  sentAt?: string;
  scheduledFor?: string;
  type: PressReleaseType;
  mediaGroups?: string[];
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
  eventId?: string;
  mediaGroupIds: string[];
  attachmentUrls?: string[];
  status: PressReleaseStatus;
  type: PressReleaseType;
  scheduledFor?: string;
}

export interface PressReleasesQueryParams {
  eventId?: string;
  status?: PressReleaseStatus;
  type?: PressReleaseType;
  search?: string;
  page?: number;
  limit?: number;
}

export type PressReleaseStatus = 'draft' | 'published' | 'archived' | 'scheduled' | 'sent' | 'cancelled';
export type PressReleaseType = 'announcement' | 'invitation' | 'statement' | 'other';
