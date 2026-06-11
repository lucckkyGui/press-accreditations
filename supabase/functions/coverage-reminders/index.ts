// PressOps — coverage-reminders (Tydzień 6).
//
// Wysyła e-mail przypominający o dostarczeniu coverage. Dwa tryby:
//   - mode=manual: { request_ids: [...] } — z boardu (organizer/admin, auth),
//   - mode=cron:   bez auth usera; przechodzi przez wszystkie coverage_pending
//     i wysyła należny etap (24h / 72h / 7d po evencie). Idempotentne per etap.
//
// E-mail best-effort. Wysłane etapy zapisywane w coverage_requests.reminders_sent.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders();
const FROM = Deno.env.get("EMAIL_FROM") ?? "Akredytacje <onboarding@resend.dev>";

type Stage = "24h" | "72h" | "7d";
const OFFSET_HOURS: Record<Stage, number> = { "24h": 24, "72h": 72, "7d": 168 };
const STAGES: Stage[] = ["24h", "72h", "7d"];

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json", ...corsHeaders } });

function dueStage(eventEnd: string | null, sent: string[], now: Date): Stage | null {
  if (!eventEnd) return null;
  const end = new Date(eventEnd);
  if (Number.isNaN(end.getTime())) return null;
  const hours = (now.getTime() - end.getTime()) / 3_600_000;
  if (hours < 0) return null;
  let due: Stage | null = null;
  for (const s of STAGES) if (hours >= OFFSET_HOURS[s] && !sent.includes(s)) due = s;
  return due;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildEmail(p: { firstName: string; eventName: string; link: string; stage: Stage }): { subject: string; html: string } {
  const urgency = p.stage === "7d" ? "ostatnie przypomnienie" : "przypomnienie";
  return {
    subject: `Coverage — ${urgency} — ${p.eventName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827;">
        <h2 style="margin-top:0;">Dziękujemy za relację z ${esc(p.eventName)}</h2>
        <p>Cześć ${esc(p.firstName) || "Dziennikarzu"},</p>
        <p>Prosimy o dostarczenie linków do Twojej publikacji (artykuł, galeria, wideo, social).</p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${p.link}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">
            Dodaj publikację
          </a>
        </div>
        <p style="font-size:12px;color:#6b7280;">Link jest personalny — nie udostępniaj go.</p>
      </div>`,
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const service = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const appUrl = (Deno.env.get("PUBLIC_APP_URL") || "").replace(/\/$/, "");
  const now = new Date();

  try {
    const body = await req.json().catch(() => ({}));
    const mode = body.mode === "cron" ? "cron" : "manual";

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const authed = createClient(
      Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims } = await authed.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims) return json({ error: "Unauthorized" }, 401);

    // Tryb cron = pełny przegląd bazy → wyłącznie service role (pg_cron / wywołanie serwerowe).
    if (mode === "cron" && claims.claims.role !== "service_role") {
      return json({ error: "Forbidden - cron mode requires service role" }, 403);
    }

    // Zbierz prośby do przetworzenia
    let requests: Array<Record<string, any>> = [];
    if (mode === "manual") {
      // Manual bez jawnych id = dawniej cicha wysyłka do całej bazy — teraz twardy błąd.
      if (!Array.isArray(body.request_ids) || body.request_ids.length === 0) {
        return json({ error: "request_ids required in manual mode" }, 400);
      }
      const { data } = await service.from("coverage_requests")
        .select("*").in("id", body.request_ids.slice(0, 500));
      requests = data ?? [];

      // Własność: wszystkie eventy żądanych próśb muszą należeć do wołającego (albo admin).
      const userId = claims.claims.sub as string;
      const { data: adminRole } = await service
        .from("user_roles").select("role")
        .eq("user_id", userId).eq("role", "admin").maybeSingle();
      if (!adminRole) {
        const eventIds = [...new Set(requests.map((r) => r.event_id).filter(Boolean))];
        const { data: evs } = await service
          .from("events").select("id, organizer_id").in("id", eventIds);
        const owned = new Set((evs ?? []).filter((e) => e.organizer_id === userId).map((e) => e.id));
        if (requests.some((r) => !owned.has(r.event_id))) {
          return json({ error: "Forbidden - not organizer of requested events" }, 403);
        }
      }
    } else {
      const { data } = await service.from("coverage_requests")
        .select("*").in("status", ["coverage_pending", "coverage_missing"]).limit(1000);
      requests = data ?? [];
    }

    if (!resendKey) {
      // Bez klucza nic nie wysyłamy i NICZEGO nie oznaczamy jako wysłane.
      return json({ ok: false, error: "missing_resend_key", processed: requests.length, sent: 0, failed: 0, skipped: requests.length });
    }

    let sent = 0, failed = 0, skipped = 0;
    for (const r of requests) {
      const { data: ev } = await service.from("events").select("title, end_date").eq("id", r.event_id).maybeSingle();
      const sentStages: string[] = Array.isArray(r.reminders_sent) ? r.reminders_sent : [];
      const stage: Stage | null = mode === "cron"
        ? dueStage(ev?.end_date ?? null, sentStages, now)
        : (STAGES.find((s) => !sentStages.includes(s)) ?? "7d");
      if (!stage) { skipped++; continue; }
      if (!r.email) { skipped++; continue; }

      const link = appUrl ? `${appUrl}/coverage/${encodeURIComponent(r.token)}` : "";
      const email = buildEmail({ firstName: r.first_name ?? "", eventName: ev?.title ?? "wydarzenie", link, stage });
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM, to: [r.email], subject: email.subject, html: email.html }),
      });
      if (!res.ok) {
        console.error("reminder send failed", await res.text());
        failed++;
        continue;
      }

      // Etap oznaczamy WYŁĄCZNIE po realnie wysłanym mailu.
      await service.from("coverage_requests").update({
        reminders_sent: [...sentStages, stage],
        last_reminder_at: now.toISOString(),
        updated_at: now.toISOString(),
      }).eq("id", r.id);
      sent++;
    }

    return json({ ok: true, processed: requests.length, sent, failed, skipped });
  } catch (err) {
    console.error("coverage-reminders error:", err);
    return json({ error: "unexpected" }, 500);
  }
});
