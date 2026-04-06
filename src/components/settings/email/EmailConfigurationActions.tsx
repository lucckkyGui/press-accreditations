
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check } from 'lucide-react';
import { mockEmailService } from '@/services/api/mockEmailService';
import { toast } from 'sonner';
import { EmailIntegrationConfig } from '@/types/supabase';

interface EmailConfigurationActionsProps {
  emailConfig: EmailIntegrationConfig;
  onSave: () => void;
  isSaving: boolean;
}

const EmailConfigurationActions = ({ emailConfig, onSave, isSaving }: EmailConfigurationActionsProps) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await mockEmailService.testConnection(emailConfig);
      if (response.error) {
        toast.error(`Test połączenia nie powiódł się: ${response.error.message}`);
      } else {
        toast.success('Test połączenia zakończony powodzeniem');
      }
    } catch (error: Error | unknown) {
      toast.error(`Błąd podczas testu połączenia: ${error?.message || 'Nieznany błąd'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Zapisywanie...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Zapisz konfigurację
          </>
        )}
      </Button>
      
      <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
        {isTesting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testowanie...
          </>
        ) : (
          'Testuj połączenie'
        )}
      </Button>
    </div>
  );
};

export default EmailConfigurationActions;
