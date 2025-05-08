
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, UserCheck2, UserX2, CalendarClock } from "lucide-react";
import { Guest } from "@/types";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/useI18n";

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
  const { t } = useI18n();
  
  // Dynamicznie ustal kolor strefy
  const zoneColorMap = {
    vip: "bg-amber-500 border-amber-600 text-white",
    press: "bg-blue-500 border-blue-600 text-white",
    staff: "bg-purple-500 border-purple-600 text-white",
    general: "bg-green-500 border-green-600 text-white",
  };

  const zoneColor = zoneColorMap[guest.zone as keyof typeof zoneColorMap] || "bg-green-500 border-green-600 text-white";

  return (
    <div className="space-y-4 animate-fade-in">
      <Alert 
        variant={scanResult === "success" ? "default" : "destructive"} 
        className={cn(
          "border-l-4",
          scanResult === "success" 
            ? "border-l-green-500 bg-green-50 dark:bg-green-950/30" 
            : "border-l-red-500 bg-red-50 dark:bg-red-950/30"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-full p-2",
            scanResult === "success" 
              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400" 
              : "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
          )}>
            {scanResult === "success" ? (
              <UserCheck2 className="h-6 w-6" />
            ) : (
              <UserX2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <AlertTitle className="text-lg font-bold mb-1">
              {scanResult === "success" 
                ? t("scanner.accessGranted") 
                : t("scanner.accessDenied")}
            </AlertTitle>
            <AlertDescription className="text-base">
              {scanResult === "success"
                ? t("scanner.guestCanEnter")
                : t("scanner.guestCannotEnter")}
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <div className={cn(
        "border rounded-xl p-5 space-y-3 transition-all",
        scanResult === "success" 
          ? "shadow-[0_0_0_1px_rgba(34,197,94,0.2),0_2px_8px_rgba(34,197,94,0.1)]" 
          : "shadow-[0_0_0_1px_rgba(239,68,68,0.2),0_2px_8px_rgba(239,68,68,0.1)]"
      )}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-medium">
              {guest.firstName} {guest.lastName}
            </h3>
            <p className="text-sm text-muted-foreground">{guest.email}</p>
          </div>
          <Badge className={`${zoneColor} px-3 py-1 text-sm font-medium rounded-md shadow-sm`}>
            {guest.zone.toUpperCase()}
          </Badge>
        </div>
        
        {guest.company && (
          <div className="text-sm flex items-center gap-1">
            <span className="text-muted-foreground">{t("scanner.company")}:</span> 
            <span className="font-medium">{guest.company}</span>
          </div>
        )}
        
        {guest.checkedInAt && (
          <div className="border-t border-dashed pt-2 mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            <span>{t("scanner.firstVisit")}: {guest.checkedInAt.toLocaleTimeString()}</span>
          </div>
        )}
        
        <div className="pt-3 flex justify-end">
          <Button
            variant={autoScan ? "default" : "outline"}
            size="sm"
            onClick={onRescan}
            className={cn(
              "gap-1 transition-all duration-300",
              autoScan ? "bg-primary hover:bg-primary/90" : ""
            )}
          >
            <RefreshCw className={cn("h-3.5 w-3.5", autoScan && "animate-spin")} />
            {autoScan ? t("scanner.autoScanning") : t("scanner.rescan")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScanResultDisplay;
