import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { checkRateLimit, getClientIP, createRateLimitResponse } from "../_shared/rateLimiter.ts";
import { buildCorsHeaders } from "../_shared/cors.ts";

const corsHeaders = buildCorsHeaders();

const RATE_LIMIT = { maxRequests: 5, windowMs: 60_000, keyPrefix: "landing-register" };

const FAKE_ID = "00000000-0000-0000-0000-000000000000";

// ── Validation constants (zsynchronizowane z src/lib/accreditation) ──
const MEDIA_ROLE_VALUES = [
  "journalist", "photographer", "video", "radio", "podcast", "influencer", "other",
];

const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail.com", "temp-mail.org", "throwaway.email", "guerrillamail.com",
  "guerrillamailblock.com", "sharklasers.com", "grr.la", "mailinator.com",
  "yopmail.com", "10minutemail.com", "10minutemail.net", "trashmail.com",
  "fakeinbox.com", "getnada.com", "dispostable.com", "maildrop.cc",
  "mailnesia.com", "mintemail.com", "tempinbox.com", "spam4.me",
  "moakt.com", "emailondeck.com",
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Simple input sanitizer — strip HTML tags
const sanitize = (val: unknown): string => {
  if (typeof val !== "string") return "";
  return val.replace(/<[^>]*>/g, "").trim();
};

const isValidUrl = (v: string): boolean => {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const splitLinks = (v: string): string[] =>
  v.split(/[\n,;\s]+/).map((s) => s.trim()).filter(Boolean);

const areValidUrlList = (v: string): boolean => {
  const links = splitLinks(v);
  return links.length > 0 && links.every(isValidUrl);
};

const makeRef = (id: string): string =>
  "ACR-" + id.replace(/-/g, "").slice(0, 8).toUpperCase();

// ── Verification scoring (mirror src/lib/accreditation/verificationScoring.ts) ──
// UWAGA: utrzymywać w synchronizacji z frontendem. Backend = źródło prawdy.
// System SUGERUJE i FLAGUJE — NIGDY nie podejmuje automatycznej decyzji.
const FREE_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "outlook.com", "hotmail.com", "hotmail.co.uk", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "gmx.com", "gmx.net",
  "proton.me", "protonmail.com", "zoho.com", "yandex.com", "mail.com",
  "wp.pl", "o2.pl", "onet.pl", "onet.eu", "op.pl", "interia.pl", "interia.eu",
  "poczta.onet.pl", "poczta.fm", "gazeta.pl", "tlen.pl", "vp.pl", "go2.pl", "buziaczek.pl",
];

const COVERAGE_MIN_LENGTH = 40;
const REVIEW_THRESHOLD = 60;
const COMPLETENESS_RATIO = 0.75;

type RiskLevel = "low" | "medium" | "high";
type Band = "strong" | "acceptable" | "needs_review" | "weak";
interface VerificationFlag { code: string; severity: "high" | "medium" | "low"; message: string; }
interface VerificationOutput {
  score: number;
  risk_level: RiskLevel;
  status: Band;
  flags: VerificationFlag[];
  explanation: string;
}

const clampScore = (n: number): number => Math.max(0, Math.min(100, n));

const emailDomainOf = (email: string): string | null => {
  const d = (email || "").toLowerCase().split("@")[1];
  return d || null;
};
const isFreeEmail = (email: string): boolean => {
  const d = emailDomainOf(email);
  return d ? FREE_EMAIL_DOMAINS.includes(d) : false;
};
const isBusinessEmail = (email: string): boolean => {
  if (!email || !EMAIL_REGEX.test(email)) return false;
  const d = emailDomainOf(email);
  if (!d || DISPOSABLE_EMAIL_DOMAINS.includes(d)) return false;
  return !FREE_EMAIL_DOMAINS.includes(d);
};
const countValidLinks = (v: string): number => splitLinks(v || "").filter(isValidUrl).length;

interface ScoreInput {
  email: string; role: string; media_organization: string; portfolio_url: string;
  publication_links: string; social_media: string; coverage_description: string;
  requested_access: string; phone: string; first_name: string; last_name: string;
  previous_accreditation: boolean;
}

const hasRoleEvidence = (s: ScoreInput): boolean => {
  const links = countValidLinks(s.publication_links);
  const portfolio = isValidUrl(s.portfolio_url);
  const social = !!s.social_media;
  const coverageOk = (s.coverage_description || "").length >= COVERAGE_MIN_LENGTH;
  switch (s.role) {
    case "journalist": return links >= 1;
    case "photographer": return portfolio || links >= 1;
    case "video": return coverageOk || portfolio || links >= 1;
    case "influencer": return social;
    case "radio":
    case "podcast": return coverageOk || links >= 1 || social;
    default: return portfolio || links >= 1 || social || coverageOk;
  }
};

const computeVerification = (s: ScoreInput, possibleDuplicate: boolean): VerificationOutput => {
  const contributions: { label: string; points: number }[] = [];
  const flags: VerificationFlag[] = [];

  const links = countValidLinks(s.publication_links);
  const portfolio = isValidUrl(s.portfolio_url);
  const social = !!s.social_media;
  const org = !!s.media_organization;
  const coverageLen = (s.coverage_description || "").length;
  const coverageOk = coverageLen >= COVERAGE_MIN_LENGTH;
  const disposable = DISPOSABLE_EMAIL_DOMAINS.includes(emailDomainOf(s.email) || "");
  const free = isFreeEmail(s.email);
  const business = isBusinessEmail(s.email);
  const evidence = hasRoleEvidence(s);

  const completenessFields = [
    s.first_name, s.last_name, s.email, s.phone, s.role,
    s.media_organization, s.coverage_description, s.requested_access,
  ];
  const filled = completenessFields.filter((v) => !!(v && String(v).trim())).length;
  const completeness = filled / completenessFields.length;

  // Atuty
  if (business) contributions.push({ label: "E-mail w domenie służbowej / medialnej", points: 15 });
  if (org) contributions.push({ label: "Podana redakcja / medium", points: 10 });
  if (links >= 1) contributions.push({ label: "Linki do publikacji", points: 15 });
  if (links >= 3) contributions.push({ label: "Bogate portfolio publikacji (3+ linki)", points: 15 });
  if (portfolio) {
    contributions.push(
      s.role === "photographer" || s.role === "video"
        ? { label: "Portfolio (kluczowe dla foto / wideo)", points: 15 }
        : { label: "Portfolio / strona autora", points: 10 },
    );
  }
  if (social) {
    contributions.push(
      s.role === "influencer"
        ? { label: "Profile social media (influencer)", points: 10 }
        : { label: "Profile social media", points: 5 },
    );
  }
  if (coverageOk) contributions.push({ label: "Opisana planowana relacja", points: 10 });
  if (s.previous_accreditation === true) contributions.push({ label: "Wcześniejsza akredytacja", points: 5 });
  if (completeness >= COMPLETENESS_RATIO) contributions.push({ label: "Kompletnie wypełniony formularz", points: 10 });

  // Ryzyka + flagi
  if (disposable) {
    contributions.push({ label: "Adres e-mail tymczasowy / jednorazowy", points: -50 });
    flags.push({ code: "disposable_email", severity: "high", message: "Adres e-mail tymczasowy / jednorazowy — wysokie ryzyko." });
  }
  if (s.role === "journalist" && !org) {
    contributions.push({ label: "Dziennikarz bez podanej redakcji", points: -25 });
    flags.push({ code: "journalist_no_organization", severity: "high", message: "Dziennikarz bez podanej redakcji / medium." });
  }
  if (!evidence) {
    const map: Record<string, { code: string; points: number; message: string }> = {
      journalist: { code: "no_publication_links", points: -20, message: "Brak linków do publikacji." },
      photographer: { code: "photographer_no_portfolio", points: -25, message: "Fotoreporter bez portfolio i bez linków do publikacji." },
      video: { code: "no_coverage_evidence", points: -20, message: "Brak opisu relacji wideo i materiałów." },
      influencer: { code: "influencer_no_social", points: -20, message: "Influencer bez podanych profili social media." },
    };
    const e = map[s.role] || { code: "no_media_evidence", points: -15, message: "Brak materiałów potwierdzających działalność medialną." };
    contributions.push({ label: e.message, points: e.points });
    flags.push({ code: e.code, severity: "high", message: e.message });
  }
  if (free && !evidence) {
    contributions.push({ label: "Darmowy e-mail bez potwierdzenia publikacji", points: -20 });
    flags.push({ code: "free_email_no_evidence", severity: "medium", message: "Darmowy adres e-mail bez linków do publikacji — zweryfikuj wiarygodność." });
  } else if (free) {
    flags.push({ code: "free_email", severity: "low", message: "Darmowy adres e-mail (zweryfikuj powiązanie z redakcją)." });
  }
  if (possibleDuplicate) {
    contributions.push({ label: "Możliwy duplikat zgłoszenia", points: -10 });
    flags.push({ code: "possible_duplicate", severity: "medium", message: "Możliwy duplikat — podobne zgłoszenie już istnieje." });
  }
  if (coverageLen > 0 && !coverageOk) {
    flags.push({ code: "sparse_coverage", severity: "low", message: "Pobieżny opis planowanej relacji." });
  }

  const score = clampScore(contributions.reduce((sum, c) => sum + c.points, 0));
  const status: Band = score >= 80 ? "strong" : score >= 60 ? "acceptable" : score >= 40 ? "needs_review" : "weak";

  let risk_level: RiskLevel;
  if (flags.some((f) => f.severity === "high")) risk_level = "high";
  else if (score < 40) risk_level = "high";
  else if (flags.some((f) => f.severity === "medium")) risk_level = "medium";
  else if (score < REVIEW_THRESHOLD) risk_level = "medium";
  else risk_level = "low";

  const bandLabel: Record<Band, string> = {
    strong: "silne zgłoszenie", acceptable: "akceptowalne", needs_review: "do weryfikacji", weak: "słabe / wymaga uwagi",
  };
  const positives = contributions.filter((c) => c.points > 0);
  const negatives = contributions.filter((c) => c.points < 0);
  const parts = [`Wynik ${score}/100 (${bandLabel[status]}).`];
  if (positives.length) parts.push("Atuty: " + positives.map((c) => `${c.label} (+${c.points})`).join(", ") + ".");
  if (negatives.length) parts.push("Ryzyka: " + negatives.map((c) => `${c.label} (${c.points})`).join(", ") + ".");
  if (!positives.length && !negatives.length) parts.push("Brak wyraźnych sygnałów — zgłoszenie minimalne.");
  const highFlags = flags.filter((f) => f.severity === "high");
  if (highFlags.length) parts.push("Wymaga uwagi: " + highFlags.map((f) => f.message).join(" "));
  parts.push("Decyzję podejmuje weryfikator — system jedynie sugeruje.");

  return { score, risk_level, status, flags, explanation: parts.join(" ") };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const rl = checkRateLimit(getClientIP(req), RATE_LIMIT);
  if (!rl.allowed) return createRateLimitResponse(rl, corsHeaders);

  const json = (payload: Record<string, unknown>, status: number) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const fieldError = (error: string, field: string, status = 400) =>
    json({ error, field }, status);

  try {
    const body = await req.json();

    // ── Anti-spam: honeypot ──────────────────────────────────────
    if (body._website || body._hp_field) {
      // Silently accept to not tip off the bot
      return json({ success: true, id: FAKE_ID, reference: makeRef(FAKE_ID) }, 201);
    }

    // ── Anti-spam: timing (< 3s = bot) ───────────────────────────
    if (body._form_loaded_at) {
      const elapsed = Date.now() - Number(body._form_loaded_at);
      if (elapsed < 3000) {
        return json({ success: true, id: FAKE_ID, reference: makeRef(FAKE_ID) }, 201);
      }
    }

    // ── Extract + sanitize ───────────────────────────────────────
    const slug = sanitize(body.slug);
    const first_name = sanitize(body.first_name);
    const last_name = sanitize(body.last_name);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);
    const media_organization = sanitize(body.media_organization);
    const media_type = sanitize(body.media_type);
    const job_title = sanitize(body.job_title);
    const role = sanitize(body.role);
    const social_media = sanitize(body.social_media);
    const portfolio_url = sanitize(body.portfolio_url);
    const publication_links = sanitize(body.publication_links);
    const coverage_description = sanitize(body.coverage_description);
    const requested_access = sanitize(body.requested_access);
    const previous_accreditation = body.previous_accreditation === true;
    const consent_data_processing = body.consent_data_processing === true;
    const consent_marketing = body.consent_marketing === true;
    const accreditation_type = sanitize(body.accreditation_type);
    const custom_fields =
      typeof body.custom_fields === "object" && body.custom_fields !== null
        ? body.custom_fields
        : {};

    // ── Base required ────────────────────────────────────────────
    if (!slug) return fieldError("Brak identyfikatora strony", "slug");
    if (!first_name) return fieldError("Imię jest wymagane", "first_name");
    if (!last_name) return fieldError("Nazwisko jest wymagane", "last_name");
    if (!email) return fieldError("Adres e-mail jest wymagany", "email");

    // Email format
    if (!EMAIL_REGEX.test(email) || email.length > 255) {
      return fieldError("Nieprawidłowy format adresu e-mail", "email");
    }

    // Disposable email
    const emailDomain = email.split("@")[1];
    if (DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain)) {
      return fieldError("Użyj służbowego adresu e-mail (adresy tymczasowe są niedozwolone)", "email");
    }

    // Role
    if (!role) return fieldError("Wybierz typ relacji / rolę", "role");
    if (!MEDIA_ROLE_VALUES.includes(role)) {
      return fieldError("Nieprawidłowy typ relacji", "role");
    }

    // Consent (required)
    if (!consent_data_processing) {
      return fieldError("Zgoda na przetwarzanie danych jest wymagana", "consent_data_processing");
    }

    // Field lengths
    if (first_name.length > 100 || last_name.length > 100) {
      return fieldError("Przekroczono maksymalną długość pola", "first_name");
    }

    // URL formats (if provided)
    if (portfolio_url && !isValidUrl(portfolio_url)) {
      return fieldError("Nieprawidłowy adres URL portfolio", "portfolio_url");
    }
    if (publication_links && !areValidUrlList(publication_links)) {
      return fieldError("Podaj prawidłowe adresy URL (każdy w nowej linii)", "publication_links");
    }

    // ── Type-dependent validation ────────────────────────────────
    if (role === "photographer") {
      if (!portfolio_url && !publication_links) {
        return fieldError("Fotoreporter: podaj portfolio lub linki do publikacji", "portfolio_url");
      }
    } else if (role === "video") {
      if (!coverage_description) {
        return fieldError("Opisz planowaną relację wideo", "coverage_description");
      }
    } else if (role === "influencer") {
      if (!social_media) {
        return fieldError("Podaj profile w social media", "social_media");
      }
    } else if (role === "journalist") {
      if (!media_organization) {
        return fieldError("Podaj redakcję / medium", "media_organization");
      }
      if (!publication_links) {
        return fieldError("Podaj linki do publikacji", "publication_links");
      }
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // ── Find landing page ────────────────────────────────────────
    const { data: landingPage, error: lpError } = await supabaseAdmin
      .from("event_landing_pages")
      .select("id, event_id, is_active, form_config")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (lpError || !landingPage) {
      return json(
        { error: "Strona rejestracji nie została znaleziona lub jest nieaktywna" },
        404,
      );
    }

    // ── Duplicate email per event (HARD) — must NOT create record ─
    const { data: existing } = await supabaseAdmin
      .from("landing_page_submissions")
      .select("id")
      .eq("landing_page_id", landingPage.id)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return json(
        { error: "Ten adres e-mail został już zarejestrowany na to wydarzenie", field: "email" },
        409,
      );
    }

    // ── Similar media + name (SOFT) — flag, allow ────────────────
    let possibleDuplicate = false;
    if (media_organization && last_name) {
      const { data: similar } = await supabaseAdmin
        .from("landing_page_submissions")
        .select("id")
        .eq("landing_page_id", landingPage.id)
        .ilike("media_organization", media_organization)
        .ilike("last_name", last_name)
        .limit(1);
      possibleDuplicate = Array.isArray(similar) && similar.length > 0;
    }

    // ── Required fields from form_config ─────────────────────────
    const formConfig = landingPage.form_config as any;
    const skip = ["first_name", "last_name", "email", "role"];
    if (formConfig?.fields) {
      for (const field of formConfig.fields) {
        if (field.required && field.visible && !skip.includes(field.key)) {
          const value = body[field.key];
          const empty =
            value === undefined || value === null ||
            (typeof value === "string" && value.trim() === "") || value === false;
          if (empty) {
            return fieldError(`Pole "${field.label}" jest wymagane`, field.key);
          }
        }
      }
    }

    // ── Media Verification Engine: scoring (sugestia, nie decyzja) ──
    const verification = computeVerification(
      {
        email, role, media_organization, portfolio_url, publication_links,
        social_media, coverage_description, requested_access, phone,
        first_name, last_name, previous_accreditation,
      },
      possibleDuplicate,
    );

    // ── Insert submission ────────────────────────────────────────
    const { data: submission, error: insertError } = await supabaseAdmin
      .from("landing_page_submissions")
      .insert({
        landing_page_id: landingPage.id,
        event_id: landingPage.event_id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        media_organization: media_organization || null,
        media_type: media_type || null,
        job_title: job_title || null,
        role,
        social_media: social_media || null,
        portfolio_url: portfolio_url || null,
        publication_links: publication_links || null,
        coverage_description: coverage_description || null,
        requested_access: requested_access || null,
        previous_accreditation,
        consent_data_processing,
        consent_marketing,
        accreditation_type: accreditation_type || null,
        custom_fields,
        flags: possibleDuplicate ? { possible_duplicate: true } : {},
        status: "pending",
        verification_score: verification.score,
        verification_risk_level: verification.risk_level,
        verification_status: verification.status,
        verification_flags: verification.flags,
        verification_explanation: verification.explanation,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return json({ error: "Błąd zapisu zgłoszenia. Spróbuj ponownie." }, 500);
    }

    const reference = makeRef(submission.id);

    // ── Initial verification event (history, non-critical) ───────
    try {
      await supabaseAdmin.from("submission_verification_events").insert({
        submission_id: submission.id,
        event_id: landingPage.event_id,
        actor_id: null,
        actor_email: "system",
        event_type: "scored",
        to_status: verification.status,
        to_score: verification.score,
        to_risk: verification.risk_level,
        note: "Automatyczny scoring przy rejestracji zgłoszenia",
        metadata: { flags: verification.flags, reference },
      });
    } catch (eventErr) {
      console.error("Verification event insert failed (non-critical):", eventErr);
    }

    // ── Confirmation email to applicant (non-critical) ───────────
    try {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Akredytacje <noreply@notify.bookingartistagency.com>",
            to: [email],
            subject: `Potwierdzenie zgłoszenia akredytacyjnego (${reference})`,
            html: `
              <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
                <h2>Dziękujemy za zgłoszenie!</h2>
                <p>Twoje zgłoszenie akredytacyjne zostało przyjęte i oczekuje na rozpatrzenie.</p>
                <p style="background:#f3f4f6;border-radius:8px;padding:12px;font-size:14px;">
                  Numer zgłoszenia: <strong>${reference}</strong>
                </p>
                <p><strong>${first_name} ${last_name}</strong></p>
                ${media_organization ? `<p>Redakcja: ${media_organization}</p>` : ""}
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                <p style="color: #6b7280; font-size: 12px;">
                  Otrzymasz powiadomienie o decyzji na ten adres e-mail.
                </p>
              </div>
            `,
          }),
        });
      }
    } catch (emailErr) {
      console.error("Applicant email send failed (non-critical):", emailErr);
    }

    // ── Internal notification to organizer (non-critical) ────────
    try {
      const { data: ev } = await supabaseAdmin
        .from("events")
        .select("organizer_id, title")
        .eq("id", landingPage.event_id)
        .single();

      if (ev?.organizer_id) {
        // In-app notification
        await supabaseAdmin.from("user_notifications").insert({
          user_id: ev.organizer_id,
          event_id: landingPage.event_id,
          type: "accreditation_request",
          title: "Nowe zgłoszenie akredytacyjne",
          message:
            `${first_name} ${last_name}` +
            (media_organization ? ` (${media_organization})` : "") +
            ` złożył(a) zgłoszenie${ev.title ? ` na: ${ev.title}` : ""}.` +
            (possibleDuplicate ? " ⚠ Możliwy duplikat." : ""),
          action_url: "/guests?filter=pending",
          metadata: { submission_id: submission.id, reference, role, possible_duplicate: possibleDuplicate },
        });

        // Email to organizer (best-effort, requires auth lookup)
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (resendKey) {
          const { data: organizer } = await supabaseAdmin.auth.admin.getUserById(ev.organizer_id);
          const organizerEmail = organizer?.user?.email;
          if (organizerEmail) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: "Akredytacje <noreply@notify.bookingartistagency.com>",
                to: [organizerEmail],
                subject: `Nowe zgłoszenie akredytacyjne — ${ev.title ?? ""} (${reference})`,
                html: `
                  <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
                    <h2>Nowe zgłoszenie akredytacyjne</h2>
                    <p><strong>${first_name} ${last_name}</strong>${media_organization ? ` — ${media_organization}` : ""}</p>
                    <p>Rola: ${role}</p>
                    <p>E-mail: ${email}</p>
                    <p>Numer: <strong>${reference}</strong></p>
                    ${possibleDuplicate ? `<p style="color:#b45309;">⚠ Możliwy duplikat (to samo medium i nazwisko już występuje).</p>` : ""}
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="color:#6b7280;font-size:12px;">Rozpatrz w panelu: Akredytacje → oczekujące.</p>
                  </div>
                `,
              }),
            });
          }
        }
      }
    } catch (notifyErr) {
      console.error("Organizer notification failed (non-critical):", notifyErr);
    }

    return json({ success: true, id: submission.id, reference }, 201);
  } catch (err) {
    console.error("Unexpected error:", err);
    return json({ error: "Wystąpił nieoczekiwany błąd" }, 500);
  }
});
