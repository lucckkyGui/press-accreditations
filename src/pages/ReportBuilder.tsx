import React, { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, PieChart, LineChart, Download, Plus, Trash2, Filter, Save, FileBarChart, TrendingUp, Eye } from "lucide-react";
import { toast } from "sonner";

const ReportBuilder = () => {
  usePageTitle("Kreator raportów");
  const [reportName, setReportName] = useState("Nowy raport");
  const [widgets, setWidgets] = useState([
    { id: 1, type: "bar", title: "Goście wg statusu", metric: "guests_by_status" },
    { id: 2, type: "line", title: "Check-iny w czasie", metric: "checkins_over_time" },
    { id: 3, type: "number", title: "Łączna liczba gości", metric: "total_guests" },
  ]);

  const availableMetrics = [
    { value: "guests_by_status", label: "Goście wg statusu" },
    { value: "checkins_over_time", label: "Check-iny w czasie" },
    { value: "total_guests", label: "Łączna liczba gości" },
    { value: "email_open_rate", label: "Współczynnik otwarć email" },
    { value: "accreditation_by_type", label: "Akredytacje wg typu" },
    { value: "attendance_rate", label: "Frekwencja" },
    { value: "zone_occupancy", label: "Obłożenie stref" },
    { value: "revenue_by_ticket", label: "Przychody wg biletów" },
  ];

  const chartTypes = [
    { value: "bar", label: "Wykres słupkowy", icon: BarChart3 },
    { value: "line", label: "Wykres liniowy", icon: LineChart },
    { value: "pie", label: "Wykres kołowy", icon: PieChart },
    { value: "number", label: "Liczba", icon: TrendingUp },
  ];

  const savedReports = [
    { name: "Raport tygodniowy", widgets: 5, lastRun: "2026-04-05", schedule: "Co tydzień" },
    { name: "Analiza frekwencji", widgets: 3, lastRun: "2026-04-03", schedule: "Jednorazowy" },
    { name: "ROI sponsorów", widgets: 8, lastRun: "2026-04-01", schedule: "Co miesiąc" },
  ];

  const addWidget = () => {
    setWidgets(prev => [...prev, { id: Date.now(), type: "bar", title: "Nowy widget", metric: "total_guests" }]);
    toast.success("Widget dodany");
  };

  const removeWidget = (id: number) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  // Mock benchmark data
  const benchmarks = [
    { metric: "Frekwencja", yours: 78, industry: 65, diff: "+13%" },
    { metric: "Open rate email", yours: 42, industry: 35, diff: "+7%" },
    { metric: "Czas check-in", yours: 8, industry: 15, diff: "-47%" },
    { metric: "Retencja gości", yours: 61, industry: 52, diff: "+9%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kreator Raportów</h1>
          <p className="text-muted-foreground">Twórz niestandardowe raporty i dashboardy</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => toast.success("Raport zapisany")}><Save className="h-4 w-4 mr-2" /> Zapisz</Button>
          <Button onClick={() => toast.success("Raport wyeksportowany")}><Download className="h-4 w-4 mr-2" /> Eksportuj PDF</Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-4">
        <TabsList>
          <TabsTrigger value="builder">Kreator</TabsTrigger>
          <TabsTrigger value="saved">Zapisane raporty</TabsTrigger>
          <TabsTrigger value="sponsor">Sponsor ROI</TabsTrigger>
          <TabsTrigger value="benchmark">Benchmarki</TabsTrigger>
        </TabsList>

        <TabsContent value="builder">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Nazwa raportu</Label>
                    <Input value={reportName} onChange={e => setReportName(e.target.value)} />
                  </div>
                  <Button onClick={addWidget}><Plus className="h-4 w-4 mr-2" /> Dodaj widget</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {widgets.map(w => {
                const ChartIcon = chartTypes.find(c => c.value === w.type)?.icon || BarChart3;
                return (
                  <Card key={w.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <ChartIcon className="h-4 w-4 text-primary" /> {w.title}
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => removeWidget(w.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Select defaultValue={w.type}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {chartTypes.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Select defaultValue={w.metric}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {availableMetrics.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="h-24 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                        <ChartIcon className="h-8 w-8 opacity-30" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Widgety</TableHead>
                    <TableHead>Ostatnie uruchomienie</TableHead>
                    <TableHead>Harmonogram</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedReports.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.widgets}</TableCell>
                      <TableCell>{r.lastRun}</TableCell>
                      <TableCell><Badge variant="secondary">{r.schedule}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sponsor">
          <Card>
            <CardHeader>
              <CardTitle>Sponsor ROI Dashboard</CardTitle>
              <CardDescription>Metryki ekspozycji i zaangażowania dla sponsorów</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Wyświetlenia logo", value: "12,450" },
                  { label: "Kliknięcia linków", value: "834" },
                  { label: "Footfall (strefa VIP)", value: "267" },
                  { label: "Engagement Score", value: "87/100" },
                ].map(s => (
                  <Card key={s.label}>
                    <CardContent className="pt-6 text-center">
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                      <p className="text-3xl font-bold mt-1">{s.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmark">
          <Card>
            <CardHeader>
              <CardTitle>Benchmark Analytics</CardTitle>
              <CardDescription>Porównaj wyniki z branżowymi średnimi</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metryka</TableHead>
                    <TableHead>Twój wynik</TableHead>
                    <TableHead>Średnia branżowa</TableHead>
                    <TableHead>Różnica</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {benchmarks.map(b => (
                    <TableRow key={b.metric}>
                      <TableCell className="font-medium">{b.metric}</TableCell>
                      <TableCell className="font-bold">{b.yours}%</TableCell>
                      <TableCell>{b.industry}%</TableCell>
                      <TableCell>
                        <Badge variant={b.diff.startsWith("+") ? "default" : "secondary"}>{b.diff}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportBuilder;
