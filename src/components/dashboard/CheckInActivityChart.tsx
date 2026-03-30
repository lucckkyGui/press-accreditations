import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity } from "lucide-react";

interface CheckInChartProps {
  guests: Array<{
    checked_in_at: string | null;
    created_at: string | null;
  }>;
}

const CheckInActivityChart: React.FC<CheckInChartProps> = ({ guests }) => {
  const chartData = useMemo(() => {
    const hourMap: Record<number, number> = {};
    
    guests.forEach(g => {
      if (g.checked_in_at) {
        const hour = new Date(g.checked_in_at).getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;
      }
    });

    // Generate data for all hours that have check-ins
    const hours = Object.keys(hourMap).map(Number).sort((a, b) => a - b);
    
    if (hours.length === 0) {
      // Generate demo data for empty state
      return [
        { hour: '08:00', count: 0 },
        { hour: '10:00', count: 0 },
        { hour: '12:00', count: 0 },
        { hour: '14:00', count: 0 },
        { hour: '16:00', count: 0 },
        { hour: '18:00', count: 0 },
      ];
    }

    return hours.map(h => ({
      hour: `${h.toString().padStart(2, '0')}:00`,
      count: hourMap[h],
    }));
  }, [guests]);

  const hasData = chartData.some(d => d.count > 0);

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Aktywność check-in
        </CardTitle>
        <CardDescription>Zameldowania gości w rozbiciu na godziny</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground rounded-xl bg-primary/5 border border-dashed border-primary/20">
            <Activity className="h-10 w-10 mb-3 text-primary/30" />
            <span className="font-medium text-foreground/60">Wykres aktywności</span>
            <span className="text-xs mt-1">Dane pojawią się po pierwszych zameldowaniach</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="hour"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                allowDecimals={false}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value} gości`, 'Zameldowania']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill="hsl(var(--primary))" opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default CheckInActivityChart;
