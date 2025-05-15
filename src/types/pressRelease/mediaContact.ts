
export interface MediaContact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
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

export interface MediaContactsQueryParams {
  groupId?: string;
  mediaOutlet?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}
