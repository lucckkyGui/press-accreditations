
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Send, Check } from 'lucide-react';
import { mockEmailService } from '@/services/api/mockEmailService';
import { EmailIntegrationConfig } from '@/types/supabase';
import { useQuery, useMutation } from '@tanstack/react-query';

const EmailIntegration = () => {
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  
  // Pobieranie konfiguracji email
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
  
  // Przygotowanie lokalnej konfiguracji do edycji
  const [emailConfig, setEmailConfig] = useState<EmailIntegrationConfig>({
    provider: "sendgrid",
    apiKey: "",
    fromEmail: "",
    fromName: "",
    enabled: false
  });
  
  // Aktualizacja lokalnej konfiguracji po pobraniu danych
  React.useEffect(() => {
    if (emailConfigData) {
      setEmailConfig(emailConfigData);
    }
  }, [emailConfigData]);
  
  // Mutacja aktualizująca konfigurację
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
  
  // Obsługa zmian w formularzach
  const handleConfigChange = (field: keyof EmailIntegrationConfig, value: any) => {
    setEmailConfig(prev => ({ ...prev, [field]: value }));
  };
  
  // Obsługa zapisywania konfiguracji
  const handleSaveConfig = async () => {
    updateConfigMutation.mutate(emailConfig);
  };
  
  // Obsługa testowania połączenia
  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await mockEmailService.testConnection(emailConfig);
      if (response.error) {
        toast.error(`Test połączenia nie powiódł się: ${response.error.message}`);
      } else {
        toast.success('Test połączenia zakończony powodzeniem');
      }
    } catch (error: any) {
      toast.error(`Błąd podczas testu połączenia: ${error?.message || 'Nieznany błąd'}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  // Obsługa wysyłania wiadomości testowej
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
    } catch (error: any) {
      toast.error(`Błąd podczas wysyłania wiadomości testowej: ${error?.message || 'Nieznany błąd'}`);
    } finally {
      setIsSendingTest(false);
    }
  };
  
  if (isConfigLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integracja z systemem mailowym</CardTitle>
          <CardDescription>Ładowanie konfiguracji...</CardDescription>
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
          <CardTitle>Integracja z systemem mailowym</CardTitle>
          <CardDescription>Wystąpił błąd podczas ładowania konfiguracji</CardDescription>
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
              onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
            />
            <Label htmlFor="email-enabled">{emailConfig.enabled ? 'Włączona' : 'Wyłączona'}</Label>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="provider">Dostawca usługi</Label>
            <Select 
              value={emailConfig.provider} 
              onValueChange={(value: 'sendgrid' | 'mailchimp' | 'custom') => handleConfigChange('provider', value)}
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
              onChange={(e) => handleConfigChange('apiKey', e.target.value)}
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
                onChange={(e) => handleConfigChange('fromEmail', e.target.value)}
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
                onChange={(e) => handleConfigChange('fromName', e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Nazwa wyświetlana jako nadawca wiadomości
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={handleSaveConfig} disabled={updateConfigMutation.isPending}>
              {updateConfigMutation.isPending ? (
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
        </div>
        
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
      </CardContent>
    </Card>
  );
};

export default EmailIntegration;
