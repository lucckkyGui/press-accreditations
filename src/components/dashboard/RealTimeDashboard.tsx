
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Users, Mail, QrCode, Clock, TrendingUp } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RealTimeStats {
  totalGuests: number;
  checkedIn: number;
  emailsSent: number;
  emailsOpened: number;
  lastUpdate: Date;
  activityData: Array<{ time: string; checkins: number; emails: number }>;
}

const RealTimeDashboard: React.FC = () => {
  const [stats, setStats] = useState<RealTimeStats>({
    totalGuests: 0,
    checkedIn: 0,
    emailsSent: 0,
    emailsOpened: 0,
    lastUpdate: new Date(),
    activityData: []
  });

  const [isLive, setIsLive] = useState(true);

  // Symulacja real-time updates co 5 sekund
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setStats(prev => {
        const newCheckedIn = Math.min(prev.checkedIn + Math.floor(Math.random() * 3), prev.totalGuests);
        const newEmailsOpened = Math.min(prev.emailsOpened + Math.floor(Math.random() * 5), prev.emailsSent);
        
        const currentTime = new Date().toLocaleTimeString('pl-PL', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });

        const newActivityPoint = {
          time: currentTime,
          checkins: newCheckedIn - prev.checkedIn,
          emails: newEmailsOpened - prev.emailsOpened
        };

        return {
          ...prev,
          checkedIn: newCheckedIn,
          emailsOpened: newEmailsOpened,
          lastUpdate: new Date(),
          activityData: [...prev.activityData.slice(-19), newActivityPoint]
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Initialize with sample data
  useEffect(() => {
    setStats({
      totalGuests: 3000,
      checkedIn: 245,
      emailsSent: 2850,
      emailsOpened: 1995,
      lastUpdate: new Date(),
      activityData: [
        { time: '08:00', checkins: 12, emails: 0 },
        { time: '08:30', checkins: 28, emails: 15 },
        { time: '09:00', checkins: 45, emails: 32 },
        { time: '09:30', checkins: 67, emails: 28 },
        { time: '10:00', checkins: 89, emails: 41 }
      ]
    });
  }, []);

  const checkInRate = stats.totalGuests > 0 ? (stats.checkedIn / stats.totalGuests) * 100 : 0;
  const emailOpenRate = stats.emailsSent > 0 ? (stats.emailsOpened / stats.emailsSent) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm font-medium">
            {isLive ? 'Na żywo' : 'Wstrzymane'}
          </span>
          <span className="text-xs text-muted-foreground">
            Ostatnia aktualizacja: {stats.lastUpdate.toLocaleTimeString('pl-PL')}
          </span>
        </div>
        <button
          onClick={() => setIsLive(!isLive)}
          className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
        >
          {isLive ? 'Zatrzymaj' : 'Uruchom'}
        </button>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszyscy goście</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests.toLocaleString('pl-PL')}</div>
            <p className="text-xs text-muted-foreground">Zarejestrowanych</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in na żywo</CardTitle>
            <QrCode className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.checkedIn}</div>
            <Progress value={checkInRate} className="mt-2" />
            <p className="text-xs text-muted-foreground">{checkInRate.toFixed(1)}% obecnych</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emaile wysłane</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsSent.toLocaleString('pl-PL')}</div>
            <p className="text-xs text-muted-foreground">
              z {stats.totalGuests.toLocaleString('pl-PL')} planowanych
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Otwarte emaile</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.emailsOpened.toLocaleString('pl-PL')}</div>
            <Progress value={emailOpenRate} className="mt-2" />
            <p className="text-xs text-muted-foreground">{emailOpenRate.toFixed(1)}% open rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Live activity chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Aktywność na żywo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats.activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  value, 
                  name === 'checkins' ? 'Check-ins' : 'Otwarte emaile'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="checkins" 
                stackId="1"
                stroke="#22c55e" 
                fill="#22c55e" 
                fillOpacity={0.6}
                name="checkins"
              />
              <Area 
                type="monotone" 
                dataKey="emails" 
                stackId="1"
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
                name="emails"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <QrCode className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">Aktywne skanowanie</div>
                <div className="text-sm text-muted-foreground">
                  {stats.checkedIn > 0 ? `Ostatni check-in: teraz` : 'Brak aktywności'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">Status wysyłki</div>
                <div className="text-sm text-muted-foreground">
                  {stats.emailsSent === stats.totalGuests ? 'Zakończone' : 'W toku'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">Engagement</div>
                <div className="text-sm text-muted-foreground">
                  {emailOpenRate > 60 ? 'Wysoki' : emailOpenRate > 30 ? 'Średni' : 'Niski'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
