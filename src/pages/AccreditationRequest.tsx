/**
 * AccreditationRequest.tsx — publiczny formularz akredytacji.
 *
 * Layout zgodny z mockupem "Formularz akredytacji · publiczny":
 *  - .light wrapper (jasny motyw, kontrast do reszty aplikacji)
 *  - publiczny header (logo + SSL + język)
 *  - 2-kolumnowy układ: stepper + hero + form po lewej, event summary po prawej
 *  - hero z gradient akcentu i serif italic ("z dokładnością.")
 *
 * Logika (mockEvent + handleSubmit) zachowana 1:1.
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Globe, Info, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AccreditationForm } from "@/components/accreditation/AccreditationForm";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/auth";
import { toast } from "sonner";

// Przykładowe dane wydarzenia (jak w obecnej wersji)
const getMockEvent = (eventId: string) => ({
  id: eventId,
  title: "Summer Music Festival 2025",
  titlePl: "Letni Festiwal Muzyczny 2025",
  location: "Warsaw, Poland",
  locationPl: "Warszawa, Polska",
  startDate: "2025-06-15T10:00:00",
  endDate: "2025-06-17T22:00:00",
  description: "The biggest summer music festival in Eastern Europe",
  descriptionPl: "Największy letni festiwal muzyczny w Europie Wschodniej",
  deadline: "2025-05-15T23:59:59",
});

const AccreditationRequest = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, currentLanguage } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<ReturnType<typeof getMockEvent> | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (eventId) setEventData(getMockEvent(eventId));
  }, [eventId]);

  const handleSubmit = async (_formData: unknown) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success(t("accreditation.requestSubmitted"));
    } catch {
      toast.error(t("accreditation.requestError"));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Submitted state ──────────────────────────────────────
  if (isSubmitted) {
    return (
      <PublicShell>
        <div className="max-w-md mx-auto py-20">
          <Card className="rounded-xl border-border shadow-card">
            <CardHeader>
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-full bg-success/10 grid place-items-center">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
              </div>
              <CardTitle className="text-center">{t("accreditation.thankYou")}</CardTitle>
              <CardDescription className="text-center">
                {t("accreditation.requestReceived")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground text-sm">
                {t("accreditation.confirmationSent")}
              </p>
              <div className="flex justify-center gap-3 mt-6">
                <Button variant="outline" className="rounded-md" onClick={() => navigate("/accreditation-categories")}>
                  {t("accreditation.browseMoreEvents")}
                </Button>
                <Button className="rounded-md" onClick={() => navigate(user ? "/dashboard" : "/")}>
                  {user ? t("navigation.dashboard") : t("common.backToHome")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicShell>
    );
  }

  // ── Loading state ────────────────────────────────────────
  if (!eventData) {
    return (
      <PublicShell>
        <div className="max-w-md mx-auto py-32 text-center">
          <div className="h-3 w-32 mx-auto skeleton mb-3" />
          <div className="h-3 w-48 mx-auto skeleton" />
          <p className="text-muted-foreground text-sm mt-4">{t("common.loading")}</p>
        </div>
      </PublicShell>
    );
  }

  const title = currentLanguage === "en" ? eventData.title : eventData.titlePl;
  const location = currentLanguage === "en" ? eventData.location : eventData.locationPl;

  // ── Main form ────────────────────────────────────────────
  return (
    <PublicShell>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-[calc(100vh-65px)]">
        {/* LEFT — stepper + hero + form */}
        <div className="overflow-y-auto px-6 py-10 md:px-14 md:py-14">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-8 -ml-2 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("common.back")}
          </Button>

          <div className="max-w-[720px]">
            {/* Stepper */}
            <ol className="flex items-center gap-3 mb-8">
              {[
                { n: 1, label: "Dane", state: "done" as const },
                { n: 2, label: "Akredytacja", state: "now" as const },
                { n: 3, label: "Dokumenty", state: "next" as const },
                { n: 4, label: "Podsumowanie", state: "next" as const },
              ].map((s, i, arr) => (
                <React.Fragment key={s.n}>
                  <li className="flex items-center gap-2">
                    <span
                      className={[
                        "h-[22px] w-[22px] rounded-full grid place-items-center text-[11px] font-semibold",
                        s.state === "done" && "bg-foreground text-background",
                        s.state === "now" && "bg-gradient-accent text-primary-foreground shadow-glow-soft",
                        s.state === "next" && "bg-muted text-muted-foreground border border-border",
                      ].filter(Boolean).join(" ")}
                    >
                      {s.state === "done" ? "✓" : s.n}
                    </span>
                    <span
                      className={[
                        "text-[12.5px]",
                        s.state === "next" ? "text-muted-foreground" : "text-foreground",
                        s.state === "now" && "font-medium",
                      ].filter(Boolean).join(" ")}
                    >
                      {s.label}
                    </span>
                  </li>
                  {i < arr.length - 1 && <span className="flex-1 h-px bg-border max-w-[60px]" />}
                </React.Fragment>
              ))}
            </ol>

            {/* Eyebrow + Hero heading */}
            <div className="mono text-[11.5px] tracking-wider uppercase font-semibold text-primary">
              KROK 2 / 4
            </div>
            <h1 className="text-4xl md:text-[40px] font-semibold text-foreground tracking-tight leading-[1.05] mt-2">
              Twoja akredytacja,<br />
              <span className="serif-italic text-muted-foreground">z dokładnością.</span>
            </h1>
            <p className="mt-4 text-[15px] text-muted-foreground max-w-[540px] leading-relaxed">
              {t("accreditation.fillForm")}
            </p>

            {/* Form card */}
            <Card className="rounded-xl border-border shadow-card mt-8 p-2 md:p-4">
              <CardContent className="pt-4">
                <AccreditationForm
                  eventId={eventId || ""}
                  onSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>

            {/* Footer micro-actions */}
            <div className="flex items-center justify-between mt-6 text-[12px] text-muted-foreground">
              <span className="mono">Autozapis · 12s temu</span>
              <button className="inline-flex items-center gap-1 text-foreground hover:underline">
                Kontynuuj <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — event summary */}
        <aside className="border-t lg:border-t-0 lg:border-l border-border bg-muted/40 px-8 py-10 md:py-14 overflow-y-auto">
          {/* Event card with aurora */}
          <div
            className="rounded-2xl border border-border p-5 relative overflow-hidden"
            style={{
              background:
                "radial-gradient(80% 100% at 100% 0%, hsl(var(--secondary) / 0.18), transparent 60%), " +
                "radial-gradient(60% 80% at 0% 100%, hsl(var(--primary) / 0.18), transparent 60%), " +
                "hsl(var(--background))",
            }}
          >
            <div className="mono text-[10.5px] tracking-wider text-primary mb-2 font-semibold">
              WYDARZENIE
            </div>
            <h2 className="text-[22px] font-semibold text-foreground tracking-tight leading-tight">{title}</h2>
            <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">
              {location}<br />
              <span className="mono">
                {new Date(eventData.startDate).toLocaleDateString(currentLanguage === "en" ? "en-US" : "pl-PL", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </p>

            {/* Deadline */}
            <div className="mt-4 rounded-md border border-border bg-muted/40 p-3">
              <div className="text-[11.5px] text-muted-foreground">Termin zgłoszeń</div>
              <div className="flex justify-between items-center mt-1">
                <span className="mono text-[13px] text-foreground">
                  {new Date(eventData.deadline).toLocaleDateString(currentLanguage === "en" ? "en-US" : "pl-PL", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
                <span className="mono text-[12px] text-warning">
                  <DeadlineRemaining iso={eventData.deadline} />
                </span>
              </div>
            </div>
          </div>

          {/* Co dalej */}
          <div className="mt-8">
            <div className="mono text-[10.5px] tracking-wider uppercase text-muted-foreground mb-3">Co dalej</div>
            <ul className="space-y-2 text-[13px]">
              {[
                { icon: <CheckCircle2 className="h-3.5 w-3.5 text-success" />, label: "Wypełnij formularz · ok. 4 min", strong: true },
                { dot: true, label: "Załącz skan legitymacji prasowej" },
                { dot: true, label: "Otrzymasz potwierdzenie e-mail w 24h" },
                { dot: true, label: "QR + karta RFID czekają w dniu eventu" },
              ].map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-5 grid place-items-center">
                    {it.dot ? <span className="h-1 w-1 rounded-full bg-muted-foreground/50" /> : it.icon}
                  </span>
                  <span className={it.strong ? "text-foreground font-medium" : "text-muted-foreground"}>
                    {it.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy */}
          <div className="mt-8 rounded-md border border-border bg-background p-3">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-success" />
              <span className="text-[12.5px] font-medium text-foreground">Twoje dane są bezpieczne</span>
            </div>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              Zgłoszenie szyfrowane TLS 1.3. Zgodne z RODO. Przechowujemy dane tylko do końca wydarzenia + 30 dni.
            </p>
          </div>
        </aside>
      </div>
    </PublicShell>
  );
};

// ─── Light wrapper + header ───────────────────────────────────
function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="light">
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-[1440px] mx-auto px-6 md:px-14 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-gradient-accent grid place-items-center text-primary-foreground font-bold text-[13px] shadow-glow-soft">
                P
              </div>
              <span className="text-[14.5px] font-semibold text-foreground">
                Press<span className="text-muted-foreground">/</span>Accreditations
              </span>
            </div>
            <div className="flex items-center gap-5 text-[12.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Info className="h-3 w-3" /> Formularz zaufany · SSL
              </span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" /> PL · EN
              </span>
              <button className="text-foreground hover:underline">Pomoc</button>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function DeadlineRemaining({ iso }: { iso: string }) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return <>termin minął</>;
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  if (d > 1) return <>za {d} dni {h} godz</>;
  if (d === 1) return <>za 1 dz {h} godz</>;
  return <>za {h} godz</>;
}

export default AccreditationRequest;
