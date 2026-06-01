/**
 * Warstwa danych Coverage collection.
 *
 * coverage_requests (per check-in, secure token) + coverage_items (publikacje).
 * `(supabase as any)` — tabele poza wygenerowanymi typami. RLS = organizer/admin.
 * Publiczny submit przez token idzie przez edge function `coverage-submit`.
 */
import { supabase } from "@/integrations/supabase/client";
import { createAuditLog } from "@/services/audit/auditService";
import {
  generateCoverageToken, type CoverageStatus, canTransitionCoverage,
} from "@/lib/crm/mediaCrm";
import { upsertContactFromActivity } from "./mediaCrmService";

const sb = () => supabase as any;

export interface CoverageRequest {
  id: string;
  event_id: string;
  organizer_id: string;
  contact_id: string | null;
  submission_id: string | null;
  guest_id: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  media_name: string | null;
  status: CoverageStatus;
  token: string;
  token_expires_at: string | null;
  reminders_sent: string[];
  last_reminder_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CoverageItem {
  id: string;
  coverage_request_id: string;
  event_id: string;
  article_url: string | null;
  gallery_url: string | null;
  video_url: string | null;
  social_post_url: string | null;
  publication_date: string | null;
  estimated_reach: number | null;
  sponsor_mentions: number | null;
  publication_type: string | null;
  notes: string | null;
  submitted_by: string | null;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string | null;
}

interface Actor { id: string; email: string | null; }

// ─────────────────────────────────────────────────────────────
// Tworzenie coverage requests dla check-in mediów po evencie
// ─────────────────────────────────────────────────────────────

/**
 * Dla wszystkich CHECKED-IN mediów danego eventu tworzy coverage_request
 * (status coverage_pending) z secure tokenem — o ile jeszcze nie istnieje.
 * Idempotentne (dedup po guest_id). Zwraca liczbę utworzonych.
 */
export async function generateCoverageRequestsForEvent(eventId: string, actor: Actor): Promise<number> {
  // Pobierz organizatora eventu
  const { data: ev } = await sb().from("events").select("organizer_id, end_date").eq("id", eventId).maybeSingle();
  const organizerId = ev?.organizer_id ?? actor.id;

  // Goście (akredytacje) checked-in dla eventu
  const { data: guests } = await sb().from("guests")
    .select("id, first_name, last_name, email, company, access_level, checked_in_at, status")
    .eq("event_id", eventId)
    .not("checked_in_at", "is", null);

  if (!guests || guests.length === 0) return 0;

  // Istniejące requesty (dedup po guest_id)
  const { data: existing } = await sb().from("coverage_requests")
    .select("guest_id").eq("event_id", eventId);
  const existingGuestIds = new Set((existing ?? []).map((r: { guest_id: string | null }) => r.guest_id).filter(Boolean));

  let created = 0;
  for (const g of guests as Array<Record<string, any>>) {
    if (g.status === "revoked") continue;
    if (existingGuestIds.has(g.id)) continue;

    const contactId = await upsertContactFromActivity({
      organizerId,
      email: g.email,
      firstName: g.first_name,
      lastName: g.last_name,
      outletName: g.company ?? null,
      bump: { coverage_count: 0 },
    }).catch(() => null);

    const { error } = await sb().from("coverage_requests").insert({
      event_id: eventId,
      organizer_id: organizerId,
      contact_id: contactId,
      guest_id: g.id,
      email: g.email,
      first_name: g.first_name,
      last_name: g.last_name,
      media_name: g.company ?? null,
      status: "coverage_pending",
      token: generateCoverageToken(),
    });
    if (!error) created++;
  }

  if (created > 0) {
    await createAuditLog({
      action: "coverage.requests_generated",
      resource: "coverage_requests",
      severity: "info",
      details: `Utworzono ${created} próśb o coverage dla wydarzenia`,
      metadata: { event_id: eventId, created },
    }).catch(() => {});
  }
  return created;
}

// ─────────────────────────────────────────────────────────────
// Board (lista + filtry)
// ─────────────────────────────────────────────────────────────

export interface CoverageBoardRow extends CoverageRequest {
  items_count: number;
}

export async function fetchCoverageBoard(filters: {
  eventId?: string; status?: CoverageStatus | "all"; mediaType?: string;
} = {}): Promise<CoverageBoardRow[]> {
  let q = sb().from("coverage_requests").select("*").order("created_at", { ascending: false });
  if (filters.eventId) q = q.eq("event_id", filters.eventId);
  if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as CoverageRequest[];

  // Doliczenie items (best-effort)
  const ids = rows.map((r) => r.id);
  const counts = new Map<string, number>();
  if (ids.length > 0) {
    const { data: items } = await sb().from("coverage_items").select("coverage_request_id").in("coverage_request_id", ids);
    for (const it of (items ?? []) as Array<{ coverage_request_id: string }>) {
      counts.set(it.coverage_request_id, (counts.get(it.coverage_request_id) ?? 0) + 1);
    }
  }
  return rows.map((r) => ({ ...r, items_count: counts.get(r.id) ?? 0 }));
}

export async function fetchCoverageItems(requestId: string): Promise<CoverageItem[]> {
  const { data, error } = await sb().from("coverage_items")
    .select("*").eq("coverage_request_id", requestId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CoverageItem[];
}

// ─────────────────────────────────────────────────────────────
// Status transitions (PR manager)
// ─────────────────────────────────────────────────────────────

async function setStatus(req: CoverageRequest, to: CoverageStatus, actor: Actor, note?: string): Promise<void> {
  if (!canTransitionCoverage(req.status, to)) {
    throw new Error(`Niedozwolone przejście: ${req.status} → ${to}`);
  }
  const { error } = await sb().from("coverage_requests")
    .update({ status: to, updated_at: new Date().toISOString() }).eq("id", req.id);
  if (error) throw error;

  await createAuditLog({
    action: `coverage.${to}`,
    resource: "coverage_requests",
    resource_id: req.id,
    severity: "info",
    details: `Coverage ${req.first_name ?? ""} ${req.last_name ?? ""} → ${to}${note ? ` (${note})` : ""}`,
    metadata: { event_id: req.event_id, contact_id: req.contact_id },
  }).catch(() => {});
}

/** Oznacza coverage jako zweryfikowane + inkrementuje coverage_count kontaktu. */
export async function verifyCoverage(req: CoverageRequest, actor: Actor): Promise<void> {
  await setStatus(req, "coverage_verified", actor);
  // verified_at/by na najnowszym item
  const { data: items } = await sb().from("coverage_items")
    .select("id").eq("coverage_request_id", req.id).order("created_at", { ascending: false }).limit(1);
  if (items && items.length > 0) {
    await sb().from("coverage_items")
      .update({ verified_by: actor.id || null, verified_at: new Date().toISOString() })
      .eq("id", items[0].id);
  }
  if (req.contact_id) {
    const { data: c } = await sb().from("media_contacts").select("coverage_count").eq("id", req.contact_id).maybeSingle();
    if (c) {
      await sb().from("media_contacts")
        .update({ coverage_count: (c.coverage_count ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq("id", req.contact_id);
    }
  }
}

export async function markCoverageMissing(req: CoverageRequest, actor: Actor): Promise<void> {
  await setStatus(req, "coverage_missing", actor);
}

export async function reopenCoverage(req: CoverageRequest, actor: Actor): Promise<void> {
  await setStatus(req, "coverage_pending", actor);
}

// ─────────────────────────────────────────────────────────────
// Reminders (przez edge function — best-effort)
// ─────────────────────────────────────────────────────────────

/** Wysyła reminder dla pojedynczej prośby (manualnie z boardu). */
export async function sendCoverageReminder(requestId: string): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke("coverage-reminders", {
      body: { mode: "manual", request_ids: [requestId] },
    });
    return !error;
  } catch (e) {
    console.error("coverage reminder failed (non-critical):", e);
    return false;
  }
}

/** Bulk reminder dla wielu próśb. Zwraca liczbę zaakceptowanych przez backend. */
export async function sendBulkCoverageReminders(requestIds: string[]): Promise<boolean> {
  if (requestIds.length === 0) return false;
  try {
    const { error } = await supabase.functions.invoke("coverage-reminders", {
      body: { mode: "manual", request_ids: requestIds },
    });
    return !error;
  } catch (e) {
    console.error("bulk coverage reminders failed (non-critical):", e);
    return false;
  }
}
