
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
      console.log('[PWA] App is in standalone mode:', isStandalone);
    }
    
    // Nasłuchuj na zmiany trybu wyświetlania
    const handler = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
      if (showDebugInfo) {
        console.log('[PWA] Display mode changed:', e.matches ? 'standalone' : 'browser');
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
        console.log('[PWA] Install prompt detected');
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
        console.log('[PWA] App was installed');
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
        console.log('[PWA] Network status changed:', navigator.onLine ? 'online' : 'offline');
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
        console.log('[PWA] No install prompt available');
      }
      return false;
    }
    
    setInstallationStatus('pending');
    try {
      if (showDebugInfo) {
        console.log('[PWA] Showing install prompt');
      }
      
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        if (showDebugInfo) {
          console.log('[PWA] User accepted the installation');
        }
        setInstallationStatus('installed');
        setIsInstalled(true);
        return true;
      } else {
        if (showDebugInfo) {
          console.log('[PWA] User dismissed the installation');
        }
        setInstallationStatus('dismissed');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Installation error:', error);
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
            console.log('[PWA] Service Worker registrations:', registrations);
          }
        } catch (error) {
          console.error('[PWA] Error checking Service Worker:', error);
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
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        }
        
        setHasServiceWorker(true);
        return registration;
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
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
