
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RotateCw, CloudDownload } from "lucide-react";
import { useMigration } from '@/services/migration/migrationService';
import { Progress } from "@/components/ui/progress";

interface SyncStatusProps {
  onSyncClick?: () => Promise<void>;
}

export function SyncStatus({ onSyncClick }: SyncStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const { getPendingOperations } = useMigration();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // Check connection status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check pending operations count
    const checkPendingOperations = () => {
      const operations = getPendingOperations();
      setPendingCount(operations.filter(op => op.status === 'pending').length);
    };

    // Initial check + check every 30 seconds
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
      setShowProgress(true);
      setSyncProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          const newProgress = prev + Math.random() * 20;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 300);
      
      try {
        await onSyncClick();
        // Update pending operations count
        const operations = getPendingOperations();
        setPendingCount(operations.filter(op => op.status === 'pending').length);
        setSyncProgress(100);
        
        // Hide progress bar after a short delay
        setTimeout(() => {
          setShowProgress(false);
        }, 1000);
      } catch (error) {
        console.error("Sync failed:", error);
      } finally {
        clearInterval(progressInterval);
        setIsSyncing(false);
      }
    }
  };

  // Determine icon and status color
  const StatusIcon = isOnline ? Wifi : WifiOff;
  const statusColor = isOnline ? "text-green-500" : "text-red-500";
  const IconToShow = isSyncing ? CloudDownload : StatusIcon;

  return (
    <div className="flex flex-col">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md">
            <div className={`${isSyncing ? 'text-blue-500 animate-pulse' : statusColor}`}>
              <IconToShow className="h-4 w-4" />
            </div>
            
            {pendingCount > 0 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {pendingCount}
              </Badge>
            )}
            
            {pendingCount > 0 && (
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
      
      {showProgress && (
        <div className="mt-1 w-32">
          <Progress value={syncProgress} className="h-1 bg-gray-200" />
        </div>
      )}
    </div>
  );
}
