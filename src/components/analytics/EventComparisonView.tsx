import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, Mail, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { EventAnalyticsData } from '@/hooks/analytics/useEventAnalytics';

interface Props {
  left: EventAnalyticsData;
  right: EventAnalyticsData;
}

function DiffBadge({ a, b, suffix = '' }: { a: number; b: number; suffix?: string }) {
  const diff = a - b;
  if (diff === 0) return <Badge variant="secondary" className="gap-1"><Minus className="h-3 w-3" />0{suffix}</Badge>;
  const positive = diff > 0;
  return (
    <Badge variant={positive ? 'default' : 'destructive'} className="gap-1">
      {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {positive ? '+' : ''}{diff}{suffix}
    </Badge>
  );
}

function KpiRow({ label, icon: Icon, leftVal, rightVal, leftSub, rightSub, suffix }: {
  label: string; icon: any; leftVal: number; rightVal: number;
  leftSub?: string; rightSub?: string; suffix?: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
          <div className="ml-auto"><DiffBadge a={leftVal} b={rightVal} suffix={suffix} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold">{leftVal}{suffix}</div>
            {leftSub && <p className="text-xs text-muted-foreground">{leftSub}</p>}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{rightVal}{suffix}</div>
            {rightSub && <p className="text-xs text-muted-foreground">{rightSub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventComparisonView({ left, right }: Props) {
  const leftRate = left.guests.total > 0 ? (left.guests.checkedIn / left.guests.total) * 100 : 0;
  const rightRate = right.guests.total > 0 ? (right.guests.checkedIn / right.guests.total) * 100 : 0;
  const leftEmailRate = left.emails.sent > 0 ? (left.emails.opened / left.emails.sent) * 100 : 0;
  const rightEmailRate = right.emails.sent > 0 ? (right.emails.opened / right.emails.sent) * 100 : 0;

  // Merge zones for comparison chart
  const allZones = new Set([
    ...left.guests.byZone.map(z => z.zone),
    ...right.guests.byZone.map(z => z.zone),
  ]);
  const zoneComparison = Array.from(allZones).map(zone => ({
    zone,
    [`${left.event.title} (łącznie)`]: left.guests.byZone.find(z => z.zone === zone)?.total || 0,
    [`${right.event.title} (łącznie)`]: right.guests.byZone.find(z => z.zone === zone)?.total || 0,
    [`${left.event.title} (obecni)`]: left.guests.byZone.find(z => z.zone === zone)?.checkedIn || 0,
    [`${right.event.title} (obecni)`]: right.guests.byZone.find(z => z.zone === zone)?.checkedIn || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Event headers */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-primary/30">
          <CardContent className="py-4">
            <h3 className="font-semibold text-lg">{left.event.title}</h3>
            <p className="text-sm text-muted-foreground">{left.event.location}</p>
            <p className="text-xs text-muted-foreground">{new Date(left.event.startDate).toLocaleDateString('pl')}</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="py-4">
            <h3 className="font-semibold text-lg">{right.event.title}</h3>
            <p className="text-sm text-muted-foreground">{right.event.location}</p>
            <p className="text-xs text-muted-foreground">{new Date(right.event.startDate).toLocaleDateString('pl')}</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiRow
          label="Łącznie gości" icon={Users}
          leftVal={left.guests.total} rightVal={right.guests.total}
          leftSub={`${left.guests.checkedIn} obecnych (${leftRate.toFixed(0)}%)`}
          rightSub={`${right.guests.checkedIn} obecnych (${rightRate.toFixed(0)}%)`}
        />
        <KpiRow
          label="Frekwencja" icon={TrendingUp}
          leftVal={Math.round(leftRate)} rightVal={Math.round(rightRate)} suffix="%"
        />
        <KpiRow
          label="Godzina szczytu" icon={Clock}
          leftVal={left.checkIns.peakCount} rightVal={right.checkIns.peakCount}
          leftSub={`Peak: ${left.checkIns.peakHour}`}
          rightSub={`Peak: ${right.checkIns.peakHour}`}
        />
        <KpiRow
          label="Email Open Rate" icon={Mail}
          leftVal={Math.round(leftEmailRate)} rightVal={Math.round(rightEmailRate)} suffix="%"
          leftSub={`${left.emails.opened}/${left.emails.sent}`}
          rightSub={`${right.emails.opened}/${right.emails.sent}`}
        />
      </div>

      {/* Zone comparison chart */}
      {zoneComparison.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Porównanie stref</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={zoneComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={`${left.event.title} (łącznie)`} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey={`${right.event.title} (łącznie)`} fill="#6b7280" radius={[4, 4, 0, 0]} />
                <Bar dataKey={`${left.event.title} (obecni)`} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey={`${right.event.title} (obecni)`} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Status comparison */}
      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((data, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{data.event.title} — statusy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Obecni', val: data.guests.checkedIn, color: 'bg-green-500' },
                { label: 'Potwierdzeni', val: data.guests.confirmed, color: 'bg-blue-500' },
                { label: 'Zaproszeni', val: data.guests.invited, color: 'bg-yellow-500' },
                { label: 'Odrzuceni', val: data.guests.declined, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.color}`} />
                    <span>{s.label}</span>
                  </div>
                  <span className="font-medium">{s.val}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
