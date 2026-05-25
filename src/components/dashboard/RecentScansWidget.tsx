import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanLine, CheckCircle, XCircle, Clock, QrCode } from 'lucide-react';
import { relativeTime } from '@/utils/relativeTime';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface ScanEntry {
  id: string;
  guestName: string;
  status: 'success' | 'denied' | 'duplicate';
  zone: string;
  timestamp: Date;
}

const statusConfig = {
  success: { icon: CheckCircle, label: 'OK', className: 'bg-success/10 text-success border-success/20' },
  denied: { icon: XCircle, label: 'Odmowa', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  duplicate: { icon: Clock, label: 'Duplikat', className: 'bg-warning/10 text-warning border-warning/20' },
};

const RecentScansWidget: React.FC = () => {
  const { user } = useAuth();

  const { data: scans = [], isLoading } = useQuery({
    queryKey: ['recentScans', user?.id],
    queryFn: async (): Promise<ScanEntry[]> => {
      if (!user?.id) return [];

      // Get organizer's events
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', user.id);

      if (!events?.length) return [];

      const eventIds = events.map(e => e.id);

      // Get recent access logs with wristband+guest join
      const { data: logs, error } = await supabase
        .from('access_logs')
        .select(`
          id, action, zone_name, created_at, denial_reason,
          wristbands!access_logs_wristband_id_fkey (
            guests!wristbands_guest_id_fkey ( first_name, last_name )
          )
        `)
        .in('event_id', eventIds)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error || !logs) return [];

      return logs.map((log: any) => {
        const guest = log.wristbands?.guests;
        const guestName = guest
          ? `${guest.first_name} ${guest.last_name}`
          : 'Nieznany';

        let status: ScanEntry['status'] = 'success';
        if (log.action === 'denied') status = 'denied';

        return {
          id: log.id,
          guestName,
          status,
          zone: log.zone_name,
          timestamp: new Date(log.created_at),
        };
      });
    },
    enabled: !!user?.id,
    refetchInterval: 15000, // Auto-refresh every 15s
  });

  return (
    <Card className="rounded-xl border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <ScanLine className="h-4 w-4 text-primary" />
              </div>
              Ostatnie skany
            </CardTitle>
            <CardDescription className="mt-1">Ostatnia aktywność wejść i odmów dostępu</CardDescription>
          </div>
          {scans.length > 0 && (
            <Badge variant="secondary" className="rounded-md text-[10px]">
              Auto-odświeżanie
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2 px-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))
        ) : scans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <QrCode className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Brak ostatnich skanów</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Po pierwszym skanie zobaczysz tutaj wynik, strefę i czas zdarzenia.
            </p>
          </div>
        ) : (
          scans.slice(0, 6).map((scan) => {
            const config = statusConfig[scan.status];
            const Icon = config.icon;
            return (
              <div key={scan.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Icon className={`h-4 w-4 shrink-0 ${scan.status === 'success' ? 'text-success' : scan.status === 'denied' ? 'text-destructive' : 'text-warning'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{scan.guestName}</p>
                  <p className="text-xs text-muted-foreground">{scan.zone} · {relativeTime(scan.timestamp)}</p>
                </div>
                <Badge variant="outline" className={`${config.className} border text-[10px] px-1.5 py-0 rounded-md shrink-0`}>
                  {config.label}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default RecentScansWidget;
