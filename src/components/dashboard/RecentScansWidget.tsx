import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanLine, CheckCircle, XCircle, Clock } from 'lucide-react';
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

      return logs.map((log: Error) => {
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
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <ScanLine className="h-4 w-4 text-primary" />
          </div>
          Ostatnie skany
          {scans.length > 0 && (
            <Badge variant="secondary" className="ml-auto text-[10px] rounded-lg">
              Live
            </Badge>
          )}
        </CardTitle>
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
          <p className="text-sm text-muted-foreground text-center py-4">Brak ostatnich skanów</p>
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
