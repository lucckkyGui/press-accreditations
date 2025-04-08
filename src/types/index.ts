export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  organizerId: string;
  isPublished: boolean;
}

export type GuestZone = "vip" | "press" | "staff" | "general";
export type GuestStatus = "invited" | "confirmed" | "declined" | "checked-in";
export type GuestEmailStatus = "sent" | "opened" | "failed" | "unknown";

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  zone: GuestZone;
  status: GuestStatus;
  emailStatus?: GuestEmailStatus;
  qrCode: string;
  invitationSentAt?: Date;
  invitationOpenedAt?: Date;
  checkedInAt?: Date;
}
