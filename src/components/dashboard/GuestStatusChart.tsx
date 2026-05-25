
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GuestStatusChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  timeRange?: "today" | "week" | "month" | "year";
  onTimeRangeChange?: (range: "today" | "week" | "month" | "year") => void;
  additionalData?: {
    attendanceByTime?: Array<{ time: string; guests: number }>;
    guestsByZone?: Array<{ zone: string; count: number; color: string }>;
    responseRates?: Array<{ 
      [key: string]: string | number;
      responseRate: number; 
      averageResponseTime: number 
    }>;
  };
}

const GuestStatusChart = ({ 
  data, 
  timeRange = "today", 
  onTimeRangeChange,
  additionalData = {}
}: GuestStatusChartProps) => {
  const [chartType, setChartType] = React.useState<string>("status");

  // Przygotowanie danych dla wykresów
  const attendanceByTimeData = additionalData?.attendanceByTime || [
    { time: '9:00', guests: 0 },
    { time: '10:00', guests: 12 },
    { time: '11:00', guests: 28 },
    { time: '12:00', guests: 35 },
    { time: '13:00', guests: 42 },
    { time: '14:00', guests: 56 },
    { time: '15:00', guests: 72 },
    { time: '16:00', guests: 81 },
    { time: '17:00', guests: 95 },
    { time: '18:00', guests: 110 },
    { time: '19:00', guests: 125 },
    { time: '20:00', guests: 137 },
  ];

  const guestsByZoneData = additionalData?.guestsByZone || [
    { zone: 'VIP', count: 35, color: '#8884d8' },
    { zone: 'Press', count: 45, color: '#82ca9d' },
    { zone: 'Staff', count: 28, color: '#ffc658' },
    { zone: 'General', count: 140, color: '#ff8042' },
  ];

  const guestResponseRateData = additionalData?.responseRates || [
    { month: 'Styczeń', responseRate: 65, averageResponseTime: 36 },
    { month: 'Luty', responseRate: 68, averageResponseTime: 32 },
    { month: 'Marzec', responseRate: 72, averageResponseTime: 28 },
    { month: 'Kwiecień', responseRate: 75, averageResponseTime: 24 },
    { month: 'Maj', responseRate: 78, averageResponseTime: 22 },
    { month: 'Czerwiec', responseRate: 82, averageResponseTime: 18 },
  ];

  // Obsługa zmiany zakresu czasu
  const handleTimeRangeChange = (value: string) => {
    if (onTimeRangeChange) {
      onTimeRangeChange(value as "today" | "week" | "month" | "year");
    }
  };

  // Dynamiczne określanie etykiety osi X dla wykresu czasu
  const getTimeAxisLabel = () => {
    switch (timeRange) {
      case "today": return "Godzina";
      case "week": return "Dzień tygodnia";
      case "month": return "Dzień miesiąca";
      case "year": return "Miesiąc";
      default: return "Czas";
    }
  };

  // Dynamiczne określanie etykiety dla danych wskaźnika odpowiedzi
  const getResponseRateLabel = () => {
    const fieldKey = Object.keys(guestResponseRateData[0] || {}).find(k => 
      k !== 'responseRate' && k !== 'averageResponseTime'
    ) || '';
    
    switch (timeRange) {
      case "month": return "Dzień";
      case "year": return "Miesiąc";
      default: return fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1);
    }
  };

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <CardTitle>Analiza gości</CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Wybierz okres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Dzisiaj</SelectItem>
              <SelectItem value="week">Ostatni tydzień</SelectItem>
              <SelectItem value="month">Ostatni miesiąc</SelectItem>
              <SelectItem value="year">Ostatni rok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="status" onValueChange={setChartType} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="status">Status gości</TabsTrigger>
            <TabsTrigger value="timeline">Przybycie w czasie</TabsTrigger>
            <TabsTrigger value="zones">Podział na strefy</TabsTrigger>
            <TabsTrigger value="response">Wskaźniki odpowiedzi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => 
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} gości`, undefined]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="timeline" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceByTimeData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" label={{ value: getTimeAxisLabel(), position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Liczba gości', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="guests"
                  name="Liczba gości"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="zones" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={guestsByZoneData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Liczba gości" fill="#8884d8">
                  {guestsByZoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="response" className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={guestResponseRateData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={Object.keys(guestResponseRateData[0] || {}).find(k => 
                    k !== 'responseRate' && k !== 'averageResponseTime'
                  ) || ''} 
                  label={{ value: getResponseRateLabel(), position: 'insideBottomRight', offset: -5 }}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="responseRate"
                  name="Wskaźnik odpowiedzi (%)"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="averageResponseTime"
                  name="Średni czas odpowiedzi (h)"
                  stroke="#10b981"
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-2 border-t text-sm text-muted-foreground">
          <p className="text-center">
            {chartType === "status" && "Proporcje gości według aktualnego statusu"}
            {chartType === "timeline" && "Dynamika przybywania gości w czasie"}
            {chartType === "zones" && "Rozkład gości według stref dostępu"}
            {chartType === "response" && "Dane o odpowiedziach na zaproszenia"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestStatusChart;
