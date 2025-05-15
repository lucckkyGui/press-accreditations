
export interface MediaGroup {
  id: string;
  name: string;
  type: string;
  description?: string;
  importance: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  contactCount: number;
  tags?: string[];
}

export interface MediaGroupForm {
  name: string;
  type?: string;
  description?: string;
  tags?: string[];
  importance?: number;
}

export interface MediaGroupsQueryParams {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}
