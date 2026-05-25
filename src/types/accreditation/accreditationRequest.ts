
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
  // Dodatkowe pola dla pełniejszego procesu akredytacyjnego
  requestorName?: string;
  requestorPosition?: string;
  documentsUrls?: string[];
  documents?: AccreditationDocument[];
  responseDeadline?: string;
  requestType: 'media' | 'staff' | 'vip' | 'other';
  previouslyApproved?: boolean;
  specialRequirements?: string;
}

export interface AccreditationDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface AccreditationRequestForm {
  eventId: string;
  mediaName: string;
  mediaType: string;
  websiteUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  requestNotes?: string;
  requestorName?: string;
  requestorPosition?: string;
  documentsUrls?: string[];
  specialRequirements?: string;
  requestType: 'media' | 'staff' | 'vip' | 'other';
}

export interface AccreditationRequestsQueryParams {
  eventId?: string;
  status?: AccreditationRequestStatus | 'all';
  requestType?: 'media' | 'staff' | 'vip' | 'other';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AccreditationApplicationEvaluationData {
  requestId: string;
  status: 'approved' | 'rejected';
  notes?: string;
  approvedBy: string;
  accreditationTypeId?: string;
  validityStart?: string;
  validityEnd?: string;
  accessAreas?: string[];
}
