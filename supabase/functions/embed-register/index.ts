import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, firstName, lastName, email, company, phone } = await req.json();

    // Validate required fields
    if (!eventId || !firstName || !lastName || !email) {
      return new Response(
        JSON.stringify({ error: "Wymagane pola: eventId, firstName, lastName, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic validation
    if (firstName.length > 100 || lastName.length > 100 || email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Przekroczono limit długości pól" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Nieprawidłowy adres email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check event exists and is published
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, max_guests, is_published")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Wydarzenie nie zostało znalezione" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!event.is_published) {
      return new Response(
        JSON.stringify({ error: "Rejestracja na to wydarzenie jest zamknięta" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate email
    const { count: existingCount } = await supabase
      .from("guests")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("email", email);

    if (existingCount && existingCount > 0) {
      return new Response(
        JSON.stringify({ error: "Ten adres email jest już zarejestrowany na to wydarzenie" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check capacity
    let isWaitlisted = false;
    if (event.max_guests) {
      const { count: guestCount } = await supabase
        .from("guests")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .in("status", ["confirmed", "checked-in"]);

      if (guestCount && guestCount >= event.max_guests) {
        isWaitlisted = true;
      }
    }

    // Generate QR code
    const qrCode = crypto.randomUUID();

    // Insert guest
    const { data: guest, error: insertError } = await supabase
      .from("guests")
      .insert({
        event_id: eventId,
        first_name: firstName.trim().slice(0, 100),
        last_name: lastName.trim().slice(0, 100),
        email: email.trim().toLowerCase().slice(0, 255),
        company: company?.trim().slice(0, 100) || null,
        phone: phone?.trim().slice(0, 20) || null,
        status: isWaitlisted ? "waitlisted" : "confirmed",
        ticket_type: "general",
        qr_code: qrCode,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Nie udało się zarejestrować. Spróbuj ponownie." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        waitlisted: isWaitlisted,
        guestId: guest.id,
        message: isWaitlisted
          ? "Dodano na listę oczekujących. Powiadomimy Cię gdy zwolni się miejsce."
          : "Rejestracja potwierdzona! Otrzymasz potwierdzenie na e-mail.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Register error:", e);
    return new Response(
      JSON.stringify({ error: "Błąd serwera" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
