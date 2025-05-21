
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Smartphone, 
  AlertCircle, 
  CheckCircle,
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useI18n } from '@/hooks/useI18n';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface InstallPWAProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showOfflineIndicator?: boolean;
}

export function InstallPWA({ 
  className, 
  variant = "outline", 
  showOfflineIndicator = true 
}: InstallPWAProps) {
  const { 
    isInstallable, 
    isInstalled, 
    installPWA, 
    isOnline,
    hasServiceWorker,
    registerServiceWorker
  } = usePWA({ showDebugInfo: false });
  const { t } = useI18n();
  const [isInstalling, setIsInstalling] = useState(false);
  
  // Rejestracja Service Worker jeśli nie jest zarejestrowany
  const handleRegisterServiceWorker = async () => {
    if (!hasServiceWorker) {
      const registration = await registerServiceWorker();
      if (registration) {
        toast.success('Service Worker zarejestrowany pomyślnie');
      } else {
        toast.error('Nie udało się zarejestrować Service Worker');
      }
    }
  };

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await installPWA();
      if (result) {
        toast.success(t('notifications.appInstalled'));
      }
    } catch (error) {
      console.error('Błąd podczas instalacji PWA:', error);
      toast.error('Nie udało się zainstalować aplikacji');
    } finally {
      setIsInstalling(false);
    }
  };

  // Jeśli aplikacja jest już zainstalowana, nie pokazujemy przycisku
  if (isInstalled) {
    return null;
  }
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Wskaźnik statusu offline */}
      {showOfflineIndicator && !isOnline && (
        <Alert className="bg-amber-50 border-amber-200">
          <WifiOff className="h-4 w-4 text-amber-500" />
          <AlertTitle>Tryb offline</AlertTitle>
          <AlertDescription>
            Jesteś obecnie w trybie offline. Niektóre funkcje mogą być niedostępne.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Przycisk instalacji */}
      {isInstallable ? (
        <Button 
          variant={variant}
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`gap-2 ${className}`}
          size="sm"
        >
          <Smartphone className="h-4 w-4" />
          {isInstalling 
            ? 'Instalowanie...' 
            : t('notifications.installApp')}
        </Button>
      ) : !hasServiceWorker && (
        <Button 
          variant="ghost" 
          onClick={handleRegisterServiceWorker}
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Włącz wsparcie dla trybu offline
        </Button>
      )}
    </div>
  );
}
