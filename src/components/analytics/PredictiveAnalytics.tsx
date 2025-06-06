
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Target, Brain, Zap } from 'lucide-react';

const attendanceForecastData = [
  { time: '09:00', predicted: 15, actual: 12, confidence: 85 },
  { time: '10:00', predicted: 45, actual: 42, confidence: 88 },
  { time: '11:00', predicted: 78, actual: 75, confidence: 92 },
  { time: '12:00', predicted: 120, actual: 118, confidence: 89 },
  { time: '13:00', predicted: 145, actual: null, confidence: 87 },
  { time: '14:00', predicted: 165, actual: null, confidence: 85 },
  { time: '15:00', predicted: 185, actual: null, confidence: 83 },
  { time: '16:00', predicted: 220, actual: null, confidence: 81 },
  { time: '17:00', predicted: 240, actual: null, confidence: 79 },
  { time: '18:00', predicted: 255, actual: null, confidence: 77 }
];

const riskAnalysisData = [
  { category: 'Przepełnienie', risk: 15, impact: 'Średni' },
  { category: 'Bezpieczeństwo', risk: 8, impact: 'Wysoki' },
  { category: 'Logistyka', risk: 25, impact: 'Niski' },
  { category: 'Pogoda', risk: 35, impact: 'Średni' },
  { category: 'Transport', risk: 12, impact: 'Wysoki' }
];

const behaviorPatternsData = [
  { pattern: 'Check-in grupowy', frequency: 35, trend: '+12%' },
  { pattern: 'Późne przybycia', frequency: 22, trend: '-8%' },
  { pattern: 'VIP fast-track', frequency: 18, trend: '+25%' },
  { pattern: 'Media early access', frequency: 15, trend: '+5%' },
  { pattern: 'No-show pattern', frequency: 10, trend: '-15%' }
];

const PredictiveAnalytics: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState('current');
  const [timeRange, setTimeRange] = useState('today');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analityka predykcyjna AI</h2>
        <div className="flex gap-2">
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Wybierz wydarzenie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Bieżące wydarzenie</SelectItem>
              <SelectItem value="next">Następne wydarzenie</SelectItem>
              <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Okres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Dzisiaj</SelectItem>
              <SelectItem value="week">Tydzień</SelectItem>
              <SelectItem value="month">Miesiąc</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kluczowe metryki AI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dokładność AI</p>
                <p className="text-2xl font-bold">94.2%</p>
                <p className="text-xs text-green-600">+2.1% vs poprzedni okres</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prognoza frekwencji</p>
                <p className="text-2xl font-bold">255</p>
                <p className="text-xs text-blue-600">87% pewności</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wykryte ryzyko</p>
                <p className="text-2xl font-bold">Niskie</p>
                <p className="text-xs text-green-600">15% prawdopodobieństwo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Optymalizacja</p>
                <p className="text-2xl font-bold">+18%</p>
                <p className="text-xs text-green-600">Sprawność procesów</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="forecast" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast">Prognoza frekwencji</TabsTrigger>
          <TabsTrigger value="risk">Analiza ryzyka</TabsTrigger>
          <TabsTrigger value="behavior">Wzorce zachowań</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prognoza przybyć na wydarzenie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceForecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value} osób`, 
                        name === 'predicted' ? 'Prognoza' : 'Rzeczywiste'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="predicted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="actual"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Rekomendacje AI:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Szczyt frekwencji przewidywany o 18:00 (255 osób)</li>
                  <li>• Zalecane zwiększenie personelu o 15:00</li>
                  <li>• Możliwe opóźnienia przy wejściu między 17:00-19:00</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza ryzyka wydarzeń</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Ryzyko']} />
                    <Bar dataKey="risk" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {riskAnalysisData.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.category}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.impact === 'Wysoki' ? 'bg-red-100 text-red-800' :
                        item.impact === 'Średni' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.impact} wpływ
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Prawdopodobieństwo: {item.risk}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analiza wzorców zachowań gości</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {behaviorPatternsData.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{pattern.pattern}</h4>
                      <p className="text-sm text-muted-foreground">
                        Częstotliwość: {pattern.frequency}% gości
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded text-sm ${
                        pattern.trend.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pattern.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium mb-2">Insights AI:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Wzrost check-inów grupowych - rozważ dedykowane stanowiska</li>
                  <li>• Spadek spóźnień - skuteczność przypomnień email</li>
                  <li>• VIP preferują szybkie ścieżki - utrzymaj priorytet</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;
