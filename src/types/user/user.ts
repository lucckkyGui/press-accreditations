
/**
 * Typy związane z użytkownikami i organizacjami
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "admin" | "organizer" | "staff" | "guest";
  createdAt: Date;
  lastActive?: Date;
  organizationId?: string;
  avatarUrl?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: NotificationPreferences;
  dashboardLayout?: Record<string, any>;
}

export interface NotificationPreferences {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  frequency?: "immediately" | "daily" | "weekly";
}

export interface Organization {
  id: string;
  name: string;
  plan: "free" | "basic" | "premium" | "enterprise";
  planExpiresAt?: Date;
  settings: OrganizationSettings;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  logoUrl?: string;
  contactEmail?: string;
  members?: User[];
}

export interface OrganizationSettings {
  emailIntegration?: EmailIntegrationConfig;
  defaultTemplates?: Record<string, string>;
  branding?: {
    logo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
  scannerSettings?: {
    autoCheckIn?: boolean;
    notifyOnScan?: boolean;
    scanSound?: boolean;
  };
}

export interface EmailIntegrationConfig {
  provider: "sendgrid" | "mailchimp" | "custom";
  apiKey?: string;
  fromEmail?: string;
  fromName?: string;
  enabled: boolean;
  templates?: EmailTemplateConfig[];
}

export interface EmailTemplateConfig {
  id: string;
  name: string;
  type: "invitation" | "reminder" | "confirmation" | "custom";
  subject: string;
  content: string;
  isDefault?: boolean;
}
