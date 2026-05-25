
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmailIntegrationHeader from './email/EmailIntegrationHeader';
import EmailConfigurationForm from './email/EmailConfigurationForm';
import EmailConfigurationActions from './email/EmailConfigurationActions';
import EmailTestSection from './email/EmailTestSection';
import { useEmailIntegration } from './email/useEmailIntegration';

const EmailIntegration = () => {
  const {
    emailConfig,
    isConfigLoading,
    configError,
    handleConfigChange,
    handleSaveConfig,
    isSaving,
    refetchConfig
  } = useEmailIntegration();
  
  if (isConfigLoading) {
    return (
      <Card>
        <CardHeader>
          <EmailIntegrationHeader 
            emailConfig={emailConfig} 
            onConfigChange={handleConfigChange}
          />
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (configError) {
    return (
      <Card>
        <CardHeader>
          <EmailIntegrationHeader 
            emailConfig={emailConfig} 
            onConfigChange={handleConfigChange}
          />
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-red-50 text-red-700">
            Nie udało się załadować konfiguracji. Spróbuj odświeżyć stronę.
          </div>
          <Button className="mt-4" variant="outline" onClick={() => refetchConfig()}>
            Spróbuj ponownie
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <EmailIntegrationHeader 
          emailConfig={emailConfig} 
          onConfigChange={handleConfigChange}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <EmailConfigurationForm 
          emailConfig={emailConfig}
          onConfigChange={handleConfigChange}
        />
        
        <EmailConfigurationActions
          emailConfig={emailConfig}
          onSave={handleSaveConfig}
          isSaving={isSaving}
        />
        
        <EmailTestSection emailConfig={emailConfig} />
      </CardContent>
    </Card>
  );
};

export default EmailIntegration;
