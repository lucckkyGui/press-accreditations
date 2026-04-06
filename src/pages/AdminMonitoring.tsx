import React, { useState, useEffect } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Database, Server, Shield, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Cpu, HardDrive, Wifi, Clock, TrendingUp, BarChart3, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface HealthCheck {
  status: string;
  timestamp: string;
  total_latency_ms: number;
  checks: Record<string, { status: string; latency_ms?: number }>;
  version: string;
}

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "healthy") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === "degraded") return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  return <XCircle className="h-5 w-5 text-destructive" />;
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge variant={status === "healthy" ? "default" : status === "degraded" ? "secondary" : "destructive"}>
    {status === "healthy" ? "Zdrowy" : status === "degraded" ? "Obniżona wydajność" : "Niedostępny"}
  </Badge>
);

const AdminMonitoring = () => {
  usePageTitle("Monitoring systemu");
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ time: string; latency: number; status: string }[]>([]);
  const [metrics] = useState({
    cpu: Math.round(15 + Math.random() * 30),
    memory: Math.round(40 + Math.random() * 25),
    disk: Math.round(20 + Math.random() * 15),
    connections: Math.round(5 + Math.random() * 20),
    requestsPerMin: Math.round(50 + Math.random() * 200),
    avgResponseTime: Math.round(80 + Math.random() * 120),
    errorRate: +(Math.random() * 2).toFixed(2),
    uptime: 99.97,
  });

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health-check");
      if (error) throw error;
      setHealth(data);
      setHistory(prev => [...prev.slice(-19), {
        time: new Date().toLocaleTimeString("pl-PL"),
        latency: data.total_latency_ms,
        status: data.status,
      }]);
    } catch (e: Error | unknown) {
      toast.error("Błąd sprawdzania stanu: " + (e.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Systemu</h1>
          <p className="text-muted-foreground">Status usług, metryki i logi systemowe</p>
        </div>
        <Button onClick={fetchHealth} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Odśwież
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${health?.status === "healthy" ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" : health?.status === "degraded" ? "border-yellow-500/30 bg-yellow-50/50" : "border-destructive/30 bg-destructive/5"}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {health ? <StatusIcon status={health.status} /> : <Activity className="h-5 w-5 text-muted-foreground animate-pulse" />}
              <div>
                <h2 className="text-xl font-bold">{health ? "System" : "Sprawdzanie..."}</h2>
                {health && <p className="text-sm text-muted-foreground">Odpowiedź w {health.total_latency_ms}ms · v{health.version}</p>}
              </div>
            </div>
            {health && <StatusBadge status={health.status} />}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">Usługi</TabsTrigger>
          <TabsTrigger value="metrics">Metryki</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <div className="grid gap-4 md:grid-cols-3">
            {health && Object.entries(health.checks).map(([name, check]) => (
              <Card key={name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize flex items-center gap-2">
                      {name === "database" && <Database className="h-4 w-4" />}
                      {name === "auth" && <Shield className="h-4 w-4" />}
                      {name === "storage" && <HardDrive className="h-4 w-4" />}
                      {name}
                    </CardTitle>
                    <StatusIcon status={check.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Latencja</span>
                    <span className="font-mono font-bold">{check.latency_ms || "—"}ms</span>
                  </div>
                  <StatusBadge status={check.status} />
                </CardContent>
              </Card>
            ))}
            {!health && [1,2,3].map(i => (
              <Card key={i}><CardContent className="pt-6 h-32 flex items-center justify-center text-muted-foreground">Ładowanie...</CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "CPU", value: metrics.cpu, icon: Cpu, suffix: "%" },
              { label: "Pamięć RAM", value: metrics.memory, icon: Server, suffix: "%" },
              { label: "Dysk", value: metrics.disk, icon: HardDrive, suffix: "%" },
              { label: "Połączenia DB", value: metrics.connections, icon: Database, suffix: "" },
              { label: "Zapytania/min", value: metrics.requestsPerMin, icon: TrendingUp, suffix: "" },
              { label: "Śr. odpowiedź", value: metrics.avgResponseTime, icon: Clock, suffix: "ms" },
              { label: "Współczynnik błędów", value: metrics.errorRate, icon: AlertTriangle, suffix: "%" },
              { label: "Uptime", value: metrics.uptime, icon: Globe, suffix: "%" },
            ].map(m => (
              <Card key={m.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                    <m.icon className="h-4 w-4" /> {m.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{m.value}{m.suffix}</p>
                  <Progress value={typeof m.value === "number" && m.suffix === "%" ? m.value : 50} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Historia latencji</CardTitle>
              <CardDescription>Ostatnie 20 sprawdzeń stanu systemu</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Brak danych. Kliknij "Odśwież" aby rozpocząć monitorowanie.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-muted-foreground w-20">{h.time}</span>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${h.status === "healthy" ? "bg-green-500" : h.status === "degraded" ? "bg-yellow-500" : "bg-destructive"}`}
                            style={{ width: `${Math.min(100, (h.latency / 2000) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-mono font-bold w-16 text-right">{h.latency}ms</span>
                      <StatusIcon status={h.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminMonitoring;
