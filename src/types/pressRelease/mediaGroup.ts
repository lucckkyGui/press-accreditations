
export interface MediaGroup {
  id: string;
  name: string;
  type: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  country?: string;
  city?: string;
  importance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  contactCount?: number;
  tags?: string[];
}

export interface MediaGroupForm {
  name: string;
  type: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  country?: string;
  city?: string;
  importance?: number;
  tags?: string[];
}

export interface MediaGroupsQueryParams {
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}
