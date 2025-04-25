
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { RotateCw, AlertCircle } from "lucide-react";
import { ScanEntry } from "@/types/scanner";

type ScanHistoryListProps = {
  scanHistory: ScanEntry[];
  onClearHistory: () => void;
};

const ScanHistoryList: React.FC<ScanHistoryListProps> = ({ scanHistory, onClearHistory }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-semibold">Historia skanowań</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearHistory}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Wyczyść
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {scanHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Brak historii skanowań</p>
            <p className="text-sm mt-1">Zeskanuj pierwszy kod QR aby rozpocząć</p>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {scanHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    entry.successful 
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" 
                      : "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        {entry.guest.firstName} {entry.guest.lastName}
                        <Badge
                          variant="secondary"
                          className={cn(
                            entry.guest.zone === "vip" ? "bg-amber-500 text-white" :
                            entry.guest.zone === "press" ? "bg-blue-500 text-white" :
                            entry.guest.zone === "staff" ? "bg-purple-500 text-white" :
                            "bg-green-500 text-white"
                          )}
                        >
                          {entry.guest.zone.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.guest.company}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.successful ? "default" : "destructive"}>
                          {entry.successful ? "Zatwierdzone" : "Odrzucone"}
                        </Badge>
                        
                        {!entry.synced && (
                          <span className="flex items-center text-xs text-amber-600 dark:text-amber-500">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Niezsynch.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ScanHistoryList;
