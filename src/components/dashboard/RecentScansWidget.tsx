import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScanLine, CheckCircle, XCircle, Clock } from 'lucide-react';
import { relativeTime } from '@/utils/relativeTime';

interface ScanEntry {
  id: string;
  guestName: string;
  status: 'success' | 'denied' | 'duplicate';
  zone: string;
  timestamp: Date;
}

interface RecentScansWidgetProps {
  scans?: ScanEntry[];
}

const mockScans: ScanEntry[] = [
  { id: '1', guestName: 'Jan Kowalski', status: 'success', zone: 'VIP', timestamp: new Date(Date.now() - 120000) },
  { id: '2', guestName: 'Anna Nowak', status: 'success', zone: 'General', timestamp: new Date(Date.now() - 300000) },
  { id: '3', guestName: 'Nieznany kod', status: 'denied', zone: 'Backstage', timestamp: new Date(Date.now() - 600000) },
  { id: '4', guestName: 'Piotr Wiśniewski', status: 'duplicate', zone: 'VIP', timestamp: new Date(Date.now() - 900000) },
  { id: '5', guestName: 'Maria Kamińska', status: 'success', zone: 'Press', timestamp: new Date(Date.now() - 1800000) },
];

const statusConfig = {
  success: { icon: CheckCircle, label: 'OK', className: 'bg-success/10 text-success border-success/20' },
  denied: { icon: XCircle, label: 'Odmowa', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  duplicate: { icon: Clock, label: 'Duplikat', className: 'bg-warning/10 text-warning border-warning/20' },
};

const RecentScansWidget: React.FC<RecentScansWidgetProps> = ({ scans = mockScans }) => {
  return (
    <Card className="rounded-2xl border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <ScanLine className="h-4 w-4 text-primary" />
          </div>
          Ostatnie skany
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {scans.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Brak ostatnich skanów</p>
        ) : (
          scans.slice(0, 5).map((scan) => {
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
