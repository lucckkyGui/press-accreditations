/**
 * Publiczny formularz dodania publikacji — `/coverage/:token`.
 *
 * Bez logowania. Dziennikarz dostaje secure link (CVG-…) w e-mailu remindera.
 * Dane i zapis idą przez edge function `coverage-submit` (service role).
 * Prosty, mobile-friendly, z ekranem sukcesu.
 */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { isValidCoverageTokenFormat } from "@/lib/crm/mediaCrm";
import { usePageTitle } from "@/hooks/usePageTitle";

type Phase = "loading" | "invalid" | "expired" | "form" | "success";

interface FormState {
  article_url: string;
  gallery_url: string;
  video_url: string;
  social_post_url: string;
  publication_date: string;
  estimated_reach: string;
  sponsor_mentions: string;
  publication_type: string;
  notes: string;
}

const EMPTY: FormState = {
  article_url: "", gallery_url: "", video_url: "", social_post_url: "",
  publication_date: "", estimated_reach: "", sponsor_mentions: "", publication_type: "", notes: "",
};

const CoverageForm = () => {
  usePageTitle("Dodaj publikację");
  const { token = "" } = useParams<{ token: string }>();
  const [phase, setPhase] = useState<Phase>("loading");
  const [eventName, setEventName] = useState<string | null>(null);
  const [applicant, setApplicant] = useState<string>("");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isValidCoverageTokenFormat(token)) { setPhase("invalid"); return; }
      try {
        // GET ?token — supabase-js invoke nie przenosi query, więc bezpośredni fetch.
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/coverage-submit?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_PUBLISHABLE_KEY } },
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setPhase((data?.error === "expired_token") ? "expired" : "invalid");
          return;
        }
        applyContext(data, cancelled);
      } catch {
        if (!cancelled) setPhase("invalid");
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const applyContext = (data: unknown, cancelled: boolean) => {
    if (cancelled) return;
    const d = data as { ok?: boolean; error?: string; event?: { title?: string }; applicant?: { firstName?: string; lastName?: string; mediaName?: string }; status?: string };
    if (!d?.ok) {
      setPhase(d?.error === "expired_token" ? "expired" : "invalid");
      return;
    }
    setEventName(d.event?.title ?? null);
    setApplicant([d.applicant?.firstName, d.applicant?.lastName].filter(Boolean).join(" ") || d.applicant?.mediaName || "");
    setPhase(d.status === "coverage_submitted" || d.status === "coverage_verified" ? "success" : "form");
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.article_url && !form.gallery_url && !form.video_url && !form.social_post_url) {
      setError("Podaj przynajmniej jeden link do publikacji.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("coverage-submit", { body: { token, ...form } });
      if (error) throw error;
      const d = data as { ok?: boolean; error?: string };
      if (!d?.ok) throw new Error(d?.error ?? "submit_failed");
      setPhase("success");
    } catch (err) {
      setError("Nie udało się zapisać. Spróbuj ponownie za chwilę.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {phase === "loading" && (
          <div className="grid place-items-center py-20"><Loader2 className="h-7 w-7 animate-spin text-muted-foreground" /></div>
        )}

        {(phase === "invalid" || phase === "expired") && (
          <div className="rounded-xl border border-border bg-background p-6 text-center">
            <AlertTriangle className="h-9 w-9 text-destructive mx-auto mb-3" />
            <h1 className="font-semibold text-lg">{phase === "expired" ? "Link wygasł" : "Nieprawidłowy link"}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {phase === "expired"
                ? "Termin na dodanie publikacji minął. Skontaktuj się z organizatorem."
                : "Ten link do dodania publikacji jest nieprawidłowy."}
            </p>
          </div>
        )}

        {phase === "success" && (
          <div className="rounded-xl border border-green-600/40 bg-green-600/5 p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <h1 className="font-semibold text-lg">Dziękujemy!</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Twoja publikacja została dostarczona{eventName ? ` (${eventName})` : ""}. Organizator ją zweryfikuje.
            </p>
          </div>
        )}

        {phase === "form" && (
          <form onSubmit={submit} className="rounded-xl border border-border bg-background p-5 space-y-4">
            <div>
              <h1 className="font-semibold text-lg">Dodaj publikację</h1>
              <p className="text-sm text-muted-foreground">
                {eventName ? `${eventName} · ` : ""}{applicant}
              </p>
            </div>

            <div className="space-y-3">
              <div><Label htmlFor="article_url" className="text-xs">Link do artykułu</Label>
                <Input id="article_url" inputMode="url" placeholder="https://…" value={form.article_url} onChange={set("article_url")} /></div>
              <div><Label htmlFor="gallery_url" className="text-xs">Link do galerii</Label>
                <Input id="gallery_url" inputMode="url" placeholder="https://…" value={form.gallery_url} onChange={set("gallery_url")} /></div>
              <div><Label htmlFor="video_url" className="text-xs">Link do wideo</Label>
                <Input id="video_url" inputMode="url" placeholder="https://…" value={form.video_url} onChange={set("video_url")} /></div>
              <div><Label htmlFor="social_post_url" className="text-xs">Link do posta social</Label>
                <Input id="social_post_url" inputMode="url" placeholder="https://…" value={form.social_post_url} onChange={set("social_post_url")} /></div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="publication_date" className="text-xs">Data publikacji</Label>
                  <Input id="publication_date" type="date" value={form.publication_date} onChange={set("publication_date")} /></div>
                <div><Label htmlFor="publication_type" className="text-xs">Typ publikacji</Label>
                  <Input id="publication_type" placeholder="np. artykuł, relacja TV" value={form.publication_type} onChange={set("publication_type")} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label htmlFor="estimated_reach" className="text-xs">Szacowany zasięg</Label>
                  <Input id="estimated_reach" inputMode="numeric" placeholder="np. 50000" value={form.estimated_reach} onChange={set("estimated_reach")} /></div>
                <div><Label htmlFor="sponsor_mentions" className="text-xs">Wzmianki sponsora</Label>
                  <Input id="sponsor_mentions" inputMode="numeric" placeholder="np. 3" value={form.sponsor_mentions} onChange={set("sponsor_mentions")} /></div>
              </div>
              <div><Label htmlFor="notes" className="text-xs">Uwagi</Label>
                <Textarea id="notes" rows={2} value={form.notes} onChange={set("notes")} /></div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full gap-2" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Wyślij publikację
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CoverageForm;
