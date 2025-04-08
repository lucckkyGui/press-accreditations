
export type GuestStatus = "invited" | "confirmed" | "declined" | "checked-in";
export type GuestZone = "general" | "vip" | "press" | "staff";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  zone: GuestZone;
  status: GuestStatus;
  qrCode?: string;
  invitationSentAt?: Date;
  invitationOpenedAt?: Date;
  checkedInAt?: Date;
  notes?: string;
  dietaryRequirements?: string;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  organizerId: string;
  isPublished: boolean;
  guests?: Guest[];
}
