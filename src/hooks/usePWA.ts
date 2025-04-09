
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  installPWA: () => Promise<void>;
}

export function usePWA(): UsePWAReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Sprawdź czy aplikacja jest już zainstalowana
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Nasłuchuj na zdarzenie beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Zapobiegnij wyświetleniu domyślnego dialogu
      e.preventDefault();
      // Zapisz zdarzenie do późniejszego użycia
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Nasłuchuj na zdarzenie appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Funkcja do instalacji PWA
  const installPWA = async (): Promise<void> => {
    if (!deferredPrompt) {
      console.log('Nie można zainstalować aplikacji');
      return;
    }

    // Wyświetl dialog instalacji
    deferredPrompt.prompt();

    // Czekaj na odpowiedź użytkownika
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('Użytkownik zaakceptował instalację PWA');
      setIsInstalled(true);
    } else {
      console.log('Użytkownik odrzucił instalację PWA');
    }
    
    // Wyczyść zapisane zdarzenie
    setDeferredPrompt(null);
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    installPWA
  };
}
