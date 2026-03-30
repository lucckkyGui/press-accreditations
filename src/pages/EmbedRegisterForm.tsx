import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
    // Fetch event info (published events are publicly visible via RLS)
    supabase
      .from("events")
      .select("id, title, max_guests, start_date, end_date, location")
      .eq("id", eventId)
      .eq("is_published", true)
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
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/embed-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color }} />
      </div>
    );
  }

  if (!event && error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="h-16 w-16 mx-auto" style={{ color }} />
          <h2 className="text-xl font-bold text-gray-900">
            {waitlisted ? "Dodano na listę oczekujących!" : "Rejestracja potwierdzona!"}
          </h2>
          <p className="text-sm text-gray-500">
            {waitlisted
              ? "Wydarzenie jest pełne. Powiadomimy Cię gdy zwolni się miejsce."
              : "Otrzymasz potwierdzenie na podany adres e-mail."}
          </p>
        </div>
      </div>
    );
  }

  const r = `${Math.min(parseInt(radius), 8)}px`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-xl p-6 space-y-4"
        style={{ borderRadius: `${radius}px` }}
      >
        <div className="text-center space-y-1">
          <div className="h-1.5 rounded-full mx-auto w-16 mb-3" style={{ backgroundColor: color }} />
          <h2 className="text-lg font-bold text-gray-900">{event?.title || "Rejestracja"}</h2>
          {event?.location && <p className="text-xs text-gray-500">{event.location}</p>}
          {event?.start_date && (
            <p className="text-xs text-gray-400">
              {new Date(event.start_date).toLocaleDateString("pl-PL", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-gray-600">Imię *</Label>
            <Input
              required
              maxLength={100}
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              style={{ borderRadius: r }}
              placeholder="Jan"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Nazwisko *</Label>
            <Input
              required
              maxLength={100}
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              style={{ borderRadius: r }}
              placeholder="Kowalski"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Email *</Label>
            <Input
              type="email"
              required
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={{ borderRadius: r }}
              placeholder="jan@example.com"
            />
          </div>
          {showCompany && (
            <div>
              <Label className="text-xs text-gray-600">Firma</Label>
              <Input
                maxLength={100}
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                style={{ borderRadius: r }}
              />
            </div>
          )}
          {showPhone && (
            <div>
              <Label className="text-xs text-gray-600">Telefon</Label>
              <Input
                type="tel"
                maxLength={20}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                style={{ borderRadius: r }}
              />
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full text-white"
          disabled={submitting}
          style={{ backgroundColor: color, borderRadius: r }}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Zarejestruj się"
          )}
        </Button>

        <p className="text-[10px] text-gray-400 text-center">
          Powered by Akredytacje
        </p>
      </form>
    </div>
  );
};

export default EmbedRegisterForm;
