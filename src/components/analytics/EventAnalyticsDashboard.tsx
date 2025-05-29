
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Guest, Event } from '@/types';
import { Users, Mail, QrCode, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface EventAnalyticsDashboardProps {
  event: Event;
  guests: Guest[];
}

interface EmailStats {
  sent: number;
  delivered: number;
  opened: number;
  failed: number;
  pending: number;
}

interface CheckInStats {
  checkedIn: number;
  pending: number;
  byHour: Array<{ hour: string; count: number }>;
  byZone: Array<{ zone: string; count: number; color: string }>;
}

const EventAnalyticsDashboard: React.FC<EventAnalyticsDashboardProps> = ({
  event,
  guests
}) => {
  const [realTimeStats, setRealTimeStats] = useState({
    totalGuests: guests.length,
    checkedInNow: guests.filter(g => g.status === 'checked-in').length,
    lastUpdate: new Date()
  });

  // Symulacja real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeStats(prev => ({
        ...prev,
        checkedInNow: guests.filter(g => g.status === 'checked-in').length,
        lastUpdate: new Date()
      }));
    }, 30000); // Update co 30 sekund

    return () => clearInterval(interval);
  }, [guests]);

  // Email statistics
  const emailStats: EmailStats = {
    sent: guests.filter(g => g.emailStatus === 'sent').length,
    delivered: guests.filter(g => g.emailStatus === 'sent').length, // Symulacja
    opened: Math.floor(guests.filter(g => g.emailStatus === 'sent').length * 0.7), // 70% open rate
    failed: guests.filter(g => g.emailStatus === 'failed').length,
    pending: guests.filter(g => !g.emailStatus || g.emailStatus === 'pending').length
  };

  // Check-in statistics
  const checkInStats: CheckInStats = {
    checkedIn: guests.filter(g => g.status === 'checked-in').length,
    pending: guests.filter(g => g.status !== 'checked-in').length,
    byHour: [
      { hour: '08:00', count: 45 },
      { hour: '09:00', count: 123 },
      { hour: '10:00', count: 234 },
      { hour: '11:00', count: 156 },
      { hour: '12:00', count: 89 },
      { hour: '13:00', count: 167 },
      { hour: '14:00', count: 198 }
    ],
    byZone: [
      { zone: 'VIP', count: guests.filter(g => g.zone === 'vip' && g.status === 'checked-in').length, color: '#8b5cf6' },
      { zone: 'Press', count: guests.filter(g => g.zone === 'press' && g.status === 'checked-in').length, color: '#3b82f6' },
      { zone: 'Staff', count: guests.filter(g => g.zone === 'staff' && g.status === 'checked-in').length, color: '#10b981' },
      { zone: 'General', count: guests.filter(g => g.zone === 'general' && g.status === 'checked-in').length, color: '#6b7280' }
    ]
  };

  const emailDeliveryRate = emailStats.sent > 0 ? (emailStats.delivered / emailStats.sent) * 100 : 0;
  const emailOpenRate = emailStats.sent > 0 ? (emailStats.opened / emailStats.sent) * 100 : 0;
  const checkInRate = guests.length > 0 ? (checkInStats.checkedIn / guests.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Real-time overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obecność live</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {realTimeStats.checkedInNow}
            </div>
            <p className="text-xs text-muted-foreground">
              z {realTimeStats.totalGuests} gości
            </p>
            <div className="text-xs text-muted-foreground mt-1">
              Ostatnia aktualizacja: {realTimeStats.lastUpdate.toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wysłane emaile</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.sent}</div>
            <Progress value={emailDeliveryRate} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              {emailDeliveryRate.toFixed(1)}% dostarczono
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otwarte emaile</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailStats.opened}</div>
            <Progress value={emailOpenRate} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              {emailOpenRate.toFixed(1)}% open rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in rate</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkInRate.toFixed(1)}%</div>
            <Progress value={checkInRate} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              {checkInStats.checkedIn} z {guests.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed analytics */}
      <Tabs defaultValue="checkins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
          <TabsTrigger value="emails">Email Analytics</TabsTrigger>
          <TabsTrigger value="zones">Strefy</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="checkins" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Check-ins w czasie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={checkInStats.byHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Check-ins według stref</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={checkInStats.byZone}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ zone, count }) => `${zone}: ${count}`}
                    >
                      {checkInStats.byZone.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status emaili</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Wysłane
                  </span>
                  <Badge variant="outline">{emailStats.sent}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    Oczekujące
                  </span>
                  <Badge variant="secondary">{emailStats.pending}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Błędy
                  </span>
                  <Badge variant="destructive">{emailStats.failed}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {emailDeliveryRate.toFixed(1)}%
                </div>
                <Progress value={emailDeliveryRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {emailStats.delivered} z {emailStats.sent} dostarczono
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {emailOpenRate.toFixed(1)}%
                </div>
                <Progress value={emailOpenRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {emailStats.opened} z {emailStats.sent} otworzono
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {checkInStats.byZone.map((zone) => {
              const totalInZone = guests.filter(g => g.zone === zone.zone.toLowerCase()).length;
              const rate = totalInZone > 0 ? (zone.count / totalInZone) * 100 : 0;
              
              return (
                <Card key={zone.zone}>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Strefa {zone.zone}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold" style={{ color: zone.color }}>
                      {zone.count}
                    </div>
                    <Progress value={rate} className="mt-2" />
                    <p className="text-xs text-muted-foreground">
                      {rate.toFixed(1)}% z {totalInZone} gości
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline wydarzeń</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Wydarzenie utworzone</div>
                    <div className="text-sm text-muted-foreground">
                      {event.createdAt.toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Lista gości zaimportowana</div>
                    <div className="text-sm text-muted-foreground">
                      {guests.length} gości dodano
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <Mail className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">Zaproszenia wysłane</div>
                    <div className="text-sm text-muted-foreground">
                      {emailStats.sent} zaproszeń z QR kodami
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <QrCode className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">Check-in rozpoczęty</div>
                    <div className="text-sm text-muted-foreground">
                      {checkInStats.checkedIn} gości już weszło
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventAnalyticsDashboard;
