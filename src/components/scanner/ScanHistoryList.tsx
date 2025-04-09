
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, X } from "lucide-react";
import { ScanEntry } from "@/types/scanner";

type ScanHistoryListProps = {
  scanHistory: ScanEntry[];
  onClearHistory: () => void;
};

const ScanHistoryList: React.FC<ScanHistoryListProps> = ({ scanHistory, onClearHistory }) => {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>Historia skanowań</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClearHistory}>
          Wyczyść
        </Button>
      </CardHeader>
      <CardContent>
        {scanHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Brak historii skanowań
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {scanHistory.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-3 rounded-md flex justify-between items-start border ${
                    entry.successful ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div>
                    <div className="font-medium flex items-center">
                      {entry.guest.firstName} {entry.guest.lastName}
                      <Badge
                        className={`ml-2 ${
                          entry.guest.zone === "vip" ? "bg-amber-500" :
                          entry.guest.zone === "press" ? "bg-blue-500" :
                          entry.guest.zone === "staff" ? "bg-purple-500" :
                          "bg-green-500"
                        }`}
                      >
                        {entry.guest.zone}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.guest.company}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {entry.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={entry.successful ? "default" : "destructive"}>
                        {entry.successful ? "Zatwierdzone" : "Odrzucone"}
                      </Badge>
                      
                      {!entry.synced && (
                        <span className="flex items-center text-xs text-amber-600">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Niezsynch.
                        </span>
                      )}
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
