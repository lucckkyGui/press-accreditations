import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import {
  Database, Mail, HardDrive, Zap, Users, FileText,
  Calendar, Shield, BarChart3, AlertTriangle, Bell, Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ResourceStat {
  label: string;
  value: number;
  limit: number | null;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const THRESHOLD = 80;

const ResourceMonitor = () => {
  const { user } = useAuth();
  const [checkingAlerts, setCheckingAlerts] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["resourceMonitor", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [
        { count: eventsCount },
        { count: guestsCount },
        { count: accreditationsCount },
        { count: accreditationRequestsCount },
        { count: invitationsCount },
        { count: emailQueueTotal },
        { count: emailQueueFailed },
        { count: emailQueueSent },
        { count: scansCount },
        { count: wristbandsCount },
        { count: mediaRegsCount },
        { count: documentsCount },
      ] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }).eq("organizer_id", user.id),
        supabase.from("guests").select("*", { count: "exact", head: true }),
        supabase.from("accreditations").select("*", { count: "exact", head: true }),
        supabase.from("accreditation_requests").select("*", { count: "exact", head: true }),
        supabase.from("invitations").select("*", { count: "exact", head: true }),
        supabase.from("email_queue").select("*", { count: "exact", head: true }),
        supabase.from("email_queue").select("*", { count: "exact", head: true }).eq("status", "failed"),
        supabase.from("email_queue").select("*", { count: "exact", head: true }).eq("status", "sent"),
        supabase.from("access_logs").select("*", { count: "exact", head: true }),
        supabase.from("wristbands").select("*", { count: "exact", head: true }),
        supabase.from("media_registrations").select("*", { count: "exact", head: true }),
        supabase.from("document_submissions").select("*", { count: "exact", head: true }),
      ]);

      return {
        events: eventsCount || 0,
        guests: guestsCount || 0,
        accreditations: accreditationsCount || 0,
        accreditationRequests: accreditationRequestsCount || 0,
        invitations: invitationsCount || 0,
        emailTotal: emailQueueTotal || 0,
        emailFailed: emailQueueFailed || 0,
        emailSent: emailQueueSent || 0,
        scans: scansCount || 0,
        wristbands: wristbandsCount || 0,
        mediaRegistrations: mediaRegsCount || 0,
        documents: documentsCount || 0,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const resources: ResourceStat[] = [
    { label: "Wydarzenia", value: stats?.events || 0, limit: null, unit: "", icon: <Calendar className="h-4 w-4" />, color: "text-primary" },
    { label: "Goście / Akredytacje", value: stats?.guests || 0, limit: 300000, unit: "", icon: <Users className="h-4 w-4" />, color: "text-info" },
    { label: "Akredytacje wydane", value: stats?.accreditations || 0, limit: null, unit: "", icon: <Shield className="h-4 w-4" />, color: "text-success" },
    { label: "Wnioski akredytacyjne", value: stats?.accreditationRequests || 0, limit: null, unit: "", icon: <FileText className="h-4 w-4" />, color: "text-warning" },
    { label: "Zaproszenia wygenerowane", value: stats?.invitations || 0, limit: null, unit: "", icon: <Mail className="h-4 w-4" />, color: "text-primary" },
    { label: "Skany / Logi dostępu", value: stats?.scans || 0, limit: null, unit: "", icon: <Zap className="h-4 w-4" />, color: "text-accent-foreground" },
    { label: "Opaski RFID", value: stats?.wristbands || 0, limit: null, unit: "", icon: <HardDrive className="h-4 w-4" />, color: "text-info" },
    { label: "Rejestracje mediów", value: stats?.mediaRegistrations || 0, limit: null, unit: "", icon: <BarChart3 className="h-4 w-4" />, color: "text-success" },
    { label: "Dokumenty", value: stats?.documents || 0, limit: null, unit: "", icon: <Database className="h-4 w-4" />, color: "text-muted-foreground" },
  ];

  // Calculate storage
  const totalRecords =
    (stats?.guests || 0) +
    (stats?.accreditations || 0) +
    (stats?.invitations || 0) +
    (stats?.scans || 0) +
    (stats?.emailTotal || 0) +
    (stats?.wristbands || 0);
  const estimatedMB = Math.round(totalRecords / 1024);
  const storageLimitGB = 8;
  const storageLimitMB = storageLimitGB * 1024;
  const storagePct = Math.min((estimatedMB / storageLimitMB) * 100, 100);

  // Gather threshold alerts
  const thresholdAlerts: { resource: string; percent: number; current: number; limit: number }[] = [];
  resources.forEach((r) => {
    if (r.limit) {
      const pct = (r.value / r.limit) * 100;
      if (pct >= THRESHOLD) {
        thresholdAlerts.push({ resource: r.label, percent: Math.round(pct), current: r.value, limit: r.limit });
      }
    }
  });
  if (storagePct >= THRESHOLD) {
    thresholdAlerts.push({ resource: "Storage", percent: Math.round(storagePct), current: estimatedMB, limit: storageLimitMB });
  }

  const emailDeliveryRate = stats?.emailTotal
    ? Math.round((stats.emailSent / stats.emailTotal) * 100)
    : 0;

  const emailFailRate = stats?.emailTotal
    ? Math.round((stats.emailFailed / stats.emailTotal) * 100)
    : 0;

  const handleSendAlertEmail = async () => {
    setCheckingAlerts(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-resource-alerts");
      if (error) throw error;
      const result = data as { alerts?: unknown[]; message?: string };
      if (result?.alerts && result.alerts.length > 0) {
        toast({
          title: "Alerty wysłane",
          description: `Wysłano ${result.alerts.length} alert(ów) email do administratorów.`,
        });
      } else {
        toast({
          title: "Brak alertów",
          description: "Wszystkie zasoby mieszczą się w limitach.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Błąd",
        description: err.message || "Nie udało się sprawdzić zasobów",
        variant: "destructive",
      });
    } finally {
      setCheckingAlerts(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Threshold alerts banner */}
      {thresholdAlerts.length > 0 && (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/5">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-base font-semibold">
            ⚠️ Przekroczono {THRESHOLD}% limitu zasobów
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-1">
            {thresholdAlerts.map((a) => (
              <div key={a.resource} className="flex items-center justify-between text-sm">
                <span className="font-medium">{a.resource}</span>
                <span className="tabular-nums">
                  {a.current.toLocaleString("pl-PL")} / {a.limit.toLocaleString("pl-PL")}{" "}
                  <span className={`font-bold ${a.percent >= 95 ? "text-destructive" : "text-warning"}`}>
                    ({a.percent}%)
                  </span>
                </span>
              </div>
            ))}
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 rounded-lg border-destructive/30 text-destructive hover:bg-destructive/10"
                onClick={handleSendAlertEmail}
                disabled={checkingAlerts}
              >
                {checkingAlerts ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
                Wyślij alerty email do adminów
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Send alert button (always visible) */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          className="gap-2 rounded-xl"
          onClick={handleSendAlertEmail}
          disabled={checkingAlerts}
        >
          {checkingAlerts ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          Sprawdź i wyślij alerty
        </Button>
      </div>

      {/* Database usage */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Użycie bazy danych
          </CardTitle>
          <CardDescription>Liczba rekordów w poszczególnych tabelach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => {
              const pct = r.limit ? Math.min((r.value / r.limit) * 100, 100) : null;
              const isOverThreshold = pct !== null && pct >= THRESHOLD;
              return (
                <div
                  key={r.label}
                  className={`p-4 rounded-xl border transition-colors ${
                    isOverThreshold
                      ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
                      : "border-border bg-card hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${isOverThreshold ? "bg-destructive/15 text-destructive" : `bg-primary/10 ${r.color}`}`}>
                      {isOverThreshold ? <AlertTriangle className="h-4 w-4" /> : r.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground truncate">{r.label}</p>
                      <p className="text-xl font-bold text-foreground tabular-nums">
                        {r.value.toLocaleString("pl-PL")}
                        {r.limit && (
                          <span className="text-sm font-normal text-muted-foreground">
                            {" "}/ {r.limit.toLocaleString("pl-PL")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {pct !== null && (
                    <Progress
                      value={pct}
                      className={`h-2 rounded-full ${isOverThreshold ? "[&>div]:bg-destructive" : ""}`}
                    />
                  )}
                  {isOverThreshold && (
                    <p className="text-xs text-destructive font-medium mt-1.5">
                      ⚠️ {Math.round(pct!)}% limitu – wymagana uwaga
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Email stats */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Statystyki e-mail
          </CardTitle>
          <CardDescription>Dostarczalność i kolejka wiadomości</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 rounded-xl border border-border text-center">
              <p className="text-sm text-muted-foreground mb-1">Łącznie w kolejce</p>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {(stats?.emailTotal || 0).toLocaleString("pl-PL")}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-success/30 bg-success/5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Wysłane</p>
              <p className="text-3xl font-bold text-success tabular-nums">
                {(stats?.emailSent || 0).toLocaleString("pl-PL")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{emailDeliveryRate}% dostarczalność</p>
            </div>
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-center">
              <p className="text-sm text-muted-foreground mb-1">Nieudane</p>
              <p className="text-3xl font-bold text-destructive tabular-nums">
                {(stats?.emailFailed || 0).toLocaleString("pl-PL")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{emailFailRate}% błędów</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage estimate */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            Szacowane użycie storage
          </CardTitle>
          <CardDescription>Przybliżone zużycie na podstawie ilości rekordów</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {estimatedMB < 1024 ? `${estimatedMB} MB` : `${(estimatedMB / 1024).toFixed(1)} GB`}
                </p>
                <p className="text-sm text-muted-foreground">z {storageLimitGB} GB (Supabase Pro)</p>
              </div>
              <div className="flex items-center gap-2">
                {storagePct >= THRESHOLD && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-sm font-medium tabular-nums ${storagePct >= THRESHOLD ? "text-destructive" : "text-muted-foreground"}`}>
                  {storagePct.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress
              value={storagePct}
              className={`h-3 rounded-full ${storagePct >= THRESHOLD ? "[&>div]:bg-destructive" : ""}`}
            />
            {storagePct >= THRESHOLD && (
              <p className="text-xs text-destructive font-medium">
                ⚠️ Storage przekracza {THRESHOLD}% limitu – rozważ optymalizację lub upgrade planu
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Łącznie ~{totalRecords.toLocaleString("pl-PL")} rekordów we wszystkich tabelach
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceMonitor;
