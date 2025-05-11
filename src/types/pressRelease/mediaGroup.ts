
import { PaginationParams, FilterParams } from '../api/apiResponse';

export interface MediaGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  contactCount: number;
  tags?: string[];
}

export interface MediaGroupForm {
  name: string;
  description?: string;
  tags?: string[];
}

export interface MediaContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mediaOutlet: string;
  position?: string;
  notes?: string;
  groups: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaContactForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mediaOutlet: string;
  position?: string;
  notes?: string;
  groups: string[];
  tags?: string[];
}

export interface MediaGroupQueryParams extends PaginationParams, FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MediaContactQueryParams extends PaginationParams, FilterParams {
  groupId?: string;
  search?: string;
  mediaOutlet?: string;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
