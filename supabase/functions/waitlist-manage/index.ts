import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonRes(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sendPromotionEmail(params: {
  to: string;
  firstName: string;
  eventTitle: string;
  qrCode: string;
}) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) return;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(params.qrCode)}&format=svg`;

  const html = `
<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f7ff;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(108,92,231,0.08);">
    <div style="background:linear-gradient(135deg,#7c6ce7,#38b2ac);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">🎉 Zwolniło się miejsce!</h1>
    </div>
    <div style="padding:32px 24px;">
      <p style="font-size:16px;color:#1e1b3a;margin:0 0 16px;">Cześć <strong>${params.firstName}</strong>,</p>
      <p style="font-size:14px;color:#55575d;line-height:1.6;margin:0 0 16px;">
        Świetna wiadomość! Zwolniło się miejsce na wydarzenie <strong>${params.eventTitle}</strong> 
        i Twój status został zmieniony na <strong>potwierdzony</strong>.
      </p>
      <div style="text-align:center;padding:24px;background:#f8f7ff;border-radius:12px;margin:0 0 24px;">
        <img src="${qrUrl}" alt="Kod QR" width="200" height="200" style="display:block;margin:0 auto 12px;" />
        <p style="font-size:11px;color:#7c6ce7;margin:0;">Okaż ten kod przy wejściu</p>
      </div>
      <div style="background:#f0fdf4;border-left:4px solid #38b2ac;padding:12px 16px;border-radius:0 8px 8px 0;">
        <p style="font-size:13px;color:#1e1b3a;margin:0;">Status: <strong style="color:#38b2ac;">✓ Potwierdzony</strong></p>
      </div>
    </div>
    <div style="padding:16px 24px;background:#f8f7ff;text-align:center;">
      <p style="font-size:11px;color:#999;margin:0;">Press Accreditations System</p>
    </div>
  </div>
</body>
</html>`;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Rejestracja <onboarding@resend.dev>",
        to: [params.to],
        subject: `Twoje miejsce potwierdzone — ${params.eventTitle}`,
        html,
      }),
    });
  } catch (e) {
    console.error("Promotion email error:", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = getClientIP(req);
  const rl = checkRateLimit(clientIP, { maxRequests: 15, windowMs: 60_000, keyPrefix: "waitlist" });
  if (!rl.allowed) return createRateLimitResponse(rl, corsHeaders);

  try {
    const { eventId, action, guestIds } = await req.json();

    if (!eventId) return jsonRes({ error: "eventId is required" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // JWT auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonRes({ error: "Unauthorized" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return jsonRes({ error: "Unauthorized" }, 401);

    // Verify ownership
    const { data: event } = await supabase
      .from("events")
      .select("id, title, max_guests, organizer_id")
      .eq("id", eventId)
      .single();

    if (!event || event.organizer_id !== user.id) return jsonRes({ error: "Forbidden" }, 403);

    if (action === "promote-specific" && Array.isArray(guestIds) && guestIds.length > 0) {
      const { data: promoted, error: promoteError } = await supabase
        .from("guests")
        .update({ status: "confirmed" })
        .in("id", guestIds)
        .eq("event_id", eventId)
        .eq("status", "waitlisted")
        .select("id, first_name, last_name, email, qr_code");

      if (promoteError) return jsonRes({ error: promoteError.message }, 500);

      // Send promotion emails
      for (const g of promoted || []) {
        sendPromotionEmail({
          to: g.email,
          firstName: g.first_name,
          eventTitle: event.title,
          qrCode: g.qr_code,
        }).catch(console.error);
      }

      return jsonRes({ promoted: promoted?.length || 0, guests: promoted });
    }

    if (action === "auto-promote") {
      const { count: confirmedCount } = await supabase
        .from("guests")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId)
        .in("status", ["confirmed", "checked-in"]);

      const maxGuests = event.max_guests || Infinity;
      const available = Math.max(0, maxGuests - (confirmedCount || 0));

      if (available === 0) return jsonRes({ promoted: 0, message: "Brak wolnych miejsc" });

      const { data: waitlisted } = await supabase
        .from("guests")
        .select("id")
        .eq("event_id", eventId)
        .eq("status", "waitlisted")
        .order("created_at", { ascending: true })
        .limit(available);

      if (!waitlisted || waitlisted.length === 0) {
        return jsonRes({ promoted: 0, message: "Brak gości na waitliście" });
      }

      const ids = waitlisted.map((g) => g.id);
      const { data: promoted, error: promoteError } = await supabase
        .from("guests")
        .update({ status: "confirmed" })
        .in("id", ids)
        .select("id, first_name, last_name, email, qr_code");

      if (promoteError) return jsonRes({ error: promoteError.message }, 500);

      // Send promotion emails to all promoted guests
      for (const g of promoted || []) {
        sendPromotionEmail({
          to: g.email,
          firstName: g.first_name,
          eventTitle: event.title,
          qrCode: g.qr_code,
        }).catch(console.error);
      }

      // Create notification for organizer
      await supabase.from("user_notifications").insert({
        user_id: user.id,
        title: "Waitlist: automatyczna promocja",
        message: `Przeniesiono ${promoted?.length || 0} gości z listy oczekujących na wydarzenie "${event.title}"`,
        type: "info",
        event_id: eventId,
        action_url: `/guests?event=${eventId}`,
      });

      return jsonRes({
        promoted: promoted?.length || 0,
        guests: promoted,
        message: `Przeniesiono ${promoted?.length || 0} gości z waitlisty`,
      });
    }

    if (action === "remove") {
      const { data: removed } = await supabase
        .from("guests")
        .update({ status: "declined" })
        .in("id", guestIds || [])
        .eq("event_id", eventId)
        .eq("status", "waitlisted")
        .select("id");

      return jsonRes({ removed: removed?.length || 0 });
    }

    return jsonRes({ error: "Invalid action. Use: auto-promote, promote-specific, remove" }, 400);
  } catch (e) {
    console.error("Waitlist error:", e);
    return jsonRes({ error: "Server error" }, 500);
  }
});
