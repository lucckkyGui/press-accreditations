
export type GuestStatus = "invited" | "confirmed" | "declined" | "checked-in";
export type GuestZone = "vip" | "press" | "staff" | "general";
export type GuestEmailStatus = "sent" | "opened" | "failed" | "pending";

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code: string;
  };
  pagination?: Pagination;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  isPublished: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  imageUrl?: string;
  customFields?: Record<string, any>;
  category?: string;
  maxGuests?: number;
  organizerId?: string; // Compatibility field
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pesel?: string;
  company?: string;
  phone?: string;
  zone: GuestZone;
  status: GuestStatus;
  emailStatus?: GuestEmailStatus;
  qrCode: string;
  invitationSentAt?: Date;
  invitationOpenedAt?: Date;
  checkedInAt?: Date;
  notes?: string;
  customFieldValues?: Record<string, any>;
}

export interface ProcessedGuest {
  firstName: string;
  lastName: string;
  email: string;
  pesel: string;
  company: string;
  phone: string;
  zone: GuestZone;
  valid: boolean;
  errors: string[];
  selected: boolean;
}
