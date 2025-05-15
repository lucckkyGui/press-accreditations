
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
}

export interface MediaContactForm {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  position?: string;
  mediaGroupId?: string;
  notes?: string;
}

export interface MediaContactsQueryParams {
  mediaGroupId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}
