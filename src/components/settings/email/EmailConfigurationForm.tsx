
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailIntegrationConfig } from '@/types/supabase';

interface EmailConfigurationFormProps {
  emailConfig: EmailIntegrationConfig;
  onConfigChange: (field: keyof EmailIntegrationConfig, value: any) => void;
}

const EmailConfigurationForm = ({ emailConfig, onConfigChange }: EmailConfigurationFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="provider">Dostawca usługi</Label>
        <Select 
          value={emailConfig.provider} 
          onValueChange={(value: 'sendgrid' | 'mailchimp' | 'custom') => onConfigChange('provider', value)}
        >
          <SelectTrigger id="provider">
            <SelectValue placeholder="Wybierz dostawcę" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sendgrid">SendGrid</SelectItem>
            <SelectItem value="mailchimp">Mailchimp</SelectItem>
            <SelectItem value="custom">Własny SMTP</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Wybierz dostawcę usługi email, którego chcesz użyć do wysyłania wiadomości
        </p>
      </div>
      
      <div>
        <Label htmlFor="api-key">Klucz API</Label>
        <Input
          id="api-key" 
          type="password" 
          placeholder="Wprowadź klucz API" 
          value={emailConfig.apiKey || ''}
          onChange={(e) => onConfigChange('apiKey', e.target.value)}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Klucz API do uwierzytelnienia z wybranym dostawcą
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="from-email">Adres nadawcy</Label>
          <Input
            id="from-email" 
            type="email" 
            placeholder="noreply@example.com" 
            value={emailConfig.fromEmail || ''}
            onChange={(e) => onConfigChange('fromEmail', e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Adres email, z którego będą wysyłane wiadomości
          </p>
        </div>
        
        <div>
          <Label htmlFor="from-name">Nazwa nadawcy</Label>
          <Input
            id="from-name"
            placeholder="Press Acreditations"
            value={emailConfig.fromName || ''}
            onChange={(e) => onConfigChange('fromName', e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-1">
            Nazwa wyświetlana jako nadawca wiadomości
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfigurationForm;
