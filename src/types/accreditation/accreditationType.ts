
export interface AccreditationType {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  accessAreas?: string[];
  maxRequests?: number;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AccreditationTypeForm {
  eventId: string;
  name: string;
  description?: string;
  accessAreas?: string[];
  maxRequests?: number;
  requiresApproval: boolean;
}

export interface AccreditationTypesQueryParams {
  eventId?: string;
  page?: number;
  limit?: number;
}
