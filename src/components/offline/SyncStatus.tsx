
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RotateCw } from "lucide-react";
import { useMigration } from '@/services/migration/migrationService';

interface SyncStatusProps {
  onSyncClick?: () => Promise<void>;
}

export function SyncStatus({ onSyncClick }: SyncStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { getPendingOperations } = useMigration();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Sprawdzanie statusu połączenia
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sprawdzanie liczby oczekujących operacji
    const checkPendingOperations = () => {
      const operations = getPendingOperations();
      setPendingCount(operations.filter(op => op.status === 'pending').length);
    };

    // Inicjalne sprawdzenie + sprawdzanie co 30 sekund
    checkPendingOperations();
    const interval = setInterval(checkPendingOperations, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [getPendingOperations]);

  const handleSync = async () => {
    if (onSyncClick && !isSyncing) {
      setIsSyncing(true);
      try {
        await onSyncClick();
        // Aktualizacja liczby oczekujących operacji
        const operations = getPendingOperations();
        setPendingCount(operations.filter(op => op.status === 'pending').length);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          
          {pendingCount > 0 && (
            <>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {pendingCount}
              </Badge>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSync}
                disabled={!isOnline || isSyncing}
                className="h-8 w-8 p-0"
              >
                <RotateCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Synchronizuj</span>
              </Button>
            </>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {isOnline 
            ? 'Połączony z siecią' 
            : 'Tryb offline - zmiany zostaną zsynchronizowane po połączeniu'}
        </p>
        {pendingCount > 0 && (
          <p className="text-xs text-yellow-600">
            {pendingCount} {pendingCount === 1 ? 'operacja czeka' : 'operacji czeka'} na synchronizację
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
