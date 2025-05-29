
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { EmailIntegrationConfig } from '@/types/supabase';

interface EmailIntegrationHeaderProps {
  emailConfig: EmailIntegrationConfig;
  onConfigChange: (field: keyof EmailIntegrationConfig, value: any) => void;
}

const EmailIntegrationHeader = ({ emailConfig, onConfigChange }: EmailIntegrationHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
      <div>
        <CardTitle>Integracja z systemem mailowym</CardTitle>
        <CardDescription>
          Skonfiguruj integrację z systemem mailowym do wysyłki zaproszeń i powiadomień
        </CardDescription>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="email-enabled" 
          checked={emailConfig.enabled}
          onCheckedChange={(checked) => onConfigChange('enabled', checked)}
        />
        <Label htmlFor="email-enabled">{emailConfig.enabled ? 'Włączona' : 'Wyłączona'}</Label>
      </div>
    </div>
  );
};

export default EmailIntegrationHeader;
