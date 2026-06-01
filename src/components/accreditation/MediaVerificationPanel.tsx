import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle, BadgeCheck, Ban, Check, Clock, Copy, Download, Eye, Globe, Loader2,
  Mail, QrCode, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck, X, History,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/useAuth";
import { MEDIA_ROLES } from "@/lib/accreditation/types";
import { splitLinks } from "@/lib/accreditation/submissionValidation";
import type {
  VerificationFlag, VerificationRiskLevel, VerificationBand,
} from "@/lib/accreditation/verificationScoring";
import {
  ACCESS_LEVELS, APPROVAL_STATUSES, accessLevelLabel, suggestedAccessLevel,
  statusCreatesPass, isAccessLevel,
  type ApprovalStatus, type AccessLevel,
} from "@/lib/accreditation/decisionFlow";
import {
  fetchSubmissions, fetchVerificationEvents, recalculateSubmission,
  overrideVerification, addVerificationNote, decideSubmission, revokeAccreditation,
  resendDecisionEmail,
  type MediaSubmission, type VerificationEvent, type DecisionResult, type DecisionEmailStatus,
} from "@/services/verification/verificationService";
import { qrToDataURL } from "@/utils/qrDataUrl";

interface Props {
  eventId: string;
}

const ROLE_LABEL: Record<string, string> = Object.fromEntries(
  MEDIA_ROLES.map((r) => [r.value, r.label]),
);

const BAND_META: Record<VerificationBand, { label: string; cls: string }> = {
  strong: { label: "Silne", cls: "bg-green-600 hover:bg-green-600 text-white" },
  acceptable: { label: "Akceptowalne", cls: "bg-blue-600 hover:bg-blue-600 text-white" },
  needs_review: { label: "Do weryfikacji", cls: "bg-amber-500 hover:bg-amber-500 text-white" },
  weak: { label: "Słabe", cls: "bg-destructive hover:bg-destructive text-white" },
};

const RISK_META: Record<VerificationRiskLevel, { label: string; cls: string }> = {
  low: { label: "Niskie", cls: "border-green-600 text-green-700 dark:text-green-400" },
  medium: { label: "Średnie", cls: "border-amber-500 text-amber-600 dark:text-amber-400" },
  high: { label: "Wysokie", cls: "border-destructive text-destructive" },
};

/** Etykiety statusów (decyzje + pending/expired). */
const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ...Object.fromEntries(APPROVAL_STATUSES.map((s) => [s.value, { label: s.label, cls: s.cls }])),
  pending: { label: "Oczekuje", cls: "bg-muted text-muted-foreground" },
  expired: { label: "Wygasłe", cls: "bg-muted text-muted-foreground" },
};

function ScoreBadge({ score, band }: { score: number | null; band: VerificationBand | null }) {
  if (score == null) return <span className="text-muted-foreground text-sm">—</span>;
  const meta = band ? BAND_META[band] : BAND_META.needs_review;
  return <Badge className={meta.cls}>{score}/100</Badge>;
}

function RiskBadge({ risk }: { risk: VerificationRiskLevel | null }) {
  if (!risk) return <span className="text-muted-foreground text-sm">—</span>;
  const meta = RISK_META[risk];
  return <Badge variant="outline" className={meta.cls}>{meta.label}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_BADGE[status];
  if (!meta) return <Badge variant="outline">{status}</Badge>;
  return <Badge className={meta.cls}>{meta.label}</Badge>;
}

const FLAG_ICON: Record<string, React.ReactNode> = {
  high: <ShieldAlert className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
  medium: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />,
  low: <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />,
};

const EVENT_TYPE_LABEL: Record<VerificationEvent["event_type"], string> = {
  scored: "Scoring automatyczny",
  rescored: "Przeliczenie",
  override: "Ręczne nadpisanie",
  note: "Notatka",
  decision: "Decyzja",
  pass_issued: "Wydanie QR pass",
  pass_revoked: "Cofnięcie akredytacji",
  email_sent: "E-mail z decyzją",
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pl-PL", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export const MediaVerificationPanel: React.FC<Props> = ({ eventId }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const actor = { id: user?.id ?? "", email: user?.email ?? null };

  const [selected, setSelected] = useState<MediaSubmission | null>(null);
  const [open, setOpen] = useState(false);

  // Korekta scoringu
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideRisk, setOverrideRisk] = useState<VerificationRiskLevel>("medium");
  const [noteText, setNoteText] = useState("");

  // Decision Panel (modal w szczegółach)
  const [decisionStatus, setDecisionStatus] = useState<ApprovalStatus>("approved");
  const [decisionAccess, setDecisionAccess] = useState<AccessLevel>("press");
  const [internalNote, setInternalNote] = useState("");
  const [applicantMessage, setApplicantMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [lastDecision, setLastDecision] = useState<DecisionResult | null>(null);

  // Rewokacja
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  // Bulk
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<ApprovalStatus>("approved");
  const [bulkAccess, setBulkAccess] = useState<AccessLevel>("press");
  const [bulkSendEmail, setBulkSendEmail] = useState(true);

  const submissionsKey = ["media_submissions", eventId];

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: submissionsKey,
    enabled: !!eventId,
    queryFn: () => fetchSubmissions(eventId),
  });

  const { data: events = [] } = useQuery({
    queryKey: ["verification_events", selected?.id],
    enabled: !!selected?.id,
    queryFn: () => fetchVerificationEvents(selected!.id),
  });

  useEffect(() => {
    if (selected) {
      setOverrideScore(selected.verification_score?.toString() ?? "");
      setOverrideRisk(selected.verification_risk_level ?? "medium");
      setNoteText(selected.verification_notes ?? "");
      setDecisionStatus(selected.status === "pending" || selected.status === "expired" ? "approved" : (selected.status as ApprovalStatus));
      setDecisionAccess(isAccessLevel(selected.access_level) ? selected.access_level : suggestedAccessLevel(selected.role));
      setInternalNote(selected.verification_notes ?? "");
      setApplicantMessage(selected.applicant_message ?? "");
      setSendEmail(true);
      setLastDecision(null);
      setRevokeReason("");
    }
  }, [selected]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: submissionsKey });
    qc.invalidateQueries({ queryKey: ["verification_events", selected?.id] });
    qc.invalidateQueries({ queryKey: ["sidebarCounts"] });
  };

  const recalcMutation = useMutation({
    mutationFn: () => recalculateSubmission(selected!, actor),
    onSuccess: () => { refresh(); toast.success("Scoring przeliczony"); },
    onError: (e) => toast.error("Błąd przeliczenia", { description: String(e) }),
  });

  const overrideMutation = useMutation({
    mutationFn: () => {
      const score = Number(overrideScore);
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        throw new Error("Wynik musi być liczbą 0–100");
      }
      return overrideVerification(selected!, { score, riskLevel: overrideRisk, notes: noteText || undefined }, actor);
    },
    onSuccess: () => { refresh(); toast.success("Wynik nadpisany ręcznie"); },
    onError: (e) => toast.error("Błąd nadpisania", { description: String(e) }),
  });

  const noteMutation = useMutation({
    mutationFn: () => addVerificationNote(selected!, noteText, actor),
    onSuccess: () => { refresh(); toast.success("Notatka zapisana"); },
    onError: (e) => toast.error("Błąd zapisu notatki", { description: String(e) }),
  });

  const decisionMutation = useMutation({
    mutationFn: () =>
      decideSubmission(selected!, {
        status: decisionStatus,
        accessLevel: statusCreatesPass(decisionStatus) ? decisionAccess : null,
        internalNote: internalNote || undefined,
        applicantMessage: applicantMessage || undefined,
        sendEmail,
      }, actor),
    onSuccess: (res) => {
      refresh();
      setLastDecision(res);
      setSelected((prev) => prev ? {
        ...prev,
        status: res.status,
        access_level: statusCreatesPass(res.status) ? decisionAccess : null,
        pass_qr_code: res.qrCode ?? prev.pass_qr_code,
        guest_id: res.guestId ?? prev.guest_id,
        accreditation_id: res.accreditationId ?? prev.accreditation_id,
      } : prev);
      const meta = STATUS_BADGE[res.status];
      if (sendEmail && res.emailStatus === "failed") {
        toast.warning(`Decyzja zapisana (${meta?.label}), ale e-mail NIE został wysłany`, {
          description: "Użyj „Wyślij ponownie”, aby spróbować jeszcze raz.",
        });
      } else {
        toast.success(`Decyzja zapisana: ${meta?.label}${res.createdPass ? " · QR pass wydany" : ""}`);
      }
    },
    onError: (e) => toast.error("Błąd decyzji", { description: String(e) }),
  });

  const resendMutation = useMutation({
    mutationFn: () => resendDecisionEmail(selected!, actor),
    onSuccess: (status: DecisionEmailStatus) => {
      refresh();
      if (status === "sent") toast.success("E-mail z decyzją wysłany ponownie");
      else toast.warning("Ponowna wysyłka nieudana", { description: "Spróbuj ponownie za chwilę." });
    },
    onError: (e) => toast.error("Błąd wysyłki", { description: String(e) }),
  });

  const revokeMutation = useMutation({
    mutationFn: () => revokeAccreditation(selected!, revokeReason.trim(), actor),
    onSuccess: () => {
      refresh();
      setRevokeOpen(false);
      setSelected((prev) => prev ? { ...prev } : prev);
      toast.success("Akredytacja cofnięta — QR nie przejdzie check-inu");
    },
    onError: (e) => toast.error("Błąd cofnięcia", { description: String(e) }),
  });

  const bulkMutation = useMutation({
    mutationFn: async () => {
      const targets = submissions.filter((s) => selectedIds.has(s.id) && s.status === "pending");
      let ok = 0; let failed = 0;
      for (const s of targets) {
        try {
          await decideSubmission(s, {
            status: bulkStatus,
            accessLevel: statusCreatesPass(bulkStatus) ? bulkAccess : null,
            sendEmail: bulkSendEmail,
          }, actor);
          ok++;
        } catch (err) {
          console.error("bulk decision failed for", s.id, err);
          failed++;
        }
      }
      return { ok, failed, total: targets.length };
    },
    onSuccess: ({ ok, failed }) => {
      refresh();
      setBulkOpen(false);
      setSelectedIds(new Set());
      toast.success(`Masowa decyzja: ${ok} OK${failed ? `, ${failed} błędów` : ""}`);
    },
    onError: (e) => toast.error("Błąd masowej decyzji", { description: String(e) }),
  });

  const openDetail = (s: MediaSubmission) => { setSelected(s); setOpen(true); };

  const activePassCode = selected?.pass_qr_code || lastDecision?.qrCode || null;
  const passQrDataUrl = useMemo(
    () => (activePassCode ? qrToDataURL(activePassCode, 220) : ""),
    [activePassCode],
  );

  const copyPassCode = (code: string) => {
    navigator.clipboard?.writeText(code)
      .then(() => toast.success("Kod skopiowany"))
      .catch(() => toast.error("Nie udało się skopiować"));
  };

  const downloadPassPdf = () => {
    if (!selected || !activePassCode) return;
    try {
      const doc = new jsPDF({ unit: "mm", format: "a6" });
      doc.setFontSize(15);
      doc.text("QR PASS — Akredytacja prasowa", 10, 15);
      doc.setFontSize(11);
      const lines = [
        `${selected.first_name} ${selected.last_name}`.trim(),
        selected.media_organization ? `Medium: ${selected.media_organization}` : "",
        selected.access_level ? `Dostęp: ${accessLevelLabel(selected.access_level)}` : "",
        selected.email,
      ].filter(Boolean) as string[];
      let y = 26;
      for (const line of lines) { doc.text(line, 10, y); y += 6; }
      if (passQrDataUrl) doc.addImage(passQrDataUrl, "PNG", 10, y + 2, 45, 45);
      doc.setFontSize(8);
      doc.text(activePassCode, 10, y + 53, { maxWidth: 90 });
      doc.save(`pass-${(selected.last_name || "akredytacja").toLowerCase()}.pdf`);
      toast.success("Pobrano pass PDF");
    } catch (e) {
      toast.error("Nie udało się wygenerować PDF", { description: String(e) });
    }
  };

  // ── Bulk selection helpers ──────────────────────────────────
  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const allPendingSelected = pendingSubmissions.length > 0 && pendingSubmissions.every((s) => selectedIds.has(s.id));
  const toggleAll = () => {
    setSelectedIds(allPendingSelected ? new Set() : new Set(pendingSubmissions.map((s) => s.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const openBulk = (status: ApprovalStatus) => { setBulkStatus(status); setBulkSendEmail(true); setBulkOpen(true); };

  const pendingCount = pendingSubmissions.length;
  const highRiskCount = submissions.filter((s) => s.verification_risk_level === "high").length;
  const selectedCount = selectedIds.size;

  const emailFailed = selected?.decision_email_status === "failed";
  const decisionMade = selected && selected.status !== "pending" && selected.status !== "expired";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Weryfikacja i decyzje
          </CardTitle>
          <CardDescription>
            Scoring sugeruje i flaguje ryzyko — decyzję podejmujesz Ty. Zatwierdzenie
            wydaje akredytację + QR pass i (opcjonalnie) wysyła e-mail.
            {submissions.length > 0 && (
              <span className="ml-1">
                {" "}Oczekujące: <strong>{pendingCount}</strong>
                {highRiskCount > 0 && <> · Wysokie ryzyko: <strong className="text-destructive">{highRiskCount}</strong></>}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bulk actions bar */}
          {selectedCount > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/40 p-2">
              <span className="text-sm font-medium px-1">{selectedCount} zaznaczonych</span>
              <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => openBulk("approved")}>
                <Check className="h-3.5 w-3.5" /> Zatwierdź
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openBulk("waitlisted")}>
                <Clock className="h-3.5 w-3.5" /> Lista rezerwowa
              </Button>
              <Button size="sm" variant="destructive" className="gap-1.5" onClick={() => openBulk("rejected")}>
                <X className="h-3.5 w-3.5" /> Odrzuć
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelectedIds(new Set())}>
                Wyczyść
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8">
                    <Checkbox
                      checked={allPendingSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Zaznacz wszystkie oczekujące"
                      disabled={pendingSubmissions.length === 0}
                    />
                  </TableHead>
                  <TableHead>Zgłaszający</TableHead>
                  <TableHead>Medium</TableHead>
                  <TableHead>Wynik</TableHead>
                  <TableHead>Ryzyko</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length > 0 ? (
                  submissions.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer" onClick={() => openDetail(s)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(s.id)}
                          onCheckedChange={() => toggleOne(s.id)}
                          aria-label={`Zaznacz ${s.first_name} ${s.last_name}`}
                          disabled={s.status !== "pending"}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {s.first_name} {s.last_name}
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </TableCell>
                      <TableCell className="text-sm">{s.media_organization || "—"}</TableCell>
                      <TableCell><ScoreBadge score={s.verification_score} band={s.verification_status} /></TableCell>
                      <TableCell><RiskBadge risk={s.verification_risk_level} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={s.status} />
                          {s.pass_qr_code && <QrCode className="h-3.5 w-3.5 text-green-600" aria-label="QR pass wydany" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openDetail(s)} title="Szczegóły i decyzja">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                      Brak zgłoszeń medialnych dla tego wydarzenia.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail + Decision dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {selected.first_name} {selected.last_name}
                  <ScoreBadge score={selected.verification_score} band={selected.verification_status} />
                  <RiskBadge risk={selected.verification_risk_level} />
                  <StatusBadge status={selected.status} />
                  {selected.verification_overridden_by && (
                    <Badge variant="outline" className="text-xs">Nadpisane ręcznie</Badge>
                  )}
                </DialogTitle>
                <DialogDescription>
                  {selected.role ? (ROLE_LABEL[selected.role] ?? selected.role) : "Brak roli"}
                  {selected.media_organization ? ` · ${selected.media_organization}` : ""}
                  {selected.access_level ? ` · dostęp: ${accessLevelLabel(selected.access_level)}` : ""}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {/* QR pass preview */}
                {activePassCode && (
                  <div className="rounded-lg border border-green-600/40 bg-green-600/5 p-4">
                    <div className="flex items-start gap-4">
                      {passQrDataUrl ? (
                        <img src={passQrDataUrl} alt="QR pass"
                          className="h-28 w-28 shrink-0 rounded border border-border bg-white p-1" />
                      ) : (
                        <div className="h-28 w-28 shrink-0 grid place-items-center rounded bg-muted">
                          <QrCode className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium flex items-center gap-1.5">
                          <BadgeCheck className="h-4 w-4 text-green-600" /> QR pass
                          {selected.access_level && <span className="text-xs text-muted-foreground">· {accessLevelLabel(selected.access_level)}</span>}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Skanowalny w check-inie (online i offline).</p>
                        <code className="mt-2 block break-all rounded bg-muted px-2 py-1 text-xs">{activePassCode}</code>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => copyPassCode(activePassCode)}>
                            <Copy className="h-3.5 w-3.5" /> Kopiuj kod
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={downloadPassPdf}>
                            <Download className="h-3.5 w-3.5" /> Pobierz pass (PDF)
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1.5 text-destructive" onClick={() => setRevokeOpen(true)}>
                            <Ban className="h-3.5 w-3.5" /> Cofnij akredytację
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email failed warning + resend */}
                {decisionMade && (
                  <div className={`rounded-lg border p-3 text-sm flex items-center gap-2 ${emailFailed ? "border-amber-500/50 bg-amber-500/5" : "border-border bg-muted/30"}`}>
                    <Mail className={`h-4 w-4 shrink-0 ${emailFailed ? "text-amber-600" : "text-muted-foreground"}`} />
                    <span className="flex-1">
                      {selected.decision_email_status === "sent" && `E-mail z decyzją wysłany${selected.decision_email_sent_at ? ` · ${formatDateTime(selected.decision_email_sent_at)}` : ""}.`}
                      {selected.decision_email_status === "failed" && "E-mail z decyzją NIE został wysłany."}
                      {(!selected.decision_email_status || selected.decision_email_status === "skipped") && "E-mail z decyzją nie był wysyłany."}
                    </span>
                    <Button variant="outline" size="sm" className="gap-1.5"
                      onClick={() => resendMutation.mutate()} disabled={resendMutation.isPending}>
                      {resendMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                      Wyślij ponownie
                    </Button>
                  </div>
                )}

                {/* Uzasadnienie wyniku */}
                {selected.verification_explanation && (
                  <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                    <p className="font-medium mb-1">Dlaczego taki wynik</p>
                    <p className="text-muted-foreground">{selected.verification_explanation}</p>
                  </div>
                )}

                {/* Ostrzeżenia */}
                {selected.verification_flags && selected.verification_flags.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Ostrzeżenia ({selected.verification_flags.length})</p>
                    <ul className="space-y-1.5">
                      {selected.verification_flags.map((f: VerificationFlag, i) => (
                        <li key={`${f.code}-${i}`} className="flex gap-2 text-sm">
                          {FLAG_ICON[f.severity]}
                          <span className={f.severity === "high" ? "text-destructive" : "text-foreground"}>{f.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Dane zgłoszenia */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <Field label="E-mail" value={selected.email} />
                  <Field label="Telefon" value={selected.phone} />
                  <Field label="Redakcja / medium" value={selected.media_organization} />
                  <Field label="Stanowisko" value={selected.job_title} />
                  {selected.portfolio_url && (
                    <div className="col-span-2">
                      <p className="font-medium text-muted-foreground mb-0.5">Portfolio</p>
                      <a href={selected.portfolio_url} target="_blank" rel="noreferrer"
                        className="text-primary underline underline-offset-2 break-all inline-flex items-center gap-1">
                        <Globe className="h-3 w-3" /> {selected.portfolio_url}
                      </a>
                    </div>
                  )}
                  {selected.publication_links && (
                    <div className="col-span-2">
                      <p className="font-medium text-muted-foreground mb-0.5">Linki do publikacji</p>
                      <ul className="space-y-0.5">
                        {splitLinks(selected.publication_links).map((l, i) => (
                          <li key={i}>
                            <a href={l} target="_blank" rel="noreferrer"
                              className="text-primary underline underline-offset-2 break-all text-xs">{l}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selected.coverage_description && (
                    <Field className="col-span-2" label="Planowana relacja" value={selected.coverage_description} />
                  )}
                  {selected.requested_access && (
                    <Field className="col-span-2" label="Wnioskowany dostęp" value={selected.requested_access} />
                  )}
                </div>

                <Separator />

                {/* Korekta scoringu */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Korekta wyniku (PR manager)</p>
                    <Button variant="outline" size="sm" className="gap-1.5"
                      onClick={() => recalcMutation.mutate()} disabled={recalcMutation.isPending}>
                      {recalcMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      Przelicz
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="w-28">
                      <Label htmlFor="override-score" className="text-xs">Wynik (0–100)</Label>
                      <Input id="override-score" type="number" min={0} max={100}
                        value={overrideScore} onChange={(e) => setOverrideScore(e.target.value)} />
                    </div>
                    <div className="w-40">
                      <Label className="text-xs">Ryzyko</Label>
                      <Select value={overrideRisk} onValueChange={(v) => setOverrideRisk(v as VerificationRiskLevel)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Niskie</SelectItem>
                          <SelectItem value="medium">Średnie</SelectItem>
                          <SelectItem value="high">Wysokie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="secondary" size="sm"
                      onClick={() => overrideMutation.mutate()} disabled={overrideMutation.isPending}>
                      {overrideMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Nadpisz wynik"}
                    </Button>
                  </div>
                </div>

                {/* Historia */}
                {events.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <History className="h-4 w-4" /> Historia decyzji
                    </p>
                    <ul className="space-y-2">
                      {events.map((ev) => (
                        <li key={ev.id} className="text-xs border-l-2 border-border pl-3 py-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{EVENT_TYPE_LABEL[ev.event_type]}</span>
                            <span className="text-muted-foreground">{formatDateTime(ev.created_at)}</span>
                            {ev.actor_email && <span className="text-muted-foreground">· {ev.actor_email}</span>}
                          </div>
                          {ev.to_status && (
                            <div className="text-muted-foreground">
                              Status: {ev.from_status ?? "—"} → {ev.to_status}
                            </div>
                          )}
                          {ev.note && <div className="text-muted-foreground italic">„{ev.note}"</div>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* DECISION PANEL */}
                <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <p className="text-sm font-semibold flex items-center gap-1.5">
                    <BadgeCheck className="h-4 w-4 text-primary" /> Panel decyzji
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Status decyzji</Label>
                      <Select value={decisionStatus} onValueChange={(v) => setDecisionStatus(v as ApprovalStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {APPROVAL_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">
                        Access level {statusCreatesPass(decisionStatus) && <span className="text-destructive">*</span>}
                      </Label>
                      <Select value={decisionAccess} onValueChange={(v) => setDecisionAccess(v as AccessLevel)}
                        disabled={!statusCreatesPass(decisionStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ACCESS_LEVELS.map((a) => (
                            <SelectItem key={a.value} value={a.value}>{a.label}{a.limited ? " (ograniczony)" : ""}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="internal-note" className="text-xs">Notatka wewnętrzna (niewysyłana)</Label>
                    <Textarea id="internal-note" rows={2} value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Widoczna tylko dla zespołu…" />
                  </div>
                  <div>
                    <Label htmlFor="applicant-message" className="text-xs">Wiadomość do wnioskodawcy (w e-mailu)</Label>
                    <Textarea id="applicant-message" rows={2} value={applicantMessage}
                      onChange={(e) => setApplicantMessage(e.target.value)}
                      placeholder="Opcjonalna treść dołączona do e-maila…" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch id="send-email" checked={sendEmail} onCheckedChange={setSendEmail} />
                      <Label htmlFor="send-email" className="text-sm">Wyślij e-mail z decyzją</Label>
                    </div>
                    <Button className="gap-1.5" onClick={() => decisionMutation.mutate()} disabled={decisionMutation.isPending}>
                      {decisionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Zapisz decyzję
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Approved / Approved limited tworzą QR pass. Rejected / Waitlisted — nie.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke dialog */}
      <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Ban className="h-5 w-5 text-destructive" /> Cofnij akredytację</DialogTitle>
            <DialogDescription>QR pass przestanie działać przy check-inie (online i offline). Operacja jest logowana.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="revoke-reason" className="text-sm">Powód cofnięcia <span className="text-destructive">*</span></Label>
            <Textarea id="revoke-reason" rows={3} value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)} placeholder="np. naruszenie zasad, podszywanie się…" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeOpen(false)} disabled={revokeMutation.isPending}>Anuluj</Button>
            <Button variant="destructive" className="gap-1.5"
              onClick={() => revokeMutation.mutate()} disabled={revokeMutation.isPending || !revokeReason.trim()}>
              {revokeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
              Cofnij akredytację
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk decision dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RotateCcw className="h-5 w-5 text-primary" /> Masowa decyzja</DialogTitle>
            <DialogDescription>
              Zastosuj „{STATUS_BADGE[bulkStatus]?.label}" do {selectedCount} zaznaczonych (tylko oczekujące).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {statusCreatesPass(bulkStatus) && (
              <div>
                <Label className="text-xs">Access level <span className="text-destructive">*</span></Label>
                <Select value={bulkAccess} onValueChange={(v) => setBulkAccess(v as AccessLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACCESS_LEVELS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}{a.limited ? " (ograniczony)" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch id="bulk-send-email" checked={bulkSendEmail} onCheckedChange={setBulkSendEmail} />
              <Label htmlFor="bulk-send-email" className="text-sm">Wyślij e-maile z decyzją</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)} disabled={bulkMutation.isPending}>Anuluj</Button>
            <Button className="gap-1.5" onClick={() => bulkMutation.mutate()} disabled={bulkMutation.isPending}>
              {bulkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Zastosuj do {selectedCount}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

function Field({
  label, value, className = "",
}: { label: string; value: string | null | undefined; className?: string }) {
  return (
    <div className={className}>
      <p className="font-medium text-muted-foreground mb-0.5">{label}</p>
      <p className="break-words whitespace-pre-wrap">{value || "—"}</p>
    </div>
  );
}

export default MediaVerificationPanel;
