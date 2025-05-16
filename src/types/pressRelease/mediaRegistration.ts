
import { User } from '@/types/user/user';
import { MediaDocument } from './mediaDocument';

export type MediaRegistrationStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface SocialMedia {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  other?: Record<string, string>;
}

export interface MediaRegistration {
  id: string;
  userId: string;
  eventId: string;
  mediaOrganization: string;
  jobTitle: string;
  website?: string;
  socialMedia?: SocialMedia;
  previousAccreditation?: boolean;
  coverageDescription?: string;
  status: MediaRegistrationStatus;
  reviewerId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined fields
  user?: User;
  documents?: MediaDocument[];
}

export interface MediaRegistrationForm {
  eventId: string;
  mediaOrganization: string;
  jobTitle: string;
  website?: string;
  socialMedia?: SocialMedia;
  previousAccreditation?: boolean;
  coverageDescription?: string;
}

export interface MediaRegistrationUpdateForm extends Partial<MediaRegistrationForm> {
  status?: MediaRegistrationStatus;
  rejectionReason?: string;
}

export interface MediaRegistrationQueryParams {
  eventId?: string;
  userId?: string;
  status?: MediaRegistrationStatus;
  limit?: number;
  offset?: number;
}
