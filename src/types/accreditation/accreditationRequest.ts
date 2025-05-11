
export type AccreditationRequestStatus = 'pending' | 'approved' | 'rejected';

export interface AccreditationRequest {
  id: string;
  eventId: string;
  userId: string;
  mediaName: string;
  mediaType: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  requestNotes?: string;
  status: AccreditationRequestStatus;
  approvalNotes?: string;
  approvalDate?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccreditationRequestForm {
  eventId: string;
  mediaName: string;
  mediaType: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  requestNotes?: string;
}

export interface AccreditationRequestsQueryParams {
  eventId?: string;
  status?: AccreditationRequestStatus | 'all';
  page?: number;
  limit?: number;
}
