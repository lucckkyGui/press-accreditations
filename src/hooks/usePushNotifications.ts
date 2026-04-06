
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useI18n } from './useI18n';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UsePushNotificationsReturn {
  isPushSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  subscribeUser: () => Promise<void>;
  unsubscribeUser: () => Promise<void>;
  permissionStatus: NotificationPermission | null;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { t } = useI18n();
  const [isPushSupported, setIsPushSupported] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);

  // Sprawdź wsparcie dla powiadomień push
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true);
      checkSubscription();
      checkPermission();
    } else {
      setIsPushSupported(false);
    }
  }, []);

  // Sprawdź aktualny status uprawnień
  const checkPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.permission;
      setPermissionStatus(permission);
    }
  };

  // Sprawdź czy użytkownik jest już subskrybowany
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const currentSubscription = await (registration as any).pushManager?.getSubscription();
      
      setIsSubscribed(!!currentSubscription);
      if (currentSubscription) {
        // Konwertuj obiekt subskrypcji do formatu, który można wysłać na serwer
        const subscriptionJson = currentSubscription.toJSON() as any;
        setSubscription({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth
          }
        });
      }
    } catch (error) {
    }
  };

  // Zasubskrybuj użytkownika do powiadomień push
  const subscribeUser = async () => {
    try {
      // Najpierw poproś o uprawnienia, jeśli jeszcze nie ma
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error(t('notifications.permissionDenied'));
          return;
        }
        setPermissionStatus(permission);
      }

      const registration = await navigator.serviceWorker.ready;
      
      // W rzeczywistej aplikacji, klucz publiczny VAPID powinien pochodzić z serwera
      // Dla celów demonstracyjnych używamy fikcyjnego klucza
      const demoPublicVapidKey = 'BOz-QEQxqJ3WBolB_cmU9ZUKl9OXLPsWn7vWk0UEHZ_xzYQMm9VTMjuYnLT1QYJ2PiYLBDjzZ6kJiQsyJ5iDoVo';
      
      // Konwertuj klucz na tablicę bajtów
      const applicationServerKey = urlBase64ToUint8Array(demoPublicVapidKey);
      
      // Tworzenie subskrypcji
      const pushSubscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource
      });

      // Konwertuj obiekt subskrypcji do formatu, który można wysłać na serwer
      const subscriptionJson = pushSubscription.toJSON() as any;
      const newSubscription = {
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth
        }
      };
      
      // Tutaj powinna być funkcja wysyłająca subskrypcję na serwer
      setIsSubscribed(true);
      setSubscription(newSubscription);
      
      toast.success(t('notifications.subscribed'));
    } catch (error) {
      toast.error(t('notifications.subscriptionFailed'));
    }
  };

  // Anuluj subskrypcję użytkownika
  const unsubscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager?.getSubscription();
      
      if (subscription) {
        // Anuluj subskrypcję
        const result = await subscription.unsubscribe();
        
        if (result) {
          // Tutaj powinna być funkcja usuwająca subskrypcję z serwera
          setIsSubscribed(false);
          setSubscription(null);
          toast.success(t('notifications.unsubscribed'));
        } else {
          toast.error(t('notifications.unsubscriptionFailed'));
        }
      }
    } catch (error) {
      toast.error(t('notifications.unsubscriptionFailed'));
    }
  };

  return {
    isPushSupported,
    isSubscribed,
    subscription,
    subscribeUser,
    unsubscribeUser,
    permissionStatus
  };
}

// Funkcja pomocnicza do konwersji klucza VAPID z base64 na Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
