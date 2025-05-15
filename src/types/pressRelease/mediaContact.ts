
export interface MediaContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  mediaGroupId?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  lastContact?: string;
  createdAt: string;
  updatedAt: string;
  firstName: string;
  lastName: string;
  mediaOutlet: string;
  groups: string[];
  tags?: string[];
}

export interface MediaContactForm {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  mediaGroupId?: string;
  notes?: string;
  firstName: string;
  lastName: string;
  mediaOutlet: string;
  groups: string[];
  tags?: string[];
}

export interface MediaContactsQueryParams {
  mediaGroupId?: string;
  groupId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  mediaOutlet?: string;
  tags?: string[];
}
