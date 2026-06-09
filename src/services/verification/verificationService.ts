/**
 * Warstwa danych Media Verification Engine.
 *
 * `landing_page_submissions` oraz `submission_verification_events` są w
 * wygenerowanych typach Supabase — używamy typowanego klienta.
 * RLS pilnuje, że organizator widzi tylko swoje zgłoszenia.
 *
 * Zasada produktowa: scoring SUGERUJE — decyzję approve/reject podejmuje człowiek.
 * Każda zmiana (rescore, override, notatka, decyzja) jest logowana w historii
 * (`submission_verification_events`) oraz w globalnym audycie (`audit_logs`).
 */

import { supabase } from "@/integrations/supabase/client";
import { createAuditLog } from "@/services/audit/auditService";
import {
  evaluateSubmission,
  getScoreBand,
  type VerificationFlag,
  type VerificationRiskLevel,
  type VerificationBand,
} from "@/lib/accreditation/verificationScoring";
import {
  buildAccreditationPassInsert,
  computeValidity,
  isPassAlreadyIssued,
  DEFAULT_PRESS_TYPE_NAME,
} from "@/lib/accreditation/passIssuance";
import {
  type ApprovalStatus,
  type AccessLevel,
  statusCreatesPass,
  accessZonesFor,
  accessLevelLabel,
  generateAccreditationToken,
  validateDecision,
  REVOKED_GUEST_STATUS,
} from "@/lib/accreditation/decisionFlow";
import { upsertContactFromActivity } from "@/services/crm/mediaCrmService";
import type { SubmissionData } from "@/lib/accreditation/types";
import type { Json } from "@/integrations/supabase/types";

export type SubmissionDecisionStatus =
  | "pending" | "approved" | "approved_limited" | "rejected" | "waitlisted" | "expired";

/** Wiersz zgłoszenia medialnego z polami weryfikacji. */
export interface MediaSubmission {
  id: string;
  event_id: string;
  landing_page_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  media_organization: string | null;
  media_type: string | null;
  job_title: string | null;
  role: string | null;
  social_media: string | null;
  portfolio_url: string | null;
  publication_links: string | null;
  coverage_description: string | null;
  requested_access: string | null;
  previous_accreditation: boolean;
  accreditation_type: string | null;
  consent_data_processing: boolean;
  consent_marketing: boolean;
  flags: Record<string, unknown> | null;
  custom_fields: Record<string, unknown> | null;
  status: SubmissionDecisionStatus;
  verification_score: number | null;
  verification_risk_level: VerificationRiskLevel | null;
  verification_status: VerificationBand | null;
  verification_flags: VerificationFlag[] | null;
  verification_explanation: string | null;
  verification_overridden_by: string | null;
  verification_overridden_at: string | null;
  verification_notes: string | null;
  /** Wydana przepustka (krok approval → QR pass). */
  guest_id: string | null;
  accreditation_id: string | null;
  pass_qr_code: string | null;
  pass_issued_at: string | null;
  /** Decyzja PR managera. */
  access_level: string | null;
  applicant_message: string | null;
  decision_email_status: "sent" | "failed" | "skipped" | null;
  decision_email_sent_at: string | null;
  decided_at: string | null;
  decided_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface VerificationEvent {
  id: string;
  submission_id: string;
  event_id: string;
  actor_id: string | null;
  actor_email: string | null;
  event_type:
    | "scored" | "rescored" | "override" | "note" | "decision"
    | "pass_issued" | "pass_revoked" | "email_sent";
  from_status: string | null;
  to_status: string | null;
  from_score: number | null;
  to_score: number | null;
  from_risk: string | null;
  to_risk: string | null;
  note: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Actor {
  id: string;
  email: string | null;
}

/** Mapuje wiersz zgłoszenia na wejście scoringu. */
function toSubmissionData(s: MediaSubmission): SubmissionData {
  return {
    first_name: s.first_name,
    last_name: s.last_name,
    email: s.email,
    phone: s.phone ?? undefined,
    media_organization: s.media_organization ?? undefined,
    media_type: s.media_type ?? undefined,
    job_title: s.job_title ?? undefined,
    role: s.role ?? undefined,
    social_media: s.social_media ?? undefined,
    portfolio_url: s.portfolio_url ?? undefined,
    publication_links: s.publication_links ?? undefined,
    coverage_description: s.coverage_description ?? undefined,
    requested_access: s.requested_access ?? undefined,
    previous_accreditation: s.previous_accreditation,
  };
}

function possibleDuplicateOf(s: MediaSubmission): boolean {
  return s.flags?.possible_duplicate === true;
}

export async function fetchSubmissions(eventId: string): Promise<MediaSubmission[]> {
  const { data, error } = await supabase
    .from("landing_page_submissions")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as MediaSubmission[];
}

export async function fetchVerificationEvents(submissionId: string): Promise<VerificationEvent[]> {
  const { data, error } = await supabase
    .from("submission_verification_events")
    .select("*")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as VerificationEvent[];
}

async function logEvent(
  submission: MediaSubmission,
  actor: Actor,
  payload: Partial<VerificationEvent> & Pick<VerificationEvent, "event_type">,
): Promise<void> {
  try {
    await supabase.from("submission_verification_events").insert({
      submission_id: submission.id,
      event_id: submission.event_id,
      actor_id: actor.id,
      actor_email: actor.email,
      ...payload,
      metadata: (payload.metadata ?? null) as Json,
    });
  } catch (err) {
    // Historia jest best-effort — nie blokuje głównej akcji.
    console.error("verification event log failed (non-critical):", err);
  }
}

/** Przelicza scoring zgłoszenia na nowo (przycisk „Przelicz"). */
export async function recalculateSubmission(
  submission: MediaSubmission,
  actor: Actor,
): Promise<void> {
  const result = evaluateSubmission(toSubmissionData(submission), {
    possibleDuplicate: possibleDuplicateOf(submission),
  });

  const { error } = await supabase
    .from("landing_page_submissions")
    .update({
      verification_score: result.score,
      verification_risk_level: result.riskLevel,
      verification_status: result.band,
      verification_flags: result.flags as unknown as Json,
      verification_explanation: result.explanation,
      // Przeliczenie czyści wcześniejsze ręczne nadpisanie wyniku.
      verification_overridden_by: null,
      verification_overridden_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submission.id);
  if (error) throw error;

  await logEvent(submission, actor, {
    event_type: "rescored",
    from_score: submission.verification_score,
    to_score: result.score,
    from_risk: submission.verification_risk_level,
    to_risk: result.riskLevel,
    from_status: submission.verification_status,
    to_status: result.band,
    note: "Ręczne przeliczenie scoringu",
    metadata: { flags: result.flags },
  });
}

/** Ręczne nadpisanie wyniku/ryzyka przez PR managera. */
export async function overrideVerification(
  submission: MediaSubmission,
  override: { score: number; riskLevel: VerificationRiskLevel; notes?: string },
  actor: Actor,
): Promise<void> {
  const band = getScoreBand(override.score);
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("landing_page_submissions")
    .update({
      verification_score: override.score,
      verification_risk_level: override.riskLevel,
      verification_status: band,
      verification_notes: override.notes ?? submission.verification_notes ?? null,
      verification_overridden_by: actor.id,
      verification_overridden_at: now,
      updated_at: now,
    })
    .eq("id", submission.id);
  if (error) throw error;

  await logEvent(submission, actor, {
    event_type: "override",
    from_score: submission.verification_score,
    to_score: override.score,
    from_risk: submission.verification_risk_level,
    to_risk: override.riskLevel,
    from_status: submission.verification_status,
    to_status: band,
    note: override.notes ?? "Ręczne nadpisanie wyniku weryfikacji",
  });

  await createAuditLog({
    action: "verification.override",
    resource: "landing_page_submissions",
    resource_id: submission.id,
    severity: "warning",
    details: `Nadpisano scoring: ${submission.verification_score ?? "—"} → ${override.score}, ryzyko ${override.riskLevel}`,
    metadata: { event_id: submission.event_id, notes: override.notes ?? null },
  }).catch((e) => console.error("audit log failed (non-critical):", e));
}

/** Dodaje notatkę PR managera (bez zmiany wyniku). */
export async function addVerificationNote(
  submission: MediaSubmission,
  note: string,
  actor: Actor,
): Promise<void> {
  const { error } = await supabase
    .from("landing_page_submissions")
    .update({ verification_notes: note, updated_at: new Date().toISOString() })
    .eq("id", submission.id);
  if (error) throw error;

  await logEvent(submission, actor, {
    event_type: "note",
    note,
  });
}

// ─────────────────────────────────────────────────────────────
// Decision flow — decyzja PR managera → akredytacja + QR + e-mail
// ─────────────────────────────────────────────────────────────

export interface DecisionInput {
  status: ApprovalStatus;
  /** Wymagany dla approved / approved_limited. */
  accessLevel?: AccessLevel | null;
  /** Notatka wewnętrzna (niewysyłana do wnioskodawcy). */
  internalNote?: string;
  /** Wiadomość do wnioskodawcy (trafia do e-maila). */
  applicantMessage?: string;
  /** Czy wysłać e-mail z decyzją. */
  sendEmail?: boolean;
}

export type DecisionEmailStatus = "sent" | "failed" | "skipped";

export interface DecisionResult {
  status: ApprovalStatus;
  createdPass: boolean;
  qrCode: string | null;
  guestId: string | null;
  accreditationId: string | null;
  emailStatus: DecisionEmailStatus;
  /** true gdy pass istniał już wcześniej (idempotencja). */
  alreadyIssued: boolean;
}

/**
 * Wydaje akredytację + QR pass dla zatwierdzonego (lub limited) zgłoszenia.
 * Tworzy skanowalny wpis `guests` (token w qr_code) + best-effort `accreditations`.
 * Idempotentne: gdy pass już wydany, zwraca istniejący.
 */
async function issueAccreditation(
  submission: MediaSubmission,
  accessLevel: AccessLevel,
  actor: Actor,
): Promise<{ qrCode: string; guestId: string; accreditationId: string | null; alreadyIssued: boolean }> {
  if (isPassAlreadyIssued(submission)) {
    return {
      qrCode: submission.pass_qr_code ?? "",
      guestId: submission.guest_id ?? "",
      accreditationId: submission.accreditation_id,
      alreadyIssued: true,
    };
  }

  const token = generateAccreditationToken();
  const zones = accessZonesFor(accessLevel);

  // 1) Skanowalny wpis gościa — źródło prawdy check-inu (krytyczny).
  const { data: guest, error: guestError } = await supabase
    .from("guests")
    .insert({
      event_id: submission.event_id,
      first_name: (submission.first_name ?? "").trim(),
      last_name: (submission.last_name ?? "").trim(),
      email: (submission.email ?? "").trim(),
      phone: submission.phone?.trim() || null,
      company: submission.media_organization?.trim() || null,
      ticket_type: "press",
      access_level: accessLevel,
      zones,
      status: "confirmed",
      // qr_code (numeryczny) nadaje trigger DB; `token` to pass_token linku (niżej).
    } as never)
    .select("id")
    .single();
  if (guestError) throw guestError;
  const guestId = (guest as { id: string }).id;

  // 2) Formalny rekord akredytacji — best-effort.
  let accreditationId: string | null = null;
  try {
    if (actor.id) {
      let eventStart: string | null = null;
      let eventEnd: string | null = null;
      try {
        const { data: ev } = await supabase
          .from("events").select("start_date, end_date").eq("id", submission.event_id).maybeSingle();
        eventStart = ev?.start_date ?? null;
        eventEnd = ev?.end_date ?? null;
      } catch { /* fallback w computeValidity */ }
      const { validity_start, validity_end } = computeValidity(eventStart, eventEnd);
      const requestId = await resolveRequestId(submission.event_id, submission.email);
      const { data, error } = await supabase
        .from("accreditations")
        .insert(buildAccreditationPassInsert({
          eventId: submission.event_id,
          userId: actor.id,
          guestId,
          requestId,
          type: DEFAULT_PRESS_TYPE_NAME,
          issuedAt: validity_start,
          expiresAt: validity_end,
        }))
        .select("id").single();
      if (error) throw error;
      accreditationId = (data as { id: string }).id;
    }
  } catch (err) {
    console.error("accreditation record insert failed (non-critical):", err);
  }

  const issuedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("landing_page_submissions")
    .update({
      guest_id: guestId, accreditation_id: accreditationId,
      pass_qr_code: token, pass_issued_at: issuedAt, updated_at: issuedAt,
    })
    .eq("id", submission.id);
  if (updateError) throw updateError;

  await logEvent(submission, actor, {
    event_type: "pass_issued",
    note: `Wydano QR pass (${accessLevelLabel(accessLevel)})`,
    metadata: { qr_code: token, guest_id: guestId, accreditation_id: accreditationId, access_level: accessLevel },
  });

  return { qrCode: token, guestId, accreditationId, alreadyIssued: false };
}

/**
 * Wysyła e-mail z decyzją przez edge function `send-decision-email` (best-effort).
 * Zwraca status; e-mail NIGDY nie blokuje zapisanej decyzji.
 */
async function sendDecisionEmail(
  submission: MediaSubmission,
  status: ApprovalStatus,
  accessLevel: AccessLevel | null,
  applicantMessage: string | undefined,
  qrToken: string | null,
): Promise<DecisionEmailStatus> {
  try {
    const { data, error } = await supabase.functions.invoke("send-decision-email", {
      body: {
        submission_id: submission.id,
        event_id: submission.event_id,
        status,
        access_level: accessLevel,
        applicant_message: applicantMessage ?? null,
        qr_token: qrToken,
      },
    });
    if (error) throw error;
    if (!data?.success) {
      console.error("decision email NOT sent:", data);
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("decision email failed (non-critical):", err);
    return "failed";
  }
}

/**
 * Decyzja PR managera (NIGDY automatyczna). Transaction-like:
 *  1) update status zgłoszenia,
 *  2) create accreditation + QR (dla approved / approved_limited),
 *  3) send e-mail (best-effort),
 *  4) write audit log.
 * E-mail może się nie udać — decyzja i tak jest zapisana (UI oferuje resend).
 */
export async function decideSubmission(
  submission: MediaSubmission,
  input: DecisionInput,
  actor: Actor,
): Promise<DecisionResult> {
  const validation = validateDecision({ status: input.status, accessLevel: input.accessLevel });
  if (!validation.ok) throw new Error(validation.error);

  const createsPass = statusCreatesPass(input.status);
  const now = new Date().toISOString();

  // 1) Update statusu + metadanych decyzji
  const { error: updErr } = await supabase
    .from("landing_page_submissions")
    .update({
      status: input.status,
      access_level: createsPass ? input.accessLevel : null,
      applicant_message: input.applicantMessage ?? null,
      verification_notes: input.internalNote ?? submission.verification_notes ?? null,
      decided_at: now,
      decided_by: actor.id || null,
      updated_at: now,
    })
    .eq("id", submission.id);
  if (updErr) throw updErr;

  // 2) Akredytacja + QR (tylko approved / approved_limited)
  let pass = { qrCode: null as string | null, guestId: null as string | null, accreditationId: null as string | null, alreadyIssued: false };
  if (createsPass && input.accessLevel) {
    const issued = await issueAccreditation({ ...submission, status: input.status }, input.accessLevel, actor);
    pass = { qrCode: issued.qrCode, guestId: issued.guestId, accreditationId: issued.accreditationId, alreadyIssued: issued.alreadyIssued };
  }

  // 2b) Media CRM: zatwierdzony aplikant → twórz/aktualizuj media contact (best-effort)
  if (createsPass && actor.id) {
    try {
      await upsertContactFromActivity({
        organizerId: actor.id,
        email: submission.email,
        firstName: submission.first_name,
        lastName: submission.last_name,
        phone: submission.phone,
        role: submission.role,
        outletName: submission.media_organization,
        outletWebsite: submission.portfolio_url,
        mediaType: submission.media_type,
        bump: { approved_count: 1 },
      });
    } catch (e) {
      console.error("media contact upsert failed (non-critical):", e);
    }
  }

  // 3) E-mail z decyzją (best-effort)
  let emailStatus: DecisionEmailStatus = "skipped";
  if (input.sendEmail) {
    emailStatus = await sendDecisionEmail(submission, input.status, input.accessLevel ?? null, input.applicantMessage, pass.qrCode);
    await supabase
      .from("landing_page_submissions")
      .update({
        decision_email_status: emailStatus,
        decision_email_sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", submission.id);
    await logEvent(submission, actor, {
      event_type: "email_sent",
      note: emailStatus === "sent" ? "Wysłano e-mail z decyzją" : "Próba wysyłki e-maila z decyzją nieudana",
      metadata: { status: input.status, email_status: emailStatus },
    });
  }

  // 4) Historia + audyt
  await logEvent(submission, actor, {
    event_type: "decision",
    from_status: submission.status,
    to_status: input.status,
    note: input.internalNote ?? null,
    metadata: {
      verification_score: submission.verification_score,
      access_level: input.accessLevel ?? null,
      created_pass: createsPass,
    },
  });

  await createAuditLog({
    action: `accreditation.${input.status}`,
    resource: "landing_page_submissions",
    resource_id: submission.id,
    severity: "info",
    details:
      `Decyzja: ${submission.first_name} ${submission.last_name} → ${input.status}` +
      (createsPass && input.accessLevel ? ` (${accessLevelLabel(input.accessLevel)})` : "") +
      (input.sendEmail ? ` · e-mail: ${emailStatus}` : ""),
    metadata: {
      event_id: submission.event_id,
      access_level: input.accessLevel ?? null,
      email_status: input.sendEmail ? emailStatus : "skipped",
    },
  }).catch((e) => console.error("audit log failed (non-critical):", e));

  return {
    status: input.status,
    createdPass: createsPass,
    qrCode: pass.qrCode,
    guestId: pass.guestId,
    accreditationId: pass.accreditationId,
    emailStatus,
    alreadyIssued: pass.alreadyIssued,
  };
}

/** Zatwierdza zgłoszenie z pełnym dostępem (tworzy QR). */
export function approveSubmission(
  submission: MediaSubmission,
  opts: { accessLevel: AccessLevel; internalNote?: string; applicantMessage?: string; sendEmail?: boolean },
  actor: Actor,
): Promise<DecisionResult> {
  return decideSubmission(submission, { status: "approved", ...opts }, actor);
}

/** Zatwierdza zgłoszenie z dostępem ograniczonym (tworzy QR z ograniczonym access level). */
export function approveLimitedSubmission(
  submission: MediaSubmission,
  opts: { accessLevel: AccessLevel; internalNote?: string; applicantMessage?: string; sendEmail?: boolean },
  actor: Actor,
): Promise<DecisionResult> {
  return decideSubmission(submission, { status: "approved_limited", ...opts }, actor);
}

/** Odrzuca zgłoszenie (NIE tworzy QR). */
export function rejectSubmission(
  submission: MediaSubmission,
  opts: { internalNote?: string; applicantMessage?: string; sendEmail?: boolean },
  actor: Actor,
): Promise<DecisionResult> {
  return decideSubmission(submission, { status: "rejected", ...opts }, actor);
}

/** Umieszcza zgłoszenie na liście rezerwowej (NIE tworzy QR). */
export function waitlistSubmission(
  submission: MediaSubmission,
  opts: { internalNote?: string; applicantMessage?: string; sendEmail?: boolean },
  actor: Actor,
): Promise<DecisionResult> {
  return decideSubmission(submission, { status: "waitlisted", ...opts }, actor);
}

/**
 * Cofa akredytację: oznacza gościa jako `revoked` (blokada check-inu online+offline)
 * oraz `accreditations.revoked = true`. Powód trafia do audytu i historii.
 */
export async function revokeAccreditation(
  submission: MediaSubmission,
  reason: string,
  actor: Actor,
): Promise<void> {
  if (!submission.guest_id) throw new Error("Brak wydanej akredytacji do cofnięcia.");
  const now = new Date().toISOString();

  // Guest: status revoked → check-in zablokowany (RPC + tryb offline)
  const { error: guestErr } = await supabase
    .from("guests")
    .update({ status: REVOKED_GUEST_STATUS, revoked_at: now, revocation_reason: reason, updated_at: now } as never)
    .eq("id", submission.guest_id);
  if (guestErr) throw guestErr;

  // Accreditation: status=revoked + powód w metadata (best-effort)
  if (submission.accreditation_id) {
    try {
      await supabase
        .from("accreditations")
        .update({ status: "revoked", metadata: { revocation_reason: reason }, updated_at: now })
        .eq("id", submission.accreditation_id);
    } catch (err) {
      console.error("accreditation revoke flag failed (non-critical):", err);
    }
  }

  await logEvent(submission, actor, {
    event_type: "pass_revoked",
    note: reason,
    metadata: { guest_id: submission.guest_id, accreditation_id: submission.accreditation_id },
  });

  await createAuditLog({
    action: "accreditation.revoked",
    resource: "guests",
    resource_id: submission.guest_id,
    severity: "warning",
    details: `Cofnięto akredytację: ${submission.first_name} ${submission.last_name} — ${reason}`,
    metadata: { event_id: submission.event_id, submission_id: submission.id, accreditation_id: submission.accreditation_id },
  }).catch((e) => console.error("audit log failed (non-critical):", e));
}

/** Ponownie wysyła e-mail z decyzją dla bieżącego statusu/access level. */
export async function resendDecisionEmail(submission: MediaSubmission, actor: Actor): Promise<DecisionEmailStatus> {
  if (submission.status === "pending" || submission.status === "expired") {
    throw new Error("Brak decyzji do ponownego wysłania.");
  }
  const accessLevel = (submission.access_level as AccessLevel | null) ?? null;
  const emailStatus = await sendDecisionEmail(
    submission,
    submission.status as ApprovalStatus,
    accessLevel,
    submission.applicant_message ?? undefined,
    submission.pass_qr_code,
  );

  await supabase
    .from("landing_page_submissions")
    .update({
      decision_email_status: emailStatus,
      decision_email_sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submission.id);

  await logEvent(submission, actor, {
    event_type: "email_sent",
    note: emailStatus === "sent" ? "Ponownie wysłano e-mail z decyzją" : "Ponowna wysyłka e-maila nieudana",
    metadata: { status: submission.status, email_status: emailStatus, resend: true },
  });

  return emailStatus;
}

// ─────────────────────────────────────────────────────────────
// Helpery akredytacji (powiązanie wniosku)
// ─────────────────────────────────────────────────────────────

/** Łączy przepustkę z lustrzanym wnioskiem w `accreditation_requests` (best-effort). */
async function resolveRequestId(eventId: string, email: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("accreditation_requests")
      .select("id")
      .eq("event_id", eventId)
      .ilike("email", email)
      .order("created_at", { ascending: false })
      .limit(1);
    return data && data.length > 0 ? data[0].id : null;
  } catch {
    return null;
  }
}
