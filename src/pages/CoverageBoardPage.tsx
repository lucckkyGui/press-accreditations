/**
 * Coverage Board — kanban statusów coverage z filtrami i bulk reminder.
 * Kolumny: pending / submitted / verified / missing.
 */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, CheckCircle2, Ban, RotateCcw, Loader2, Plus, ExternalLink, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  fetchCoverageBoard, fetchCoverageItems, verifyCoverage, markCoverageMissing, reopenCoverage,
  generateCoverageRequestsForEvent, sendBulkCoverageReminders,
  type CoverageBoardRow, type CoverageItem,
} from "@/services/crm/coverageService";
import { COVERAGE_STATUS_META, COVERAGE_STATUSES, type CoverageStatus } from "@/lib/crm/mediaCrm";

interface EventOption { id: string; title: string; }

const TONE_CLS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground", info: "bg-blue-600 text-white",
  ok: "bg-green-600 text-white", bad: "bg-destructive text-white",
};

const CoverageBoardPage = () => {
  usePageTitle("Coverage Board");
  const qc = useQueryClient();
  const { user } = useAuth();
  const actor = { id: user?.id ?? "", email: user?.email ?? null };

  const [eventId, setEventId] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<CoverageStatus | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<CoverageBoardRow | null>(null);

  const { data: events = [] } = useQuery<EventOption[]>({
    queryKey: ["coverage_events"],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("id, title").order("start_date", { ascending: false });
      return (data ?? []).map((e) => ({ id: e.id, title: e.title }));
    },
  });

  const boardKey = ["coverage_board", eventId, statusFilter];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: boardKey,
    queryFn: () => fetchCoverageBoard({ eventId: eventId || undefined, status: statusFilter }),
  });

  const { data: items = [] } = useQuery<CoverageItem[]>({
    queryKey: ["coverage_items", detail?.id], enabled: !!detail,
    queryFn: () => fetchCoverageItems(detail!.id),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["coverage_board"] });

  const generateMutation = useMutation({
    mutationFn: () => generateCoverageRequestsForEvent(eventId, actor),
    onSuccess: (n) => { refresh(); toast.success(`Utworzono ${n} próśb o coverage`); },
    onError: (e) => toast.error("Błąd generowania", { description: String(e) }),
  });

  const verifyMutation = useMutation({
    mutationFn: (row: CoverageBoardRow) => verifyCoverage(row, actor),
    onSuccess: () => { refresh(); setDetail(null); toast.success("Coverage zweryfikowane"); },
    onError: (e) => toast.error("Błąd", { description: String(e) }),
  });
  const missingMutation = useMutation({
    mutationFn: (row: CoverageBoardRow) => markCoverageMissing(row, actor),
    onSuccess: () => { refresh(); toast.success("Oznaczono jako brak"); },
    onError: (e) => toast.error("Błąd", { description: String(e) }),
  });
  const reopenMutation = useMutation({
    mutationFn: (row: CoverageBoardRow) => reopenCoverage(row, actor),
    onSuccess: () => { refresh(); toast.success("Przywrócono do oczekujących"); },
    onError: (e) => toast.error("Błąd", { description: String(e) }),
  });

  const bulkReminderMutation = useMutation({
    mutationFn: () => sendBulkCoverageReminders([...selected]),
    onSuccess: (res) => {
      refresh(); setSelected(new Set());
      if (!res) { toast.error("Wysyłka nieudana"); return; }
      if (res.sent > 0 && res.failed === 0 && res.skipped === 0) {
        toast.success(`Wysłano ${res.sent} reminderów`);
      } else if (res.sent > 0) {
        toast.warning(`Wysłano ${res.sent}, nieudane: ${res.failed}, pominięte: ${res.skipped}`);
      } else {
        toast.warning(`Nic nie wysłano (nieudane: ${res.failed}, pominięte: ${res.skipped})`);
      }
    },
    onError: (e) => toast.error("Błąd remindera", { description: String(e) }),
  });

  const byStatus = useMemo(() => {
    const m: Record<CoverageStatus, CoverageBoardRow[]> = {
      coverage_pending: [], coverage_submitted: [], coverage_verified: [], coverage_missing: [],
    };
    for (const r of rows) m[r.status]?.push(r);
    return m;
  }, [rows]);

  const toggle = (id: string) => setSelected((p) => {
    const n = new Set(p);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coverage Board</h1>
          <p className="text-muted-foreground">Status dostarczonych publikacji i przypomnienia.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={eventId || "all"} onValueChange={(v) => setEventId(v === "all" ? "" : v)}>
            <SelectTrigger className="h-9 w-[200px]"><SelectValue placeholder="Wszystkie wydarzenia" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie wydarzenia</SelectItem>
              {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CoverageStatus | "all")}>
            <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              {COVERAGE_STATUSES.map((s) => <SelectItem key={s} value={s}>{COVERAGE_STATUS_META[s].label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={!eventId || generateMutation.isPending}
            onClick={() => generateMutation.mutate()}>
            {generateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generuj prośby
          </Button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
          <span className="text-sm font-medium px-1">{selected.size} zaznaczonych</span>
          <Button size="sm" className="gap-1.5" disabled={bulkReminderMutation.isPending} onClick={() => bulkReminderMutation.mutate()}>
            {bulkReminderMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Wyślij remindery
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected(new Set())}>Wyczyść</Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {COVERAGE_STATUSES.map((status) => {
            const meta = COVERAGE_STATUS_META[status];
            const list = byStatus[status];
            return (
              <Card key={status} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${TONE_CLS[meta.tone].split(" ")[0]}`} />
                      {meta.label}
                    </span>
                    <Badge variant="outline">{list.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 flex-1">
                  {list.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">—</p>
                  ) : list.map((row) => (
                    <div key={row.id} className="rounded-lg border border-border p-2.5 text-sm">
                      <div className="flex items-start gap-2">
                        {(status === "coverage_pending" || status === "coverage_missing") && (
                          <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggle(row.id)}
                            aria-label="Zaznacz do remindera" className="mt-0.5" />
                        )}
                        <button className="flex-1 text-left min-w-0" onClick={() => setDetail(row)}>
                          <div className="font-medium truncate">{row.first_name} {row.last_name}</div>
                          <div className="text-xs text-muted-foreground truncate">{row.media_name ?? row.email}</div>
                          {row.items_count > 0 && <div className="text-[10px] text-muted-foreground mt-0.5">{row.items_count} publikacji</div>}
                        </button>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {status === "coverage_submitted" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-green-600"
                            onClick={() => verifyMutation.mutate(row)} disabled={verifyMutation.isPending}>
                            <CheckCircle2 className="h-3 w-3" /> Verify
                          </Button>
                        )}
                        {status === "coverage_pending" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-destructive"
                            onClick={() => missingMutation.mutate(row)} disabled={missingMutation.isPending}>
                            <Ban className="h-3 w-3" /> Brak
                          </Button>
                        )}
                        {(status === "coverage_missing" || status === "coverage_verified") && (
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1"
                            onClick={() => reopenMutation.mutate(row)} disabled={reopenMutation.isPending}>
                            <RotateCcw className="h-3 w-3" /> Reopen
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detail.first_name} {detail.last_name}
                  <Badge className={TONE_CLS[COVERAGE_STATUS_META[detail.status].tone]}>{COVERAGE_STATUS_META[detail.status].label}</Badge>
                </DialogTitle>
                <DialogDescription>{detail.media_name ?? detail.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Brak dostarczonych publikacji.</p>
                ) : items.map((it) => (
                  <div key={it.id} className="rounded-lg border border-border p-3 text-sm space-y-1.5">
                    {([["Artykuł", it.article_url], ["Galeria", it.gallery_url], ["Wideo", it.video_url], ["Social", it.social_post_url]] as const)
                      .filter(([, url]) => url)
                      .map(([label, url]) => (
                        <a key={label} href={url!} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-primary underline underline-offset-2 break-all">
                          <ExternalLink className="h-3 w-3 shrink-0" /> {label}
                        </a>
                      ))}
                    <div className="text-xs text-muted-foreground pt-1">
                      {it.publication_date && `Data: ${it.publication_date} · `}
                      {it.estimated_reach != null && `Zasięg: ${it.estimated_reach.toLocaleString("pl-PL")} · `}
                      {it.sponsor_mentions != null && `Sponsor: ${it.sponsor_mentions}`}
                    </div>
                    {it.notes && <p className="text-xs">{it.notes}</p>}
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  {detail.status === "coverage_submitted" && (
                    <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700"
                      onClick={() => verifyMutation.mutate(detail)} disabled={verifyMutation.isPending}>
                      <CheckCircle2 className="h-4 w-4" /> Zweryfikuj
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-1.5" disabled={bulkReminderMutation.isPending}
                    onClick={() => sendBulkCoverageReminders([detail.id]).then((res) =>
                      res && res.sent > 0 ? toast.success("Reminder wysłany") : toast.warning("Reminder nie został wysłany"))}>
                    <Mail className="h-4 w-4" /> Reminder
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoverageBoardPage;
