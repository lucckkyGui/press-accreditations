import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateQRCodeSVG(data: string): string {
  // Simple QR code placeholder using a Google Charts API URL for the email
  // We'll use an inline SVG approach with the data encoded
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&format=svg`;
  return qrUrl;
}

function buildConfirmationEmail(params: {
  firstName: string;
  lastName: string;
  eventTitle: string;
  qrCode: string;
  isWaitlisted: boolean;
}): string {
  const { firstName, lastName, eventTitle, qrCode, isWaitlisted } = params;
  const qrUrl = generateQRCodeSVG(qrCode);

  if (isWaitlisted) {
    return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(108,92,231,0.08);">
    <div style="background:linear-gradient(135deg,#7c6ce7,#38b2ac);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Lista oczekujących</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#1e1b3a;margin:0 0 16px;">Cześć <strong>${firstName}</strong>,</p>
      <p style="font-size:14px;color:#55575d;line-height:1.6;margin:0 0 16px;">
        Zostałeś/aś dodany/a na <strong>listę oczekujących</strong> na wydarzenie <strong>${eventTitle}</strong>.
      </p>
      <p style="font-size:14px;color:#55575d;line-height:1.6;margin:0 0 24px;">
        Powiadomimy Cię e-mailem, gdy zwolni się miejsce. Zachowaj tę wiadomość.
      </p>
      <div style="text-align:center;padding:16px;background:#f8f7ff;border-radius:12px;">
        <p style="font-size:12px;color:#7c6ce7;margin:0;">Twój status: <strong>Oczekujący</strong></p>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f8f7ff;text-align:center;">
      <p style="font-size:11px;color:#999;margin:0;">Press Accreditations System</p>
    </div>
  </div>
</body>
</html>`;
  }

  return `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(108,92,231,0.08);">
    <div style="background:linear-gradient(135deg,#7c6ce7,#38b2ac);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Rejestracja potwierdzona!</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#1e1b3a;margin:0 0 16px;">Cześć <strong>${firstName}</strong>,</p>
      <p style="font-size:14px;color:#55575d;line-height:1.6;margin:0 0 8px;">
        Twoja rejestracja na wydarzenie <strong>${eventTitle}</strong> została potwierdzona.
      </p>
      <p style="font-size:14px;color:#55575d;line-height:1.6;margin:0 0 24px;">
        Poniżej znajdziesz swój kod QR — okaż go przy wejściu na wydarzenie.
      </p>
      <div style="text-align:center;padding:24px;background:#f8f7ff;border-radius:12px;margin:0 0 24px;">
        <img src="${qrUrl}" alt="Kod QR" width="200" height="200" style="display:block;margin:0 auto 12px;" />
        <p style="font-size:11px;color:#7c6ce7;margin:0;word-break:break-all;">Kod: ${qrCode}</p>
      </div>
      <div style="background:#f0fdf4;border-left:4px solid #38b2ac;padding:12px 16px;border-radius:0 8px 8px 0;margin:0 0 16px;">
        <p style="font-size:13px;color:#1e1b3a;margin:0;">
          <strong>Imię i nazwisko:</strong> ${firstName} ${lastName}
        </p>
      </div>
      <p style="font-size:13px;color:#999;line-height:1.5;margin:0;">
        Zachowaj tę wiadomość — kod QR jest wymagany do wejścia.
      </p>
    </div>
    <div style="padding:16px 24px;background:#f8f7ff;text-align:center;">
      <p style="font-size:11px;color:#999;margin:0;">Press Accreditations System</p>
    </div>
  </div>
</body>
</html>`;
}

async function sendConfirmationEmail(params: {
  to: string;
  firstName: string;
  lastName: string;
  eventTitle: string;
  qrCode: string;
  isWaitlisted: boolean;
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("RESEND_API_KEY not set, skipping email");
    return;
  }

  const html = buildConfirmationEmail(params);
  const subject = params.isWaitlisted
    ? `Lista oczekujących — ${params.eventTitle}`
    : `Potwierdzenie rejestracji — ${params.eventTitle}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Rejestracja <onboarding@resend.dev>",
        to: [params.to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
    } else {
      console.log("Confirmation email sent to:", params.to);
    }
  } catch (e) {
    console.error("Email send failed:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, firstName, lastName, email, company, phone, ticketType } = await req.json();
    const VALID_TICKET_TYPES = ["general", "vip", "press", "speaker", "exhibitor"];
    const safeTicketType = VALID_TICKET_TYPES.includes(ticketType) ? ticketType : "general";

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
        ticket_type: safeTicketType,
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

    // Send confirmation email (non-blocking)
    sendConfirmationEmail({
      to: guest.email,
      firstName: guest.first_name,
      lastName: guest.last_name,
      eventTitle: event.title,
      qrCode,
      isWaitlisted,
    }).catch((e) => console.error("Email background error:", e));

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
