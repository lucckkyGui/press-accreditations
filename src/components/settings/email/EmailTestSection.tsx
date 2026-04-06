
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { mockEmailService } from '@/services/api/mockEmailService';
import { toast } from 'sonner';
import { EmailIntegrationConfig } from '@/types/supabase';

interface EmailTestSectionProps {
  emailConfig: EmailIntegrationConfig;
}

const EmailTestSection = ({ emailConfig }: EmailTestSectionProps) => {
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      toast.error('Wprowadź prawidłowy adres email');
      return;
    }
    
    setIsSendingTest(true);
    try {
      const response = await mockEmailService.sendTestEmail(testEmailAddress);
      if (response.error) {
        toast.error(`Wysyłanie wiadomości testowej nie powiodło się: ${response.error.message}`);
      } else {
        toast.success(`Wiadomość testowa została wysłana na adres ${testEmailAddress}`);
      }
    } catch (error: unknown) {
      toast.error(`Błąd podczas wysyłania wiadomości testowej: ${error?.message || 'Nieznany błąd'}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-medium mb-4">Wyślij wiadomość testową</h3>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-grow">
          <Label htmlFor="test-email">Adres email</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={testEmailAddress}
            onChange={(e) => setTestEmailAddress(e.target.value)}
          />
        </div>
        <div className="self-end">
          <Button 
            onClick={handleSendTestEmail} 
            disabled={isSendingTest || !emailConfig.enabled}
            className="w-full sm:w-auto"
          >
            {isSendingTest ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Wyślij test
              </>
            )}
          </Button>
        </div>
      </div>
      {!emailConfig.enabled && (
        <p className="text-sm text-amber-600 mt-2">
          Aby wysłać wiadomość testową, musisz najpierw włączyć integrację z systemem mailowym.
        </p>
      )}
    </div>
  );
};

export default EmailTestSection;
