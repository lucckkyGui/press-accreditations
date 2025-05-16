
export type MediaDocumentStatus = 'pending' | 'approved' | 'rejected';
export type MediaDocumentType = 'press_id' | 'portfolio' | 'assignment_letter' | 'other';

export interface MediaDocument {
  id: string;
  registrationId: string;
  filePath: string;
  fileName: string;
  fileType: string;
  documentType: MediaDocumentType;
  status: MediaDocumentStatus;
  reviewerNotes?: string;
  uploadedAt: string;
  reviewedAt?: string;
}

export interface MediaDocumentForm {
  registrationId: string;
  file: File;
  documentType: MediaDocumentType;
}

export interface MediaDocumentUpdateForm {
  status?: MediaDocumentStatus;
  reviewerNotes?: string;
}

export interface MediaDocumentQueryParams {
  registrationId?: string;
  documentType?: MediaDocumentType;
  status?: MediaDocumentStatus;
}
