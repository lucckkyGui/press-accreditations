import { useCallback, useEffect, useState } from "react";
import { Download, FileSpreadsheet, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  countOfflineCheckedInGuests,
  exportOfflineCheckInsCsv,
  exportOfflineCheckInsPdf,
} from "@/lib/offline/offlineExport";
import { trackAction } from "@/lib/observability";

interface OfflineEmergencyExportPanelProps {
  eventId: string;
  eventName: string;
  compact?: boolean;
}

const OfflineEmergencyExportPanel = ({ eventId, eventName, compact = false }: OfflineEmergencyExportPanelProps) => {
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);

  const refreshCount = useCallback(async () => {
    setLoading(true);
    try {
      setCheckedInCount(await countOfflineCheckedInGuests(eventId));
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refreshCount();
  }, [refreshCount]);

  const handleCsvExport = async () => {
    setExporting("csv");
    try {
      const exportedCount = await exportOfflineCheckInsCsv(eventId, eventName);
      trackAction("offline_checkins_export_csv", { eventId, exportedCount });
      toast.success(`Wyeksportowano CSV: ${exportedCount} gości`);
      await refreshCount();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wyeksportować CSV");
    } finally {
      setExporting(null);
    }
  };

  const handlePdfExport = async () => {
    setExporting("pdf");
    try {
      const exportedCount = await exportOfflineCheckInsPdf(eventId, eventName);
      trackAction("offline_checkins_export_pdf", { eventId, exportedCount });
      toast.success(`Wyeksportowano PDF: ${exportedCount} gości`);
      await refreshCount();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wyeksportować PDF");
    } finally {
      setExporting(null);
    }
  };

  const disabled = checkedInCount === 0 || loading || exporting !== null;

  return (
    <Card data-testid="offline-export-panel">
      {!compact && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Eksport awaryjny offline
          </CardTitle>
          <CardDescription>
            Lista obecnych gości jest generowana bezpośrednio z IndexedDB na tym urządzeniu.
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className={compact ? "space-y-3 pt-4" : "space-y-4"}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Badge variant={checkedInCount > 0 ? "default" : "secondary"} data-testid="offline-export-count">
              {loading ? "Liczenie..." : `${checkedInCount} obecnych lokalnie`}
            </Badge>
            <p className="text-sm text-muted-foreground">{eventName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={refreshCount} disabled={loading} className="gap-2 sm:self-start">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Odśwież
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={handleCsvExport}
            disabled={disabled}
            className="gap-2"
            data-testid="offline-export-csv"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={handlePdfExport}
            disabled={disabled}
            className="gap-2"
            data-testid="offline-export-pdf"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfflineEmergencyExportPanel;
