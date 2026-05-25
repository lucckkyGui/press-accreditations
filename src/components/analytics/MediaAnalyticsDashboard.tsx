
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, FileText, Calendar } from 'lucide-react';

const mediaTypesData = [
  { name: 'Telewizja', value: 35, color: '#3b82f6' },
  { name: 'Prasa', value: 28, color: '#ef4444' },
  { name: 'Radio', value: 20, color: '#10b981' },
  { name: 'Online', value: 17, color: '#f59e0b' }
];

const coverageData = [
  { month: 'Sty', articles: 45, tvReports: 12, radioSpots: 8 },
  { month: 'Lut', articles: 52, tvReports: 15, radioSpots: 10 },
  { month: 'Mar', articles: 38, tvReports: 9, radioSpots: 6 },
  { month: 'Kwi', articles: 61, tvReports: 18, radioSpots: 12 },
  { month: 'Maj', articles: 55, tvReports: 16, radioSpots: 11 },
  { month: 'Cze', articles: 67, tvReports: 22, radioSpots: 15 }
];

const attendanceData = [
  { event: 'Konferencja Tech 2024', attendees: 45, coverage: 89 },
  { event: 'Forum Biznesu', attendees: 32, coverage: 76 },
  { event: 'Startup Pitch', attendees: 28, coverage: 65 },
  { event: 'AI Summit', attendees: 51, coverage: 92 },
  { event: 'Digital Marketing', attendees: 38, coverage: 81 }
];

export default function MediaAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Akredytowani dziennikarze</p>
                <p className="text-2xl font-bold">127</p>
                <p className="text-xs text-green-600">+12% vs poprzedni miesiąc</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Publikacje medialne</p>
                <p className="text-2xl font-bold">248</p>
                <p className="text-xs text-green-600">+8% vs poprzedni miesiąc</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wydarzenia tego miesiąca</p>
                <p className="text-2xl font-bold">15</p>
                <p className="text-xs text-blue-600">3 w planowaniu</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Wskaźnik pokrycia</p>
                <p className="text-2xl font-bold">84%</p>
                <p className="text-xs text-green-600">+5% vs poprzedni miesiąc</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analityka medialna</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="coverage" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="coverage">Pokrycie medialne</TabsTrigger>
              <TabsTrigger value="types">Typy mediów</TabsTrigger>
              <TabsTrigger value="events">Wydarzenia</TabsTrigger>
            </TabsList>
            
            <TabsContent value="coverage" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={coverageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="articles" stroke="#3b82f6" name="Artykuły" />
                    <Line type="monotone" dataKey="tvReports" stroke="#ef4444" name="Reportaże TV" />
                    <Line type="monotone" dataKey="radioSpots" stroke="#10b981" name="Audycje radiowe" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="types" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <h4 className="text-lg font-medium mb-4">Podział według typu mediów</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mediaTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mediaTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">Statystyki szczegółowe</h4>
                  {mediaTypesData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-xl font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="event" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attendees" fill="#3b82f6" name="Uczestnicy" />
                    <Bar dataKey="coverage" fill="#10b981" name="Pokrycie %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
