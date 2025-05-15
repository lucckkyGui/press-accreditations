
export interface PressRelease {
  id: string;
  title: string;
  content: string;
  publicationDate: string;
  eventId?: string;
  mediaGroupIds: string[];
  attachmentUrls?: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PressReleaseForm {
  title: string;
  content: string;
  publicationDate: string;
  eventId?: string;
  mediaGroupIds: string[];
  attachmentUrls?: string[];
  status: 'draft' | 'published' | 'archived';
}

export interface PressReleasesQueryParams {
  eventId?: string;
  status?: 'draft' | 'published' | 'archived';
  search?: string;
  page?: number;
  limit?: number;
}
