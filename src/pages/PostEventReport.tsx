import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PageContent from '@/components/layout/PageContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, Users, Mail, Clock, TrendingUp, MapPin, BarChart3, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useEventAnalytics } from '@/hooks/analytics/useEventAnalytics';
import { generateEventPdfReport } from '@/utils/pdfReportGenerator';
import { toast } from 'sonner';

const ZONE_COLORS: Record<string, string> = {
  vip: '#8b5cf6',
  press: '#3b82f6',
  staff: '#10b981',
  general: '#6b7280',
  backstage: '#f59e0b',
};

const PostEventReport = () => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  const { data: events } = useQuery({
    queryKey: ['events-for-report'],
    queryFn: async () => {
      const { data } = await supabase.from('events').select('id, title, start_date, end_date').order('start_date', { ascending: false });
      return data || [];
    },
  });

  const { data: analytics, isLoading } = useEventAnalytics(selectedEventId || undefined);

  const handleExportPdf = () => {
    if (!analytics) return;
    try {
      generateEventPdfReport(analytics);
      toast.success('Raport PDF wygenerowany pomyślnie');
    } catch {
      toast.error('Błąd podczas generowania PDF');
    }
  };

  const checkInRate = analytics && analytics.guests.total > 0
    ? (analytics.guests.checkedIn / analytics.guests.total) * 100 : 0;
  const emailOpenRate = analytics && analytics.emails.sent > 0
    ? (analytics.emails.opened / analytics.emails.sent) * 100 : 0;

  return (
    <PageContent>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raport po wydarzeniu</h1>
            <p className="text-muted-foreground">
              Analityka i eksport PDF dla sponsorów i zarządu
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Select value={selectedEventId} onValueChange={setSelectedEventId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Wybierz wydarzenie..." />
              </SelectTrigger>
              <SelectContent>
                {events?.map(e => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleExportPdf} disabled={!analytics}>
              <FileDown className="h-4 w-4 mr-2" />
              Eksport PDF
            </Button>
          </div>
        </div>

        {!selectedEventId && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg">Wybierz wydarzenie aby zobaczyć raport</p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        )}

        {analytics && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Łącznie gości</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.guests.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.guests.checkedIn} obecnych ({checkInRate.toFixed(1)}%)
                  </p>
                  <Progress value={checkInRate} className="mt-2 h-1.5" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Godzina szczytu</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.checkIns.peakHour}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.checkIns.peakCount} wejść w szczycie
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Email Open Rate</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{emailOpenRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.emails.opened} z {analytics.emails.sent} otworzono
                  </p>
                  <Progress value={emailOpenRate} className="mt-2 h-1.5" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Śr. czas pobytu</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.checkIns.avgDurationMinutes} min</div>
                  <p className="text-xs text-muted-foreground">
                    Na podstawie danych RFID
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <Tabs defaultValue="attendance" className="space-y-4">
              <TabsList>
                <TabsTrigger value="attendance">Obecność</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="zones">Strefy</TabsTrigger>
                <TabsTrigger value="emails">Emaile</TabsTrigger>
              </TabsList>

              <TabsContent value="attendance" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Status gości</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Obecni', value: analytics.guests.checkedIn, color: '#10b981' },
                              { name: 'Potwierdzeni', value: analytics.guests.confirmed, color: '#3b82f6' },
                              { name: 'Zaproszeni', value: analytics.guests.invited, color: '#f59e0b' },
                              { name: 'Odrzuceni', value: analytics.guests.declined, color: '#ef4444' },
                            ]}
                            cx="50%" cy="50%" outerRadius={100}
                            dataKey="value"
                            label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                          >
                            {[
                              { color: '#10b981' },
                              { color: '#3b82f6' },
                              { color: '#f59e0b' },
                              { color: '#ef4444' },
                            ].map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Goście według stref</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics.guests.byZone}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="zone" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="total" name="Łącznie" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="checkedIn" name="Obecni" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Check-ins w czasie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.checkIns.byHour.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={analytics.checkIns.byHour}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone" dataKey="count" name="Wejścia"
                            stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-12">Brak danych o check-inach</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="zones">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {analytics.guests.byZone.map(z => {
                    const rate = z.total > 0 ? (z.checkedIn / z.total) * 100 : 0;
                    return (
                      <Card key={z.zone}>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="h-4 w-4" style={{ color: ZONE_COLORS[z.zone] || '#6b7280' }} />
                            Strefa: {z.zone}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm mb-2">
                            <span>{z.checkedIn} / {z.total} obecnych</span>
                            <Badge variant="secondary">{rate.toFixed(0)}%</Badge>
                          </div>
                          <Progress value={rate} className="h-2" />
                          {analytics.zones.entries.find(e => e.zone === z.zone) && (
                            <div className="mt-3 text-xs text-muted-foreground grid grid-cols-3 gap-2">
                              <div>Wejścia: {analytics.zones.entries.find(e => e.zone === z.zone)?.entryCount || 0}</div>
                              <div>Wyjścia: {analytics.zones.entries.find(e => e.zone === z.zone)?.exitCount || 0}</div>
                              <div>Śr. czas: {analytics.zones.entries.find(e => e.zone === z.zone)?.avgDuration || 0} min</div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                  {analytics.guests.byZone.length === 0 && (
                    <Card className="col-span-2">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        Brak danych o strefach
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="emails">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Wysłane</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analytics.emails.sent}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Otwarte</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary">{analytics.emails.opened}</div>
                      <p className="text-xs text-muted-foreground">{emailOpenRate.toFixed(1)}% open rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Nieudane</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-destructive">{analytics.emails.failed}</div>
                      <p className="text-xs text-muted-foreground">{analytics.emails.pending} oczekujących</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageContent>
  );
};

export default PostEventReport;
