
// Public facing types
export type Event = {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
  organizerId: string;
  isPublished?: boolean;
  imageUrl?: string;
  category?: string;
  maxGuests?: number;
};

export type GuestZone = 'vip' | 'press' | 'staff' | 'general';
export type GuestStatus = 'invited' | 'confirmed' | 'declined' | 'checked-in';
export type GuestEmailStatus = 'sent' | 'opened' | 'failed' | 'unknown';

export type Guest = {
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
};

export type InvitationTemplate = {
  id: string;
  name: string;
  subject: string;
  content: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};
