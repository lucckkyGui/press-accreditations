// PressOps — send-decision-email (Tydzień 4).
//
// Wysyła e-mail z decyzją akredytacyjną do wnioskodawcy. Wywoływane przez panel
// po decyzji PR managera (approved / approved_limited / rejected / waitlisted).
//
// Bezpieczeństwo: tylko organizator wydarzenia lub admin. Body zawiera tylko
// submission_id + kontekst decyzji; pełne dane i e-mail czytamy service rolem.
// E-mail jest best-effort — błąd zwraca 200 z email_status='failed' (panel oferuje
// resend), żeby nie wywracać zapisanej już decyzji.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders();

type ApprovalStatus = "approved" | "approved_limited" | "rejected" | "waitlisted";

const ACCESS_LABEL: Record<string, string> = {
  press: "Prasa",
  photo: "Foto",
  video: "Wideo / TV",
  radio: "Radio",
  podcast: "Podcast",
  influencer: "Influencer / Twórca",
  photo_pit: "Photo pit (pod sceną)",
  interview: "Strefa wywiadów",
  backstage_limited: "Backstage (ograniczony)",
  sponsor_media: "Media sponsora",
};

interface DecisionEmailBody {
  submission_id: string;
  event_id: string;
  status: ApprovalStatus;
  access_level?: string | null;
  applicant_message?: string | null;
  qr_token?: string | null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const FROM = "Akredytacje <noreply@notify.bookingartistagency.com>";

interface EmailContent {
  subject: string;
  html: string;
}

function buildEmail(params: {
  status: ApprovalStatus;
  eventName: string;
  applicantName: string;
  accessLabel: string | null;
  applicantMessage: string | null;
  // passToken = link bearer (/pass); passCode = numeryczny kod skanu pokazywany gościowi.
  passCode: string | null;
  passUrl: string | null;
}): EmailContent {
  const { status, eventName, applicantName, accessLabel, applicantMessage, passCode, passUrl } = params;
  const wrap = (inner: string) => `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color:#111827;">
      ${inner}
      ${applicantMessage ? `<div style="background:#f3f4f6;border-radius:8px;padding:12px;font-size:14px;margin-top:16px;"><strong>Wiadomość od organizatora:</strong><br/>${esc(applicantMessage)}</div>` : ""}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
      <p style="color:#6b7280;font-size:12px;">Wiadomość wygenerowana automatycznie przez system akredytacji PressOps.</p>
    </div>`;

  const passBlock = passUrl
    ? `
      <div style="text-align:center;margin:24px 0;">
        <a href="${passUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
          Otwórz swój QR pass
        </a>
        ${passCode ? `<p style="font-size:12px;color:#6b7280;margin-top:8px;">Pokaż kod QR przy wejściu (check-in). Kod: <code>${esc(passCode)}</code></p>` : ""}
      </div>`
    : "";

  switch (status) {
    case "approved":
      return {
        subject: `Akredytacja zatwierdzona — ${eventName}`,
        html: wrap(`
          <h2 style="margin-top:0;">Akredytacja zatwierdzona ✅</h2>
          <p>Cześć ${esc(applicantName)},</p>
          <p>Twoja akredytacja na <strong>${esc(eventName)}</strong> została <strong>zatwierdzona</strong>.</p>
          ${accessLabel ? `<p>Poziom dostępu: <strong>${esc(accessLabel)}</strong>.</p>` : ""}
          ${passBlock}
          <p><strong>Instrukcje na miejscu:</strong></p>
          <ul style="font-size:14px;color:#374151;">
            <li>Miej przy sobie QR pass (w telefonie lub wydrukowany).</li>
            <li>Zgłoś się do strefy prasowej / punktu akredytacji.</li>
            <li>Pass jest personalny — nie udostępniaj go innym osobom.</li>
          </ul>`),
      };
    case "approved_limited":
      return {
        subject: `Akredytacja zatwierdzona (dostęp ograniczony) — ${eventName}`,
        html: wrap(`
          <h2 style="margin-top:0;">Akredytacja zatwierdzona — dostęp ograniczony</h2>
          <p>Cześć ${esc(applicantName)},</p>
          <p>Twoja akredytacja na <strong>${esc(eventName)}</strong> została zatwierdzona z <strong>ograniczonym poziomem dostępu</strong>.</p>
          ${accessLabel ? `<p>Przyznany dostęp: <strong>${esc(accessLabel)}</strong>. Prosimy o przestrzeganie zasad dla tej strefy.</p>` : ""}
          ${passBlock}
          <p><strong>Instrukcje na miejscu:</strong></p>
          <ul style="font-size:14px;color:#374151;">
            <li>Miej przy sobie QR pass (w telefonie lub wydrukowany).</li>
            <li>Twój dostęp obejmuje wyłącznie wskazane wyżej strefy.</li>
            <li>Pass jest personalny — nie udostępniaj go innym osobom.</li>
          </ul>`),
      };
    case "waitlisted":
      return {
        subject: `Akredytacja — lista rezerwowa — ${eventName}`,
        html: wrap(`
          <h2 style="margin-top:0;">Lista rezerwowa</h2>
          <p>Cześć ${esc(applicantName)},</p>
          <p>Dziękujemy za zgłoszenie na <strong>${esc(eventName)}</strong>. Z uwagi na ograniczoną liczbę miejsc Twoje zgłoszenie zostało umieszczone na <strong>liście rezerwowej</strong>.</p>
          <p>Skontaktujemy się z Tobą, jeśli zwolni się miejsce. Nie musisz nic robić.</p>`),
      };
    case "rejected":
    default:
      return {
        subject: `Akredytacja — decyzja — ${eventName}`,
        html: wrap(`
          <h2 style="margin-top:0;">Decyzja w sprawie akredytacji</h2>
          <p>Cześć ${esc(applicantName)},</p>
          <p>Dziękujemy za zainteresowanie wydarzeniem <strong>${esc(eventName)}</strong> i za przesłane zgłoszenie akredytacyjne.</p>
          <p>Po rozpatrzeniu zgłoszeń nie jesteśmy w stanie przyznać akredytacji na to wydarzenie. Decyzja nie jest oceną Twojej pracy — liczba miejsc dla mediów jest ograniczona.</p>
          <p>Mamy nadzieję na współpracę przy kolejnych wydarzeniach.</p>`),
      };
  }
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

    const body = (await req.json()) as DecisionEmailBody;
    if (!body?.submission_id || !body?.event_id || !body?.status) {
      return json({ error: "Missing submission_id, event_id or status" }, 400);
    }

    const service = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Autoryzacja: organizator wydarzenia lub admin
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

    // Dane zgłoszenia (service role — RLS blokuje anon)
    const { data: submission } = await service
      .from("landing_page_submissions")
      .select("first_name, last_name, email, access_level, pass_qr_code, guest_id")
      .eq("id", body.submission_id)
      .single();
    if (!submission) return json({ error: "Submission not found" }, 404);

    const applicantName = `${submission.first_name ?? ""} ${submission.last_name ?? ""}`.trim() || "Uczestniku";
    const accessLevel = body.access_level ?? submission.access_level ?? null;
    const accessLabel = accessLevel ? (ACCESS_LABEL[accessLevel] ?? accessLevel) : null;

    // passToken = niezgadywalny token linku /pass (NIE jest skanowany).
    const passToken = body.qr_token ?? submission.pass_qr_code ?? null;
    const appUrl = Deno.env.get("PUBLIC_APP_URL") || "";
    const passUrl = passToken && appUrl ? `${appUrl.replace(/\/$/, "")}/pass/${encodeURIComponent(passToken)}` : null;

    // passCode = numeryczny kod skanu (guests.qr_code) — pokazywany gościowi w mailu.
    let passCode: string | null = null;
    if (submission.guest_id) {
      const { data: guestRow } = await service
        .from("guests")
        .select("qr_code")
        .eq("id", submission.guest_id)
        .single();
      passCode = guestRow?.qr_code ?? null;
    }

    const email = buildEmail({
      status: body.status,
      eventName: event.title ?? "wydarzenie",
      applicantName,
      accessLabel,
      applicantMessage: body.applicant_message ?? null,
      passCode,
      passUrl,
    });

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY missing — skipping decision email send");
      return json({ success: false, email_status: "failed", reason: "missing_resend_key" });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [submission.email],
        subject: email.subject,
        html: email.html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Resend send failed:", res.status, detail);
      return json({ success: false, email_status: "failed", status_code: res.status });
    }

    return json({ success: true, email_status: "sent" });
  } catch (err) {
    console.error("send-decision-email error:", err);
    // Best-effort: nie wywracamy decyzji — panel pokaże warning + resend.
    return json({ success: false, email_status: "failed", error: String(err) });
  }
});
