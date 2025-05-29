
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { mockEmailService } from '@/services/api/mockEmailService';
import { EmailIntegrationConfig } from '@/types/supabase';
import { useQuery, useMutation } from '@tanstack/react-query';
import EmailIntegrationHeader from './email/EmailIntegrationHeader';
import EmailConfigurationForm from './email/EmailConfigurationForm';
import EmailConfigurationActions from './email/EmailConfigurationActions';
import EmailTestSection from './email/EmailTestSection';

const EmailIntegration = () => {
  const [emailConfig, setEmailConfig] = useState<EmailIntegrationConfig>({
    provider: "sendgrid",
    apiKey: "",
    fromEmail: "",
    fromName: "",
    enabled: false
  });
  
  const { 
    data: emailConfigData,
    isLoading: isConfigLoading,
    error: configError,
    refetch: refetchConfig
  } = useQuery({
    queryKey: ['emailConfig'],
    queryFn: async () => {
      const response = await mockEmailService.getEmailConfiguration();
      return response.data;
    }
  });
  
  React.useEffect(() => {
    if (emailConfigData) {
      setEmailConfig(emailConfigData);
    }
  }, [emailConfigData]);
  
  const updateConfigMutation = useMutation({
    mutationFn: async (config: EmailIntegrationConfig) => {
      return mockEmailService.updateEmailConfiguration(config);
    },
    onSuccess: () => {
      toast.success('Konfiguracja email została zaktualizowana');
      refetchConfig();
    },
    onError: (error: any) => {
      toast.error(`Błąd podczas aktualizacji konfiguracji: ${error?.message || 'Nieznany błąd'}`);
    }
  });
  
  const handleConfigChange = (field: keyof EmailIntegrationConfig, value: any) => {
    setEmailConfig(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveConfig = async () => {
    updateConfigMutation.mutate(emailConfig);
  };
  
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
          isSaving={updateConfigMutation.isPending}
        />
        
        <EmailTestSection emailConfig={emailConfig} />
      </CardContent>
    </Card>
  );
};

export default EmailIntegration;
