/**
 * Media CRM — kontakty i media (outlets) + szczegóły kontaktu z historią.
 * Supporting module (core flow: coverage collection → report).
 */
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Building2, Star, Loader2, Mail, Phone, History, Tag, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth/useAuth";
import {
  fetchContacts, fetchOutlets, fetchContactHistory, updateContactCrm, contactRates,
  exportContactData, anonymizeContact,
  type MediaContact, type MediaOutlet, type ContactHistory,
} from "@/services/crm/mediaCrmService";
import { qualityLabel, suggestQualityRating } from "@/lib/crm/mediaCrm";

const RATING_TONE: Record<number, string> = {
  5: "bg-green-600 text-white", 4: "bg-emerald-600 text-white", 3: "bg-blue-600 text-white",
  2: "bg-amber-500 text-white", 1: "bg-destructive text-white",
};

function RatingBadge({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-muted-foreground text-sm">—</span>;
  return <Badge className={RATING_TONE[rating] ?? "bg-muted"}>{rating} · {qualityLabel(rating)}</Badge>;
}

const MediaCrmPage = () => {
  usePageTitle("Media CRM");
  const qc = useQueryClient();
  const { isAdmin } = useAuth();
  const [selected, setSelected] = useState<MediaContact | null>(null);
  const [search, setSearch] = useState("");

  // edycja w szczegółach
  const [tags, setTags] = useState("");
  const [rating, setRating] = useState<string>("");
  const [notes, setNotes] = useState("");

  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ["media_contacts"], queryFn: fetchContacts,
  });
  const { data: outlets = [], isLoading: loadingOutlets } = useQuery({
    queryKey: ["media_outlets"], queryFn: fetchOutlets,
  });
  const { data: history } = useQuery<ContactHistory>({
    queryKey: ["contact_history", selected?.id], enabled: !!selected,
    queryFn: () => fetchContactHistory(selected!),
  });

  const outletName = useMemo(() => {
    const m = new Map(outlets.map((o) => [o.id, o.name]));
    return (id: string | null) => (id ? m.get(id) ?? "—" : "—");
  }, [outlets]);

  const openContact = (c: MediaContact) => {
    setSelected(c);
    setTags((c.tags ?? []).join(", "));
    setRating(c.quality_rating?.toString() ?? "");
    setNotes(c.pr_notes ?? "");
  };

  const saveMutation = useMutation({
    mutationFn: () => updateContactCrm(selected!.id, {
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      quality_rating: rating ? Number(rating) : null,
      pr_notes: notes || null,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media_contacts"] });
      toast.success("Zapisano");
    },
    onError: (e) => toast.error("Błąd zapisu", { description: String(e) }),
  });

  const exportMutation = useMutation({
    mutationFn: () => exportContactData(selected!.id),
    onSuccess: (data) => {
      if (!data) { toast.error("Brak danych kontaktu"); return; }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contact-${data.contact.email.replace(/[^a-z0-9]+/gi, "-")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Wyeksportowano dane kontaktu (RODO)");
    },
    onError: (e) => toast.error("Błąd eksportu", { description: String(e) }),
  });

  const anonymizeMutation = useMutation({
    mutationFn: () => anonymizeContact(selected!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["media_contacts"] });
      setSelected(null);
      toast.success("Dane kontaktu zanonimizowane (RODO)");
    },
    onError: (e) => toast.error("Błąd anonimizacji", { description: String(e) }),
  });

  const filteredContacts = contacts.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [c.first_name, c.last_name, c.email].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
  });

  const rates = selected ? contactRates(selected) : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Media CRM</h1>
        <p className="text-muted-foreground">Baza kontaktów i mediów — historia, rating, coverage.</p>
      </div>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts" className="gap-1.5"><Users className="h-4 w-4" /> Kontakty ({contacts.length})</TabsTrigger>
          <TabsTrigger value="outlets" className="gap-1.5"><Building2 className="h-4 w-4" /> Media ({outlets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Kontakty medialne</CardTitle>
                  <CardDescription>Dziennikarze i twórcy z historią współpracy.</CardDescription>
                </div>
                <Input placeholder="Szukaj…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-[200px] h-9" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingContacts ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Osoba</TableHead><TableHead>Medium</TableHead>
                      <TableHead>Rating</TableHead><TableHead>Zaakcept.</TableHead>
                      <TableHead>Obecność</TableHead><TableHead>Coverage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.length > 0 ? filteredContacts.map((c) => (
                      <TableRow key={c.id} className="cursor-pointer" onClick={() => openContact(c)}>
                        <TableCell className="font-medium">{c.first_name} {c.last_name}
                          <div className="text-xs text-muted-foreground">{c.email}</div></TableCell>
                        <TableCell className="text-sm">{outletName(c.primary_outlet_id)}</TableCell>
                        <TableCell><RatingBadge rating={c.quality_rating} /></TableCell>
                        <TableCell className="text-sm tabular-nums">{c.approved_count}</TableCell>
                        <TableCell className="text-sm tabular-nums">{c.checked_in_count}/{c.approved_count}</TableCell>
                        <TableCell className="text-sm tabular-nums">{c.coverage_count}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                        Brak kontaktów. Pojawią się po zatwierdzeniu zgłoszeń.
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outlets" className="mt-4">
          <Card>
            <CardHeader><CardTitle>Media (outlets)</CardTitle>
              <CardDescription>Redakcje z deduplikacją po nazwie/domenie.</CardDescription></CardHeader>
            <CardContent>
              {loadingOutlets ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Nazwa</TableHead><TableHead>Domena</TableHead><TableHead>Typ</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {outlets.length > 0 ? outlets.map((o: MediaOutlet) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{o.domain ?? "—"}</TableCell>
                        <TableCell className="text-sm">{o.media_type ?? "—"}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground text-sm">
                        Brak mediów.
                      </TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact detail */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {selected.first_name} {selected.last_name}
                  <RatingBadge rating={selected.quality_rating} />
                </DialogTitle>
                <DialogDescription>
                  {selected.role ?? "—"} · {outletName(selected.primary_outlet_id)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {selected.email}</div>
                  <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {selected.phone ?? "—"}</div>
                </div>

                {/* Wskaźniki */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "No-show", value: `${rates?.noShowRate ?? 0}%`, hint: `${selected.checked_in_count}/${selected.approved_count}` },
                    { label: "Obecność", value: `${rates?.showRate ?? 0}%`, hint: "checked-in/approved" },
                    { label: "Coverage", value: `${rates?.coverageRate ?? 0}%`, hint: "coverage/checked-in" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border p-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                      <div className="text-lg font-bold tabular-nums">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground">{s.hint}</div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Edycja CRM */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs flex items-center gap-1"><Tag className="h-3 w-3" /> Tagi (po przecinku)</Label>
                    <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="VIP, foto, lokalne" />
                  </div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label className="text-xs flex items-center gap-1"><Star className="h-3 w-3" /> Quality rating</Label>
                      <Select value={rating} onValueChange={setRating}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} · {qualityLabel(r)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setRating(String(suggestQualityRating({
                      approved: selected.approved_count, checkedIn: selected.checked_in_count, coverageSubmitted: selected.coverage_count,
                    })))}>Sugeruj</Button>
                  </div>
                  <div>
                    <Label className="text-xs">Notatki PR</Label>
                    <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Zapisz"}
                  </Button>
                </div>

                {/* GDPR — admin only */}
                {isAdmin && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                    <p className="text-xs font-medium mb-2">RODO — dane osobowe</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5"
                        onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
                        {exportMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                        Eksportuj dane
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5 text-destructive"
                        onClick={() => { if (window.confirm("Zanonimizować dane osobowe tego kontaktu? Tej operacji nie można cofnąć.")) anonymizeMutation.mutate(); }}
                        disabled={anonymizeMutation.isPending}>
                        {anonymizeMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Usuń / anonimizuj
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Historia */}
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><History className="h-4 w-4" /> Historia zgłoszeń</p>
                  {history && history.submissions.length > 0 ? (
                    <ul className="space-y-1.5">
                      {history.submissions.map((s) => (
                        <li key={s.id} className="text-xs flex items-center justify-between border-l-2 border-border pl-3 py-0.5">
                          <span>{s.created_at ? new Date(s.created_at).toLocaleDateString("pl-PL") : "—"}</span>
                          <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-muted-foreground">Brak historii zgłoszeń.</p>}

                  {history && history.coverage.length > 0 && (
                    <>
                      <p className="text-sm font-medium mt-3 mb-2">Historia coverage</p>
                      <ul className="space-y-1.5">
                        {history.coverage.map((c) => (
                          <li key={c.id} className="text-xs flex items-center justify-between border-l-2 border-border pl-3 py-0.5">
                            <span>{c.created_at ? new Date(c.created_at).toLocaleDateString("pl-PL") : "—"}</span>
                            <Badge variant="outline" className="text-[10px]">{c.status}</Badge>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaCrmPage;
