// PressOps — coverage-submit (Tydzień 6).
//
// Publiczny endpoint dla dziennikarza: dodanie publikacji przez SECURE TOKEN
// (link bez logowania). Token niezgadywalny (CVG-…). Walidacja: token istnieje,
// nie wygasł, status pozwala na submit. Service role (RLS blokuje anon).
//
// GET  ?token=…  → kontekst formularza (event/medium) lub 404/410
// POST { token, ...coverage } → zapis coverage_item + status coverage_submitted

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { buildCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders();
const TOKEN_RE = /^CVG-[0-9ABCDEFGHJKMNPQRSTVWXYZ]{16,}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  const d = new Date(expiresAt);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

const cleanUrl = (v: unknown): string | null => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  return /^https?:\/\//i.test(s) ? s.slice(0, 2000) : null;
};
const cleanInt = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const service = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  try {
    let token = "";
    let body: Record<string, unknown> = {};
    if (req.method === "GET") {
      token = new URL(req.url).searchParams.get("token") ?? "";
    } else if (req.method === "POST") {
      body = await req.json().catch(() => ({}));
      token = String(body.token ?? "");
    } else {
      return json({ error: "Method not allowed" }, 405);
    }

    if (!TOKEN_RE.test(token)) return json({ error: "invalid_token" }, 404);

    const { data: reqRow } = await service.from("coverage_requests")
      .select("id, event_id, status, token_expires_at, media_name, first_name, last_name, contact_id")
      .eq("token", token).maybeSingle();

    if (!reqRow) return json({ error: "invalid_token" }, 404);
    if (isExpired(reqRow.token_expires_at)) return json({ error: "expired_token" }, 410);

    const { data: ev } = await service.from("events").select("title, end_date").eq("id", reqRow.event_id).maybeSingle();

    if (req.method === "GET") {
      return json({
        ok: true,
        event: { title: ev?.title ?? null },
        applicant: { firstName: reqRow.first_name, lastName: reqRow.last_name, mediaName: reqRow.media_name },
        status: reqRow.status,
        alreadySubmitted: reqRow.status === "coverage_submitted" || reqRow.status === "coverage_verified",
      });
    }

    // POST — zapis publikacji
    const articleUrl = cleanUrl(body.article_url);
    const galleryUrl = cleanUrl(body.gallery_url);
    const videoUrl = cleanUrl(body.video_url);
    const socialUrl = cleanUrl(body.social_post_url);
    if (!articleUrl && !galleryUrl && !videoUrl && !socialUrl) {
      return json({ error: "no_links", message: "Podaj przynajmniej jeden link do publikacji." }, 400);
    }

    const { error: insErr } = await service.from("coverage_items").insert({
      coverage_request_id: reqRow.id,
      event_id: reqRow.event_id,
      article_url: articleUrl,
      gallery_url: galleryUrl,
      video_url: videoUrl,
      social_post_url: socialUrl,
      publication_date: typeof body.publication_date === "string" && body.publication_date ? body.publication_date : null,
      estimated_reach: cleanInt(body.estimated_reach),
      sponsor_mentions: cleanInt(body.sponsor_mentions),
      publication_type: typeof body.publication_type === "string" ? String(body.publication_type).slice(0, 80) : null,
      notes: typeof body.notes === "string" ? String(body.notes).slice(0, 2000) : null,
      submitted_by: `${reqRow.first_name ?? ""} ${reqRow.last_name ?? ""}`.trim() || null,
    });
    if (insErr) {
      console.error("coverage_item insert failed:", insErr);
      return json({ error: "insert_failed" }, 500);
    }

    // Status → coverage_submitted (jeśli pending/missing)
    if (reqRow.status === "coverage_pending" || reqRow.status === "coverage_missing") {
      await service.from("coverage_requests")
        .update({ status: "coverage_submitted", updated_at: new Date().toISOString() })
        .eq("id", reqRow.id);
    }

    return json({ ok: true, status: "coverage_submitted" });
  } catch (err) {
    console.error("coverage-submit error:", err);
    return json({ error: "unexpected" }, 500);
  }
});
