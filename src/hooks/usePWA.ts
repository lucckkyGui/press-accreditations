
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAOptions {
  showDebugInfo?: boolean;
}

export function usePWA(options: UsePWAOptions = {}) {
  const { showDebugInfo = false } = options;
  
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installationStatus, setInstallationStatus] = useState<'none' | 'pending' | 'installed' | 'dismissed'>('none');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Sprawdź, czy aplikacja jest w trybie standalone (zainstalowana)
  useEffect(() => {
    const matchMedia = window.matchMedia('(display-mode: standalone)');
    const isStandalone = matchMedia.matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);
    
    if (showDebugInfo) {
    }
    
    // Nasłuchuj na zmiany trybu wyświetlania
    const handler = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
      if (showDebugInfo) {
      }
    };
    
    matchMedia.addEventListener('change', handler);
    return () => matchMedia.removeEventListener('change', handler);
  }, [showDebugInfo]);
  
  // Nasłuchuj na zdarzenie beforeinstallprompt, aby pokazać przycisk instalacji
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      if (showDebugInfo) {
      }
      
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [showDebugInfo]);
  
  // Nasłuchuj na zdarzenie appinstalled
  useEffect(() => {
    const handleAppInstalled = () => {
      if (showDebugInfo) {
      }
      
      setIsInstalled(true);
      setInstallPrompt(null);
      setInstallationStatus('installed');
    };
    
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, [showDebugInfo]);
  
  // Nasłuchuj na zmiany statusu online/offline
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      setIsOnline(navigator.onLine);
      if (showDebugInfo) {
      }
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [showDebugInfo]);
  
  // Funkcja do instalacji PWA
  const installPWA = async () => {
    if (!installPrompt) {
      if (showDebugInfo) {
      }
      return false;
    }
    
    setInstallationStatus('pending');
    try {
      if (showDebugInfo) {
      }
      
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        if (showDebugInfo) {
        }
        setInstallationStatus('installed');
        setIsInstalled(true);
        return true;
      } else {
        if (showDebugInfo) {
        }
        setInstallationStatus('dismissed');
        return false;
      }
    } catch (error) {
      setInstallationStatus('none');
      return false;
    } finally {
      setInstallPrompt(null);
    }
  };
  
  // Sprawdź, czy Service Worker jest zarejestrowany
  const [hasServiceWorker, setHasServiceWorker] = useState<boolean>(false);
  
  useEffect(() => {
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          setHasServiceWorker(registrations.length > 0);
          
          if (showDebugInfo) {
          }
        } catch (error) {
          setHasServiceWorker(false);
        }
      }
    };
    
    checkServiceWorker();
  }, [showDebugInfo]);
  
  // Rejestruj Service Worker jeśli jeszcze nie jest zarejestrowany
  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/serviceWorker.js');
        
        if (showDebugInfo) {
        }
        
        setHasServiceWorker(true);
        return registration;
      } catch (error) {
        return null;
      }
    }
    return null;
  };
  
  return {
    isInstallable,
    isInstalled,
    installPWA,
    installationStatus,
    isOnline,
    hasServiceWorker,
    registerServiceWorker
  };
}
