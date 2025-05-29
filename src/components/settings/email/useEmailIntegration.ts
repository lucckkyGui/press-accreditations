
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mockEmailService } from '@/services/api/mockEmailService';
import { EmailIntegrationConfig } from '@/types/supabase';

export const useEmailIntegration = () => {
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
  
  useEffect(() => {
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

  return {
    emailConfig,
    isConfigLoading,
    configError,
    handleConfigChange,
    handleSaveConfig,
    isSaving: updateConfigMutation.isPending,
    refetchConfig
  };
};
