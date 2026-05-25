
import { useState, useEffect } from 'react';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  wasOffline: boolean;
  since: Date | null;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [since, setSince] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      
      // Jeśli wcześniej był offline, zapamiętaj to
      if (!isOnline) {
        setWasOffline(true);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSince(new Date());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  // Resetuj wasOffline po 5 minutach online
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isOnline && wasOffline) {
      timeoutId = setTimeout(() => {
        setWasOffline(false);
        setSince(null);
      }, 5 * 60 * 1000); // 5 minut
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOnline, wasOffline]);

  return { isOnline, wasOffline, since };
}
