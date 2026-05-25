import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const OnlineStatusToast = () => {
  const wasOffline = useRef(false);

  useEffect(() => {
    const handleOffline = () => {
      wasOffline.current = true;
      toast.warning('Brak połączenia z internetem', {
        description: 'Niektóre funkcje mogą być niedostępne.',
        duration: Infinity,
        id: 'offline-status',
      });
    };

    const handleOnline = () => {
      toast.dismiss('offline-status');
      if (wasOffline.current) {
        toast.success('Połączenie przywrócone', { duration: 3000 });
        wasOffline.current = false;
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null;
};

export default OnlineStatusToast;
