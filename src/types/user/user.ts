
export type UserRole = 'admin' | 'organizer' | 'staff' | 'guest';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
}

// Additional types that are referenced but not defined
export interface UserPreferences {
  notifications: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
}

export interface OrganizationSettings {
  allowGuests: boolean;
  requireApproval: boolean;
  autoCheckIn: boolean;
}

export interface EmailIntegrationConfig {
  provider: string;
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  enabled: boolean;
}

export interface EmailTemplateConfig {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}
