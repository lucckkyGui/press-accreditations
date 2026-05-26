
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
  const [subscription] = useState<PushSubscription | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);

  // Push wymaga Service Workera. Rejestracja SW jest celowo wyłączona,
  // żeby usunąć stare cache na Safari/iOS.
  useEffect(() => {
    setIsPushSupported(false);
    checkPermission();
  }, []);

  // Sprawdź aktualny status uprawnień
  const checkPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.permission;
      setPermissionStatus(permission);
    }
  };

  // Zasubskrybuj użytkownika do powiadomień push
  const subscribeUser = async () => {
    toast.error(t('notifications.browserNotSupported'));
  };

  // Anuluj subskrypcję użytkownika
  const unsubscribeUser = async () => {
    toast.error(t('notifications.browserNotSupported'));
    setIsSubscribed(false);
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
