/**
 * Warstwa danych Media CRM.
 *
 * Tabele (media_contacts, media_outlets, media_contact_outlets, coverage_*) są
 * w wygenerowanych typach Supabase — używamy typowanego klienta.
 * RLS pilnuje, że organizator widzi tylko swoje rekordy.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { createAuditLog } from "@/services/audit/auditService";
import {
  normalizeEmail, outletDedupKey, normalizeOutletName, normalizeDomain,
  noShowRate, coverageRate, showRate,
  type ContactStats,
} from "@/lib/crm/mediaCrm";

export interface MediaOutlet {
  id: string;
  organizer_id: string;
  name: string;
  normalized_name: string;
  domain: string | null;
  media_type: string | null;
  website_url: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MediaContact {
  id: string;
  organizer_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string | null;
  primary_outlet_id: string | null;
  tags: string[];
  quality_rating: number | null;
  pr_notes: string | null;
  events_count: number;
  submissions_count: number;
  approved_count: number;
  checked_in_count: number;
  coverage_count: number;
  no_show_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ContactRates {
  noShowRate: number;
  showRate: number;
  coverageRate: number;
}

export function contactRates(c: Pick<MediaContact, "approved_count" | "checked_in_count" | "coverage_count">): ContactRates {
  const stats: ContactStats = {
    approved: c.approved_count,
    checkedIn: c.checked_in_count,
    coverageSubmitted: c.coverage_count,
  };
  return { noShowRate: noShowRate(stats), showRate: showRate(stats), coverageRate: coverageRate(stats) };
}

// ─────────────────────────────────────────────────────────────
// Outlets
// ─────────────────────────────────────────────────────────────

/**
 * Znajduje lub tworzy medium z deduplikacją (domena lub znormalizowana nazwa).
 * Zwraca id. Idempotentne dla tej samej nazwy/domeny w obrębie organizatora.
 */
export async function upsertOutlet(
  organizerId: string,
  input: { name: string; domain?: string | null; website?: string | null; mediaType?: string | null },
): Promise<string | null> {
  const name = (input.name ?? "").trim();
  if (!name) return null;
  const { normalizedName, domain } = outletDedupKey(input);

  // 1) szukaj po domenie
  if (domain) {
    const { data } = await supabase.from("media_outlets")
      .select("id").eq("organizer_id", organizerId).eq("domain", domain).limit(1);
    if (data && data.length > 0) return data[0].id;
  }
  // 2) szukaj po znormalizowanej nazwie
  const { data: byName } = await supabase.from("media_outlets")
    .select("id").eq("organizer_id", organizerId).eq("normalized_name", normalizedName).limit(1);
  if (byName && byName.length > 0) return byName[0].id;

  // 3) utwórz
  const { data: created, error } = await supabase.from("media_outlets")
    .insert({
      organizer_id: organizerId,
      name,
      normalized_name: normalizedName,
      domain,
      media_type: input.mediaType ?? null,
      website_url: input.website ?? null,
    })
    .select("id").single();
  if (error) throw error;
  return created.id;
}

export async function fetchOutlets(): Promise<MediaOutlet[]> {
  const { data, error } = await supabase.from("media_outlets").select("*").order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MediaOutlet[];
}

export async function fetchOutlet(id: string): Promise<MediaOutlet | null> {
  const { data } = await supabase.from("media_outlets").select("*").eq("id", id).maybeSingle();
  return (data as MediaOutlet) ?? null;
}

// ─────────────────────────────────────────────────────────────
// Contacts
// ─────────────────────────────────────────────────────────────

export async function fetchContacts(): Promise<MediaContact[]> {
  const { data, error } = await supabase.from("media_contacts").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as MediaContact[];
}

export async function fetchContact(id: string): Promise<MediaContact | null> {
  const { data } = await supabase.from("media_contacts").select("*").eq("id", id).maybeSingle();
  return (data as MediaContact) ?? null;
}

/**
 * Upsert kontaktu z deduplikacją po e-mailu (per organizer). Tworzy/aktualizuje
 * medium i wiąże je z kontaktem. Inkrementuje liczniki wg `bump`.
 * Wywoływane po approve / check-in. Zwraca id kontaktu (lub null, gdy brak e-maila).
 */
export async function upsertContactFromActivity(params: {
  organizerId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role?: string | null;
  outletName?: string | null;
  outletWebsite?: string | null;
  mediaType?: string | null;
  bump?: Partial<Pick<MediaContact,
    "events_count" | "submissions_count" | "approved_count" | "checked_in_count" | "coverage_count" | "no_show_count">>;
}): Promise<string | null> {
  const email = normalizeEmail(params.email);
  if (!email) return null;

  // Outlet (best-effort — brak nie blokuje kontaktu)
  let outletId: string | null = null;
  if (params.outletName?.trim()) {
    try {
      outletId = await upsertOutlet(params.organizerId, {
        name: params.outletName, website: params.outletWebsite ?? null, mediaType: params.mediaType ?? null,
      });
    } catch (e) { console.error("outlet upsert failed (non-critical):", e); }
  }

  const { data: existing } = await supabase.from("media_contacts")
    .select("*").eq("organizer_id", params.organizerId).ilike("email", email).limit(1);

  if (existing && existing.length > 0) {
    const c = existing[0] as MediaContact;
    const patch: Database["public"]["Tables"]["media_contacts"]["Update"] = {
      updated_at: new Date().toISOString(),
    };
    // wypełnij brakujące pola, nie nadpisuj istniejących
    if (!c.first_name && params.firstName) patch.first_name = params.firstName;
    if (!c.last_name && params.lastName) patch.last_name = params.lastName;
    if (!c.phone && params.phone) patch.phone = params.phone;
    if (!c.role && params.role) patch.role = params.role;
    if (!c.primary_outlet_id && outletId) patch.primary_outlet_id = outletId;
    for (const [k, v] of Object.entries(params.bump ?? {})) {
      const key = k as keyof NonNullable<typeof params.bump>;
      patch[key] = (c[key] ?? 0) + (v ?? 0);
    }
    const { error } = await supabase.from("media_contacts").update(patch).eq("id", c.id);
    if (error) throw error;
    if (outletId) await linkContactOutlet(c.id, outletId);
    return c.id;
  }

  const bump = params.bump ?? {};
  const { data: created, error } = await supabase.from("media_contacts")
    .insert({
      organizer_id: params.organizerId,
      email,
      first_name: params.firstName ?? null,
      last_name: params.lastName ?? null,
      phone: params.phone ?? null,
      role: params.role ?? null,
      primary_outlet_id: outletId,
      events_count: bump.events_count ?? 0,
      submissions_count: bump.submissions_count ?? 0,
      approved_count: bump.approved_count ?? 0,
      checked_in_count: bump.checked_in_count ?? 0,
      coverage_count: bump.coverage_count ?? 0,
      no_show_count: bump.no_show_count ?? 0,
    })
    .select("id").single();
  if (error) throw error;
  if (outletId) await linkContactOutlet(created.id, outletId);
  return created.id;
}

async function linkContactOutlet(contactId: string, outletId: string): Promise<void> {
  try {
    await supabase.from("media_contact_outlets").upsert(
      { contact_id: contactId, outlet_id: outletId },
      { onConflict: "contact_id,outlet_id", ignoreDuplicates: true },
    );
  } catch (e) { console.error("link contact-outlet failed (non-critical):", e); }
}

export async function updateContactCrm(
  id: string,
  patch: { tags?: string[]; quality_rating?: number | null; pr_notes?: string | null; primary_outlet_id?: string | null },
): Promise<void> {
  const { error } = await supabase.from("media_contacts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// ─────────────────────────────────────────────────────────────
// Historia kontaktu (events / submissions / check-ins / coverage)
// ─────────────────────────────────────────────────────────────

export interface ContactHistory {
  submissions: Array<{ id: string; event_id: string; status: string; created_at: string | null; access_level: string | null }>;
  coverage: Array<{ id: string; event_id: string; status: string; created_at: string | null }>;
}

export async function fetchContactHistory(contact: MediaContact): Promise<ContactHistory> {
  const email = normalizeEmail(contact.email);
  const [{ data: subs }, { data: cov }] = await Promise.all([
    supabase.from("landing_page_submissions")
      .select("id, event_id, status, created_at, access_level, guest_id, pass_issued_at")
      .ilike("email", email).order("created_at", { ascending: false }),
    supabase.from("coverage_requests")
      .select("id, event_id, status, created_at").eq("contact_id", contact.id)
      .order("created_at", { ascending: false }),
  ]);
  return {
    submissions: (subs ?? []) as ContactHistory["submissions"],
    coverage: (cov ?? []) as ContactHistory["coverage"],
  };
}

// ─────────────────────────────────────────────────────────────
// GDPR — eksport / anonimizacja danych kontaktu (admin action)
// ─────────────────────────────────────────────────────────────

export interface ContactDataExport {
  contact: MediaContact;
  history: ContactHistory;
  exportedAt: string;
}

/** Zbiera wszystkie dane kontaktu (RODO data export request). */
export async function exportContactData(contactId: string): Promise<ContactDataExport | null> {
  const contact = await fetchContact(contactId);
  if (!contact) return null;
  const history = await fetchContactHistory(contact);

  await createAuditLog({
    action: "gdpr.contact_export",
    resource: "media_contacts",
    resource_id: contactId,
    severity: "warning",
    details: `Eksport danych kontaktu: ${contact.email}`,
    metadata: { email: contact.email },
  }).catch(() => {});

  return { contact, history, exportedAt: new Date().toISOString() };
}

/**
 * Anonimizuje kontakt (RODO delete/anonymize request): usuwa dane osobowe,
 * zachowuje zagregowane liczniki (do statystyk). Nie kasuje wiersza, by nie
 * rozspójnić powiązań — zastępuje PII placeholderami.
 */
export async function anonymizeContact(contactId: string): Promise<void> {
  const contact = await fetchContact(contactId);
  if (!contact) throw new Error("Kontakt nie istnieje.");

  const anonEmail = `anon+${contactId.slice(0, 8)}@anonymized.local`;
  const { error } = await supabase.from("media_contacts").update({
    email: anonEmail,
    first_name: "[usunięto]",
    last_name: "[usunięto]",
    phone: null,
    pr_notes: null,
    tags: [],
    updated_at: new Date().toISOString(),
  }).eq("id", contactId);
  if (error) throw error;

  await createAuditLog({
    action: "gdpr.contact_anonymize",
    resource: "media_contacts",
    resource_id: contactId,
    severity: "warning",
    details: `Anonimizacja danych kontaktu (RODO): ${contact.email} → ${anonEmail}`,
    metadata: { previous_email: contact.email },
  }).catch(() => {});
}

export { normalizeOutletName, normalizeDomain };
