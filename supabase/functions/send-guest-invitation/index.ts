// PressOps — send-guest-invitation.
//
// Wysyła zaproszenie z QR pass do zaznaczonych GOŚCI z listy (nie ze zgłoszenia
// medialnego). Wywoływane przez panel gości (BulkEmailSender). Model 1:1 jak
// send-decision-email: RAW fetch do Resend, auth getClaims + organizator/admin,
// _shared/cors.ts, FROM = EMAIL_FROM ?? sandbox.
//
// Link /pass/<pass_token> rozwiązuje publiczny RPC get_pass_by_token (gałąź gościa).
// Token pass_token jest wysokoentropijny (PA- + Crockford Base32, 160 bit) — zgodny
// z isValidAccreditationToken w PassView. Generujemy go TYLKO gdy gość go nie ma.
//
// Wynik jest UCZCIWY per gość: { guest_id, email, ok, status_code?, detail? }
// + podsumowanie { sent, failed }. Brak zmyślonych statystyk dostarczalności.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders();

// ── Token pass (zgodny z src/lib/accreditation/decisionFlow.ts) ────────────────
// Crockford Base32 (bez I, L, O, U) + prefiks PA + 20 bajtów (160 bit) entropii.
const BASE32_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TOKEN_PREFIX = "PA";
const TOKEN_RANDOM_BYTES = 20;

function encodeBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out;
}

function generatePassToken(): string {
  const bytes = new Uint8Array(TOKEN_RANDOM_BYTES);
  crypto.getRandomValues(bytes);
  return `${TOKEN_PREFIX}-${encodeBase32(bytes)}`;
}

interface SendInvitationBody {
  event_id: string;
  guest_ids: string[];
  subject?: string | null;
  custom_message?: string | null;
  // template_id na razie ignorowany (D3 — backlog known-limitation: jeden wbudowany szablon).
  template_id?: string | null;
}

interface GuestRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  qr_code: string | null;
  pass_token: string | null;
  status: string | null;
}

interface GuestResult {
  guest_id: string;
  email: string | null;
  ok: boolean;
  status_code?: number;
  detail?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const FROM = Deno.env.get("EMAIL_FROM") ?? "Akredytacje <onboarding@resend.dev>";

function buildInvitationHtml(params: {
  eventName: string;
  guestName: string;
  passCode: string | null;
  passUrl: string | null;
  customMessage: string | null;
}): string {
  const { eventName, guestName, passCode, passUrl, customMessage } = params;

  const passBlock = passUrl
    ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${passUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          Otwórz swój QR pass
        </a>
        ${passCode ? `<p style="font-size:12px;color:#6b7280;margin-top:8px;">Pokaż kod QR przy wejściu (check-in). Kod: <code>${esc(passCode)}</code></p>` : ""}
      </div>`
    : "";

  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color:#111827;">
      <h2 style="margin-top:0;">Zaproszenie na ${esc(eventName)} 🎟️</h2>
      <p>Cześć ${esc(guestName)},</p>
      <p>Zapraszamy Cię na <strong>${esc(eventName)}</strong>. Poniżej znajdziesz swój personalny QR pass.</p>
      ${passBlock}
      <p><strong>Instrukcje na miejscu:</strong></p>
      <ul style="font-size:14px;color:#374151;">
        <li>Miej przy sobie QR pass (w telefonie lub wydrukowany).</li>
        <li>Zgłoś się do punktu wejścia / akredytacji.</li>
        <li>Pass jest personalny — nie udostępniaj go innym osobom.</li>
      </ul>
      ${customMessage ? `<div style="background:#f3f4f6;border-radius:8px;padding:12px;font-size:14px;margin-top:16px;"><strong>Wiadomość od organizatora:</strong><br/>${esc(customMessage)}</div>` : ""}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#6b7280;font-size:12px;">Wiadomość wygenerowana automatycznie przez system akredytacji PressOps.</p>
    </div>`;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized - missing token" }, 401);
    }

    const authedClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authedClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: "Unauthorized - invalid token" }, 401);
    }
    const userId = claimsData.claims.sub as string;

    const body = (await req.json()) as SendInvitationBody;
    if (!body?.event_id || !Array.isArray(body.guest_ids) || body.guest_ids.length === 0) {
      return json({ error: "Missing event_id or guest_ids" }, 400);
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Autoryzacja: organizator wydarzenia lub admin (jak w decyzyjnej).
    const { data: event } = await service
      .from("events")
      .select("organizer_id, title")
      .eq("id", body.event_id)
      .single();
    if (!event) return json({ error: "Event not found" }, 404);

    const { data: adminRole } = await service
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    const isAuthorized = event.organizer_id === userId || !!adminRole;
    if (!isAuthorized) {
      return json({ error: "Forbidden - not event organizer or admin" }, 403);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY missing — skipping guest invitation send");
      return json({ success: false, error: "missing_resend_key", sent: 0, failed: 0, results: [] });
    }

    const appUrl = Deno.env.get("PUBLIC_APP_URL") || "";
    const eventName = event.title ?? "wydarzenie";
    const subject = body.subject?.trim() || `Zaproszenie — ${eventName}`;
    const customMessage = body.custom_message?.trim() || null;

    // Goście NALEŻĄCY do wydarzenia (service role omija RLS), ograniczeni do żądanych id.
    const { data: guests, error: guestsError } = await service
      .from("guests")
      .select("id, email, first_name, last_name, qr_code, pass_token, status")
      .eq("event_id", body.event_id)
      .in("id", body.guest_ids);
    if (guestsError) {
      return json({ error: `Guests query failed: ${guestsError.message}` }, 500);
    }

    const byId = new Map<string, GuestRow>((guests as GuestRow[] ?? []).map((g) => [g.id, g]));
    const results: GuestResult[] = [];

    for (const guestId of body.guest_ids) {
      const guest = byId.get(guestId);
      if (!guest) {
        results.push({ guest_id: guestId, email: null, ok: false, detail: "Gość nie należy do wydarzenia lub nie istnieje" });
        continue;
      }
      if (!guest.email) {
        results.push({ guest_id: guestId, email: null, ok: false, detail: "Brak adresu e-mail gościa" });
        continue;
      }

      try {
        // pass_token: reużyj istniejący, wygeneruj tylko gdy null.
        let passToken = guest.pass_token;
        if (!passToken) {
          passToken = await ensurePassToken(service, guest.id);
        }

        const passUrl = appUrl && passToken
          ? `${appUrl.replace(/\/$/, "")}/pass/${encodeURIComponent(passToken)}`
          : null;
        const guestName = `${guest.first_name ?? ""} ${guest.last_name ?? ""}`.trim() || "Gościu";

        const html = buildInvitationHtml({
          eventName,
          guestName,
          passCode: guest.qr_code,
          passUrl,
          customMessage,
        });

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: FROM, to: [guest.email], subject, html }),
        });

        if (!res.ok) {
          const detail = await res.text();
          console.error("Resend invitation failed:", guest.email, res.status, detail);
          results.push({ guest_id: guestId, email: guest.email, ok: false, status_code: res.status, detail });
          continue;
        }

        await service
          .from("guests")
          .update({ invitation_sent_at: new Date().toISOString(), email_status: "sent" })
          .eq("id", guestId);

        results.push({ guest_id: guestId, email: guest.email, ok: true });
      } catch (err) {
        console.error("guest invitation error:", guestId, err);
        results.push({ guest_id: guestId, email: guest.email, ok: false, detail: String(err) });
      }
    }

    const sent = results.filter((r) => r.ok).length;
    const failed = results.length - sent;
    return json({ success: failed === 0, sent, failed, results });
  } catch (err) {
    console.error("send-guest-invitation error:", err);
    return json({ error: String(err) }, 500);
  }
});

// Nadaje pass_token gościowi, jeśli go nie ma. Reużycie istniejącego realizuje caller.
// Update z gwardią `pass_token is null` (nie nadpisuje równoległego zapisu); kolizja
// UNIQUE (23505) → ponów z nowym tokenem; 0 zaktualizowanych wierszy → odczytaj istniejący.
async function ensurePassToken(
  service: ReturnType<typeof createClient>,
  guestId: string,
): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = generatePassToken();
    const { data, error } = await service
      .from("guests")
      .update({ pass_token: candidate })
      .eq("id", guestId)
      .is("pass_token", null)
      .select("pass_token")
      .maybeSingle();

    if (!error && data?.pass_token) {
      return data.pass_token as string;
    }
    if (error && (error as { code?: string }).code !== "23505") {
      throw error;
    }
    if (!error && !data) {
      // 0 wierszy — token nadano równolegle; odczytaj istniejący.
      const { data: existing } = await service
        .from("guests")
        .select("pass_token")
        .eq("id", guestId)
        .single();
      if (existing?.pass_token) return existing.pass_token as string;
    }
    // (error 23505) — kolizja tokenu, ponów z nowym.
  }
  throw new Error("Nie udało się nadać pass_token gościowi");
}
