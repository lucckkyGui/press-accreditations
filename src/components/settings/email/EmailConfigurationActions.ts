import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { emailConfigService } from '@/services/api/emailConfigService';
import { toast } from 'sonner';
import { EmailIntegrationConfig } from '@/types/supabase';

interface EmailConfigurationActionsProps {
  emailConfig: EmailIntegrationConfig;
}

const EmailConfigurationActions: React.FC<EmailConfigurationActionsProps> = ({ emailConfig }) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await emailConfigService.testConnection(emailConfig);
      if (response.error) {
        toast.error('Test połączenia nie powiódł się');
      } else {
        toast.success('Połączenie działa poprawnie');
      }
    } catch {
      toast.error('Błąd podczas testowania połączenia');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleTestConnection}
      disabled={isTesting}
    >
      {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
      Testuj połączenie
    </Button>
  );
};

export default EmailConfigurationActions;
