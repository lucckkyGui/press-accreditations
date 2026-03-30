import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import {
  Database, Mail, HardDrive, Zap, Users, FileText,
  Calendar, Shield, BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResourceStat {
  label: string;
  value: number;
  limit: number | null;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const ResourceMonitor = () => {
  const { user } = useAuth();

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

  const emailDeliveryRate = stats?.emailTotal
    ? Math.round((stats.emailSent / stats.emailTotal) * 100)
    : 0;

  const emailFailRate = stats?.emailTotal
    ? Math.round((stats.emailFailed / stats.emailTotal) * 100)
    : 0;

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
              return (
                <div key={r.label} className="p-4 rounded-xl border border-border bg-card hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg bg-primary/10 ${r.color}`}>
                      {r.icon}
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
                      className="h-2 rounded-full"
                    />
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
          {(() => {
            const totalRecords =
              (stats?.guests || 0) +
              (stats?.accreditations || 0) +
              (stats?.invitations || 0) +
              (stats?.scans || 0) +
              (stats?.emailTotal || 0) +
              (stats?.wristbands || 0);
            // ~1KB per record average
            const estimatedMB = Math.round((totalRecords * 1) / 1024);
            const limitGB = 8; // Supabase Pro limit
            const pct = Math.min((estimatedMB / (limitGB * 1024)) * 100, 100);

            return (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-foreground tabular-nums">{estimatedMB < 1024 ? `${estimatedMB} MB` : `${(estimatedMB / 1024).toFixed(1)} GB`}</p>
                    <p className="text-sm text-muted-foreground">z {limitGB} GB (Supabase Pro)</p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground tabular-nums">{pct.toFixed(1)}%</span>
                </div>
                <Progress value={pct} className="h-3 rounded-full" />
                <p className="text-xs text-muted-foreground">
                  Łącznie ~{totalRecords.toLocaleString("pl-PL")} rekordów we wszystkich tabelach
                </p>
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceMonitor;
