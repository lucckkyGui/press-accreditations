
import React from "react";
import { AlertCircle, Cloud, CloudOff, Wifi, WifiOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OfflineIndicatorProps = {
  isOnline: boolean;
  pendingScans: number;
  isSyncing: boolean;
  syncProgress: number;
  lastSyncTime: Date | null;
  onSyncClick: () => void;
};

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  pendingScans,
  isSyncing,
  syncProgress,
  lastSyncTime,
  onSyncClick,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <div className="flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-full">
            <Wifi className="text-green-500 h-4 w-4 mr-2" />
            <span className="text-sm text-green-700">Online</span>
          </div>
        ) : (
          <div className="flex items-center px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
            <WifiOff className="text-amber-500 h-4 w-4 mr-2" />
            <span className="text-sm text-amber-700">Offline</span>
          </div>
        )}

        {pendingScans > 0 && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            {pendingScans} oczekujących
          </Badge>
        )}
      </div>

      {pendingScans > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <CloudOff className="h-4 w-4 mr-2 text-amber-500" />
              Dane offline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>{pendingScans} skanów do synchronizacji</span>
              {lastSyncTime && (
                <span className="text-xs text-muted-foreground">
                  Ostatnia synchronizacja: {lastSyncTime.toLocaleTimeString()}
                </span>
              )}
            </div>

            {isSyncing ? (
              <div className="space-y-2">
                <Progress value={syncProgress} className="h-2" />
                <div className="text-xs text-center text-muted-foreground">
                  Synchronizacja: {syncProgress}%
                </div>
              </div>
            ) : (
              <Button
                onClick={onSyncClick}
                disabled={!isOnline || isSyncing}
                className="w-full gap-2"
              >
                <Cloud className="h-4 w-4" />
                {isOnline ? "Synchronizuj dane" : "Połącz z internetem, aby synchronizować"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {isOnline && lastSyncTime && pendingScans === 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 text-green-500" />
            <span>Wszystkie dane zsynchronizowane</span>
          </div>
          <span className="text-xs">{lastSyncTime.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
