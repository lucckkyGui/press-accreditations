import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Database, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { downloadEventManifest, localDb, type DownloadEventManifestProgress, type EventManifestRecord } from "@/lib/db/localDb";
import type { Event } from "@/types";

interface OfflineEventManifestCardProps {
  event: Event;
}

interface DownloadState {
  downloaded: number;
  total?: number;
  phase: DownloadEventManifestProgress["phase"];
}

const formatDownloadedAt = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Nie udało się pobrać wydarzenia do trybu offline";

const OfflineEventManifestCard = ({ event }: OfflineEventManifestCardProps) => {
  const [manifest, setManifest] = useState<EventManifestRecord | null>(null);
  const [downloadState, setDownloadState] = useState<DownloadState | null>(null);
  const [loadingManifest, setLoadingManifest] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;

    setLoadingManifest(true);
    localDb.eventManifest
      .get(event.id)
      .then((record) => {
        if (active) {
          setManifest(record ?? null);
        }
      })
      .catch(() => {
        if (active) {
          setManifest(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingManifest(false);
        }
      });

    return () => {
      active = false;
    };
  }, [event.id]);

  const progressValue = useMemo(() => {
    if (!downloadState) return 0;
    if (downloadState.phase === "done") return 100;
    if (downloadState.phase === "saving") return 95;
    if (!downloadState.total || downloadState.total <= 0) return downloadState.downloaded > 0 ? 50 : 5;

    return Math.min(95, Math.round((downloadState.downloaded / downloadState.total) * 100));
  }, [downloadState]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    setDownloadState({
      downloaded: 0,
      total: event.maxGuests && event.maxGuests > 0 ? event.maxGuests : undefined,
      phase: "fetching",
    });

    try {
      const nextManifest = await downloadEventManifest(event.id, (progress) => {
        setDownloadState({
          downloaded: progress.downloaded,
          total: progress.total,
          phase: progress.phase,
        });
      });

      setManifest(nextManifest);
      toast.success(`Pobrano wydarzenie offline: ${nextManifest.guestCount} gości`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }, [event.id, event.maxGuests]);

  const statusLabel = manifest
    ? `${manifest.guestCount} gości, ${formatDownloadedAt(manifest.downloadedAt)}`
    : loadingManifest
      ? "Sprawdzanie lokalnego manifestu..."
      : "Wydarzenie nie jest jeszcze zapisane offline";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Pobierz wydarzenie do trybu offline
        </CardTitle>
        <CardDescription>{event.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {manifest ? (
                <Badge className="gap-1 bg-green-600">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Gotowe offline
                </Badge>
              ) : (
                <Badge variant="secondary">Nie pobrano</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{statusLabel}</p>
          </div>

          <Button onClick={handleDownload} disabled={downloading} className="gap-2 sm:min-w-44" data-testid="download-manifest">
            {downloading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {manifest ? "Odśwież manifest" : "Pobierz"}
          </Button>
        </div>

        {downloadState && (
          <div className="space-y-2">
            <Progress value={progressValue} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {downloadState.phase === "saving"
                  ? "Zapisywanie w IndexedDB"
                  : `Pobrano ${downloadState.downloaded}${downloadState.total ? ` z ${downloadState.total}` : ""}`}
              </span>
              <span>{progressValue}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfflineEventManifestCard;
