import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  supabase,
} from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

const TICKET_TYPES = [
  { value: "general", label: "Wstęp ogólny" },
  { value: "vip", label: "VIP" },
  { value: "press", label: "Prasa / Media" },
  { value: "speaker", label: "Prelegent" },
  { value: "exhibitor", label: "Wystawca" },
];

const EmbedRegisterForm = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const color = searchParams.get("color") || "#6366f1";
  const radius = searchParams.get("radius") || "12";
  const showCompany = searchParams.get("company") !== "false";
  const showPhone = searchParams.get("phone") === "true";
  const showTicketType = searchParams.get("ticket") !== "false";
  const ticketTypesParam = searchParams.get("ticketTypes");
  const availableTicketTypes = ticketTypesParam
    ? TICKET_TYPES.filter((t) => ticketTypesParam.split(",").includes(t.value))
    : TICKET_TYPES;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    phone: "",
    ticket_type: "general",
  });

  useEffect(() => {
    if (!eventId) return;
    // Fetch event info via public_events view (excludes organizer_id)
    supabase
      .from("public_events" as any)
      .select("id, title, max_guests, start_date, end_date, location")
      .eq("id", eventId)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError("Wydarzenie nie zostało znalezione lub rejestracja jest zamknięta.");
        } else {
          setEvent(data);
        }
        setLoading(false);
      });
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/embed-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            eventId,
            firstName: form.first_name,
            lastName: form.last_name,
            email: form.email,
            company: form.company || undefined,
            phone: form.phone || undefined,
            ticketType: form.ticket_type,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Wystąpił błąd");
        setSubmitting(false);
        return;
      }

      setWaitlisted(result.waitlisted);
      setSubmitted(true);
    } catch (err: any) {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="light">
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color }} />
        </div>
      </div>
    );
  }

  if (!event && error) {
    return (
      <div className="light">
        <div className="flex items-center justify-center min-h-screen p-6 bg-background">
          <div className="text-center space-y-3 max-w-sm">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="light">
        <div className="flex items-center justify-center min-h-screen p-6 bg-background">
          <div className="text-center space-y-4 max-w-sm">
            <CheckCircle className="h-16 w-16 mx-auto text-success" />
            <h2 className="text-xl font-bold text-foreground">
              {waitlisted ? "Dodano na listę oczekujących!" : "Rejestracja potwierdzona!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {waitlisted
                ? "Wydarzenie jest pełne. Powiadomimy Cię gdy zwolni się miejsce."
                : "Otrzymasz potwierdzenie na podany adres e-mail."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="light">
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-lg border border-border bg-card shadow-card p-6 space-y-4"
        >
          <div className="text-center space-y-1">
            <div className="h-1 rounded-full mx-auto w-16 mb-3" style={{ backgroundColor: color }} />
            <h2 className="text-lg font-bold text-foreground">{event?.title || "Rejestracja"}</h2>
            {event?.location && <p className="text-xs text-muted-foreground">{event.location}</p>}
            {event?.start_date && (
              <p className="text-xs text-muted-foreground">
                {new Date(event.start_date).toLocaleDateString("pl-PL", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Imię *</Label>
              <Input
                required
                maxLength={100}
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="rounded-lg mt-1"
                placeholder="Jan"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Nazwisko *</Label>
              <Input
                required
                maxLength={100}
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="rounded-lg mt-1"
                placeholder="Kowalski"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email *</Label>
              <Input
                type="email"
                required
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="rounded-lg mt-1"
                placeholder="jan@example.com"
              />
            </div>
            {showCompany && (
              <div>
                <Label className="text-xs text-muted-foreground">Firma</Label>
                <Input
                  maxLength={100}
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="rounded-lg mt-1"
                />
              </div>
            )}
            {showPhone && (
              <div>
                <Label className="text-xs text-muted-foreground">Telefon</Label>
                <Input
                  type="tel"
                  maxLength={20}
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="rounded-lg mt-1"
                />
              </div>
            )}
            {showTicketType && availableTicketTypes.length > 1 && (
              <div>
                <Label className="text-xs text-muted-foreground">Typ biletu *</Label>
                <select
                  required
                  value={form.ticket_type}
                  onChange={(e) => setForm((f) => ({ ...f, ticket_type: e.target.value }))}
                  className="mt-1 flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {availableTicketTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full rounded-lg text-white"
            disabled={submitting}
            style={{ backgroundColor: color }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Zarejestruj się"
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground/60 text-center">
            Powered by Akredytacje
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmbedRegisterForm;
