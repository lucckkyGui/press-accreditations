import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const EmbedRegisterForm = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const color = searchParams.get("color") || "#6366f1";
  const radius = searchParams.get("radius") || "12";
  const showCompany = searchParams.get("company") !== "false";
  const showPhone = searchParams.get("phone") === "true";

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company: "",
    phone: "",
  });

  useEffect(() => {
    if (!eventId) return;
    supabase
      .from("events")
      .select("id, title, max_guests, start_date, end_date, location")
      .eq("id", eventId)
      .single()
      .then(({ data }) => {
        setEvent(data);
        setLoading(false);
      });
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    setSubmitting(true);

    try {
      // Check capacity
      if (event?.max_guests) {
        const { count } = await supabase
          .from("guests")
          .select("id", { count: "exact", head: true })
          .eq("event_id", eventId);

        if (count && count >= event.max_guests) {
          // Add to waitlist
          const { error } = await supabase.from("guests").insert({
            event_id: eventId,
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            company: form.company || null,
            phone: form.phone || null,
            status: "waitlisted",
            ticket_type: "general",
            qr_code: uuidv4(),
          });
          if (error) throw error;
          setWaitlisted(true);
          setSubmitted(true);
          setSubmitting(false);
          return;
        }
      }

      const { error } = await supabase.from("guests").insert({
        event_id: eventId,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        company: form.company || null,
        phone: form.phone || null,
        status: "confirmed",
        ticket_type: "general",
        qr_code: uuidv4(),
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Wystąpił błąd");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color }} />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center space-y-4 max-w-sm">
          <CheckCircle className="h-16 w-16 mx-auto" style={{ color }} />
          <h2 className="text-xl font-bold">
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
          <h2 className="text-lg font-bold">{event?.title || "Rejestracja"}</h2>
          {event?.location && <p className="text-xs text-gray-500">{event.location}</p>}
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Imię *</Label>
            <Input
              required
              value={form.first_name}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
              style={{ borderRadius: r }}
            />
          </div>
          <div>
            <Label className="text-xs">Nazwisko *</Label>
            <Input
              required
              value={form.last_name}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
              style={{ borderRadius: r }}
            />
          </div>
          <div>
            <Label className="text-xs">Email *</Label>
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              style={{ borderRadius: r }}
            />
          </div>
          {showCompany && (
            <div>
              <Label className="text-xs">Firma</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                style={{ borderRadius: r }}
              />
            </div>
          )}
          {showPhone && (
            <div>
              <Label className="text-xs">Telefon</Label>
              <Input
                type="tel"
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
