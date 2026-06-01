/**
 * Media Coverage Report — dashboard + PDF + CSV.
 * Główna wartość sprzedażowa: które media realnie dowiozły wartość po evencie.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, Download, Loader2, TrendingUp, AlertTriangle, ExternalLink, Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateCoverageReport } from "@/services/report/coverageReportService";
import { buildPublicationsCsv } from "@/lib/report/coverageReport";
import { generateCoverageReportPdf } from "@/utils/coverageReportPdf";

interface EventOption { id: string; title: string; }

const REC_TONE: Record<string, string> = {
  invite_again: "bg-green-600 text-white",
  sponsor_relevant: "bg-emerald-600 text-white",
  follow_up: "bg-amber-500 text-white",
  deprioritize: "bg-muted text-muted-foreground",
};
const REC_LABEL: Record<string, string> = {
  invite_again: "Zaproś ponownie", sponsor_relevant: "Istotne dla sponsora",
  follow_up: "Follow-up", deprioritize: "Despriorytetyzuj",
};

const MediaCoverageReport = () => {
  usePageTitle("Media Coverage Report");
  const [eventId, setEventId] = useState("");
  const [downloading, setDownloading] = useState(false);

  const { data: events = [] } = useQuery<EventOption[]>({
    queryKey: ["report_events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("id, title").order("start_date", { ascending: false });
      return (data ?? []).map((e) => ({ id: e.id, title: e.title }));
    },
  });

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ["coverage_report", eventId],
    enabled: !!eventId,
    queryFn: () => generateCoverageReport(eventId),
  });

  const funnelData = useMemo(() => {
    if (!report) return [];
    const f = report.funnel;
    return [
      { stage: "Zgłoszenia", value: f.submissions, fill: "#6366f1" },
      { stage: "Zaakceptowane", value: f.approved, fill: "#8b5cf6" },
      { stage: "Check-in", value: f.checkedIn, fill: "#0ea5e9" },
      { stage: "Coverage", value: f.coverageSubmitted, fill: "#10b981" },
      { stage: "Brak", value: f.coverageMissing, fill: "#ef4444" },
    ];
  }, [report]);

  const downloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      await generateCoverageReportPdf(report);
      toast.success("Pobrano raport PDF");
    } catch (e) {
      toast.error("Błąd generowania PDF", { description: String(e) });
    } finally {
      setDownloading(false);
    }
  };

  const downloadCsv = () => {
    if (!report) return;
    const csv = buildPublicationsCsv(report);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coverage-${report.event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "event"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Pobrano CSV");
  };

  const m = report?.metrics;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Coverage Report</h1>
          <p className="text-muted-foreground">Które media dowiozły wartość po wydarzeniu — gotowe dla sponsora.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger className="h-9 w-[220px]"><SelectValue placeholder="Wybierz wydarzenie" /></SelectTrigger>
            <SelectContent>
              {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={!report} onClick={downloadCsv}>
            <Download className="h-4 w-4" /> CSV
          </Button>
          <Button size="sm" className="gap-1.5" disabled={!report || downloading} onClick={downloadPdf}>
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} PDF
          </Button>
        </div>
      </div>

      {!eventId && (
        <Card><CardContent className="py-16 text-center text-muted-foreground">
          Wybierz wydarzenie, aby wygenerować raport.
        </CardContent></Card>
      )}

      {eventId && isLoading && (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      )}

      {eventId && isError && (
        <Card><CardContent className="py-16 text-center text-destructive">Błąd generowania raportu.</CardContent></Card>
      )}

      {report && m && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Approval rate", value: `${m.approvalRate}%`, sub: `${report.funnel.approved}/${report.funnel.submissions}` },
              { label: "Check-in rate", value: `${m.checkInRate}%`, sub: `no-show ${m.noShowRate}%` },
              { label: "Coverage rate", value: `${m.coverageRate}%`, sub: `${report.funnel.coverageSubmitted} publikacji` },
              { label: "Wzmianki sponsora", value: m.sponsorMentions.toLocaleString("pl-PL"), sub: "w publikacjach" },
            ].map((k) => (
              <Card key={k.label}>
                <CardContent className="pt-5">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
                  <div className="text-3xl font-bold tabular-nums mt-1">{k.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{k.sub}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estimated reach banner */}
          <Card>
            <CardContent className="py-4 flex items-center gap-3 flex-wrap">
              <TrendingUp className="h-8 w-8 text-primary shrink-0" />
              <div>
                <div className="text-2xl font-bold tabular-nums">{m.estimatedReach.toLocaleString("pl-PL")}</div>
                <div className="text-sm text-muted-foreground">Łączny zasięg</div>
              </div>
              <Badge variant="outline" className={m.reachVerified ? "border-green-600 text-green-700" : "border-amber-500 text-amber-600"}>
                {m.reachVerified ? "Zweryfikowany" : "Deklarowany / estymowany"}
              </Badge>
            </CardContent>
          </Card>

          {/* Funnel chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">Lejek akredytacji</CardTitle>
              <CardDescription>Od zgłoszenia do dostarczonej publikacji.</CardDescription></CardHeader>
            <CardContent>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={funnelData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="stage" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {funnelData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Missing coverage — warning block */}
          {report.missingCoverage.length > 0 && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" /> Brak coverage ({report.missingCoverage.length})
                </CardTitle>
                <CardDescription>Media z check-inem / oczekujące, które nie dostarczyły publikacji.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Medium / osoba</TableHead><TableHead>E-mail</TableHead><TableHead>Status</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {report.missingCoverage.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{row.email}</TableCell>
                        <TableCell><Badge variant="outline">{row.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-4">
            {/* Top outlets */}
            <Card>
              <CardHeader><CardTitle className="text-base">Top media (outlets)</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Medium</TableHead><TableHead className="text-right">Publ.</TableHead>
                    <TableHead className="text-right">Zasięg</TableHead><TableHead className="text-right">Sponsor</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {report.topOutlets.length > 0 ? report.topOutlets.map((o, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{o.outlet}</TableCell>
                        <TableCell className="text-right tabular-nums">{o.publications}</TableCell>
                        <TableCell className="text-right tabular-nums">{o.reach.toLocaleString("pl-PL")}</TableCell>
                        <TableCell className="text-right tabular-nums">{o.sponsorMentions}</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">Brak danych.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top publications — klikalne */}
            <Card>
              <CardHeader><CardTitle className="text-base">Top publikacje</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Medium</TableHead><TableHead>Typ</TableHead>
                    <TableHead className="text-right">Zasięg</TableHead><TableHead></TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {report.topPublications.length > 0 ? report.topPublications.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.outlet}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.type ?? "—"}</TableCell>
                        <TableCell className="text-right tabular-nums">{p.reach != null ? p.reach.toLocaleString("pl-PL") : "—"}</TableCell>
                        <TableCell className="text-right">
                          {p.url && (
                            <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex text-primary hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">Brak publikacji.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Rekomendacje</CardTitle></CardHeader>
            <CardContent>
              {report.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {report.recommendations.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                      <Badge className={REC_TONE[r.kind] ?? "bg-muted"}>{REC_LABEL[r.kind] ?? r.kind}</Badge>
                      <span className="font-medium text-sm">{r.outlet}</span>
                      <span className="text-xs text-muted-foreground ml-auto text-right">{r.reason}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Brak rekomendacji — za mało danych.</p>}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MediaCoverageReport;
