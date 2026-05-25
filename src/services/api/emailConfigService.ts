import { EmailIntegrationConfig } from '@/types/supabase';

// Stub email service — replace with real Supabase/Resend integration
const defaultConfig: EmailIntegrationConfig = {
  provider: "resend",
  apiKey: "",
  fromEmail: "noreply@pressacreditations.com",
  fromName: "Press Acreditations",
  enabled: false,
};

export const emailConfigService = {
  async testConnection(_config: EmailIntegrationConfig) {
    return { data: undefined, error: undefined };
  },
  async getEmailConfiguration() {
    return { data: defaultConfig, error: undefined };
  },
  async updateEmailConfiguration(config: EmailIntegrationConfig) {
    return { data: config, error: undefined };
  },
  async sendTestEmail(_to: string) {
    return { data: undefined, error: undefined };
  },
};
