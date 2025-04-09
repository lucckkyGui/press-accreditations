
import { EmailService } from './interfaces';
import { ApiResponse, EmailIntegrationConfig } from '@/types/supabase';

export class MockEmailService implements EmailService {
  private mockConfig: EmailIntegrationConfig = {
    provider: "sendgrid",
    apiKey: "SG.mock-api-key",
    fromEmail: "noreply@pressacreditations.com",
    fromName: "Press Acreditations",
    enabled: true
  };

  async testConnection(config: EmailIntegrationConfig): Promise<ApiResponse> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Symulacja testu połączenia
    if (!config.apiKey || config.apiKey.trim() === "") {
      return { 
        error: { 
          message: "Klucz API jest wymagany", 
          code: "missing_api_key" 
        } 
      };
    }

    if (!config.fromEmail || !config.fromEmail.includes("@")) {
      return { 
        error: { 
          message: "Nieprawidłowy adres email", 
          code: "invalid_email" 
        } 
      };
    }

    return { data: { success: true, message: "Połączenie testowe udane" } };
  }

  async getEmailConfiguration(): Promise<ApiResponse<EmailIntegrationConfig>> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 600));

    // Zwracamy kopię konfiguracji aby uniknąć nieoczekiwanych modyfikacji
    return { data: { ...this.mockConfig } };
  }

  async updateEmailConfiguration(config: EmailIntegrationConfig): Promise<ApiResponse> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Aktualizacja konfiguracji
    this.mockConfig = { ...config };

    return { data: { success: true, message: "Konfiguracja została zaktualizowana" } };
  }

  async sendTestEmail(to: string): Promise<ApiResponse> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Sprawdzenie, czy konfiguracja email jest włączona
    if (!this.mockConfig.enabled) {
      return { 
        error: { 
          message: "Integracja email jest wyłączona", 
          code: "email_integration_disabled" 
        } 
      };
    }

    // Sprawdzenie poprawności adresu email
    if (!to || !to.includes("@")) {
      return { 
        error: { 
          message: "Nieprawidłowy adres email", 
          code: "invalid_email" 
        } 
      };
    }

    return { data: { success: true, message: `Testowy email został wysłany na adres ${to}` } };
  }

  async getEmailTemplates(): Promise<ApiResponse<any[]>> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 700));

    const templates = [
      {
        id: "invitation_default",
        name: "Domyślne zaproszenie",
        subject: "Zostałeś zaproszony na wydarzenie {{eventName}}",
        body: "<h1>Witaj {{guestName}}!</h1><p>Zostałeś zaproszony na wydarzenie {{eventName}}, które odbędzie się {{eventDate}} w {{eventLocation}}.</p><p>Kliknij poniższy link, aby potwierdzić swój udział:</p><p><a href='{{confirmationLink}}'>Potwierdź udział</a></p>",
        isDefault: true,
        category: "invitation"
      },
      {
        id: "reminder_default",
        name: "Domyślne przypomnienie",
        subject: "Przypomnienie o wydarzeniu {{eventName}}",
        body: "<h1>Witaj {{guestName}}!</h1><p>Przypominamy o wydarzeniu {{eventName}}, które odbędzie się już jutro ({{eventDate}}) w {{eventLocation}}.</p><p>Twój kod QR:</p><img src='{{qrCodeUrl}}' alt='Kod QR' />",
        isDefault: true,
        category: "reminder"
      },
      {
        id: "custom_template_1",
        name: "Podziękowanie za udział",
        subject: "Dziękujemy za udział w {{eventName}}",
        body: "<h1>Witaj {{guestName}}!</h1><p>Dziękujemy za udział w wydarzeniu {{eventName}}. Mamy nadzieję, że było to wartościowe doświadczenie.</p><p>Z pozdrowieniami,<br/>Zespół organizacyjny</p>",
        isDefault: false,
        category: "custom"
      }
    ];

    return { data: templates };
  }

  async updateEmailTemplate(id: string, template: any): Promise<ApiResponse> {
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 800));

    return { data: { success: true, message: "Szablon email został zaktualizowany" } };
  }
}

export const mockEmailService = new MockEmailService();
