
import React from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { BellRing, BellOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface NotificationPermissionProps {
  className?: string;
}

export function NotificationPermission({ className }: NotificationPermissionProps) {
  const { 
    isPushSupported, 
    isSubscribed, 
    subscribeUser, 
    unsubscribeUser, 
    permissionStatus 
  } = usePushNotifications();
  const { t } = useI18n();

  if (!isPushSupported) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('notifications.notSupported')}</AlertTitle>
        <AlertDescription>
          {t('notifications.browserNotSupported')}
        </AlertDescription>
      </Alert>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('notifications.permissionDenied')}</AlertTitle>
        <AlertDescription>
          {t('notifications.enableInBrowserSettings')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {isSubscribed ? (
        <>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>{t('notifications.enabled')}</AlertTitle>
            <AlertDescription>
              {t('notifications.willReceive')}
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={unsubscribeUser} 
            className="self-start mt-2"
          >
            <BellOff className="h-4 w-4 mr-2" />
            {t('notifications.disable')}
          </Button>
        </>
      ) : (
        <Button 
          variant="default" 
          onClick={subscribeUser}
          className="self-start"
        >
          <BellRing className="h-4 w-4 mr-2" />
          {t('notifications.enable')}
        </Button>
      )}
    </div>
  );
}
