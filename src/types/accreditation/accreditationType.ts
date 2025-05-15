
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
  // Dodatkowe pola dla lepszego zarządzania typami akredytacji
  color?: string;
  badgeTemplate?: string;
  displayOrder?: number;
  validityPeriod?: {
    start?: string;
    end?: string;
  };
  accessLevels?: AccessLevel[];
  displayInPublicForm: boolean;
  availableForMediaOnly: boolean;
}

export interface AccessLevel {
  id: string;
  name: string;
  description?: string;
  areaId: string;
}

export interface AccreditationTypeForm {
  eventId: string;
  name: string;
  description?: string;
  accessAreas?: string[];
  maxRequests?: number;
  requiresApproval: boolean;
  color?: string;
  badgeTemplate?: string;
  displayOrder?: number;
  validityPeriod?: {
    start?: string;
    end?: string;
  };
  accessLevels?: AccessLevel[];
  displayInPublicForm?: boolean;
  availableForMediaOnly?: boolean;
}

export interface AccreditationTypesQueryParams {
  eventId?: string;
  displayInPublicForm?: boolean;
  availableForMediaOnly?: boolean;
  page?: number;
  limit?: number;
}
