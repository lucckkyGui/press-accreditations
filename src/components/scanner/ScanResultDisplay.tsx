
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, UserCheck2, UserX2 } from "lucide-react";
import { Guest } from "@/types";

interface ScanResultDisplayProps {
  guest: Guest;
  scanResult: "success" | "error";
  onRescan: () => void;
  autoScan: boolean;
}

const ScanResultDisplay: React.FC<ScanResultDisplayProps> = ({
  guest,
  scanResult,
  onRescan,
  autoScan,
}) => {
  return (
    <>
      <Alert variant={scanResult === "success" ? "default" : "destructive"} className="animate-fade-in">
        <div className="flex items-center gap-3">
          {scanResult === "success" ? (
            <UserCheck2 className="h-5 w-5" />
          ) : (
            <UserX2 className="h-5 w-5" />
          )}
          <div>
            <AlertTitle>
              {scanResult === "success" 
                ? "Dostęp przyznany" 
                : "Brak dostępu"}
            </AlertTitle>
            <AlertDescription>
              {scanResult === "success"
                ? "Gość może wejść na wydarzenie"
                : "Gość nie ma dostępu do tego wydarzenia"}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">
              {guest.firstName} {guest.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{guest.email}</p>
          </div>
          <Badge className={`
            ${guest.zone === "vip" ? "bg-amber-500" :
              guest.zone === "press" ? "bg-blue-500" :
              guest.zone === "staff" ? "bg-purple-500" :
              "bg-green-500"}
          `}>
            {guest.zone.toUpperCase()}
          </Badge>
        </div>
        
        {guest.company && (
          <div className="text-sm">
            <span className="text-muted-foreground">Firma:</span> {guest.company}
          </div>
        )}
        
        <div className="pt-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onRescan}
            className="gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {autoScan ? "Anuluj auto-skanowanie" : "Skanuj ponownie"}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ScanResultDisplay;
