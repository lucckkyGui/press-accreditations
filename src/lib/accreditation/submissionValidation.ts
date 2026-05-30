/**
 * Walidacja zgłoszeń medialnych (pure TS — testowalne w vitest).
 *
 * UWAGA: Edge function `supabase/functions/landing-page-register/index.ts`
 * implementuje równoległą kopię tych reguł (Deno nie importuje z `src/`).
 * Każda zmiana reguł walidacji MUSI być odzwierciedlona w obu miejscach.
 * Frontend validation NIE wystarcza — backend jest źródłem prawdy bezpieczeństwa.
 */

import {
  type FormConfig,
  type MediaRole,
  type SubmissionData,
  MEDIA_ROLE_VALUES,
} from "./types";

/**
 * Lista domen jednorazowych / tymczasowych adresów e-mail (disposable).
 * Współdzielona z edge function — utrzymywać w synchronizacji.
 */
export const DISPOSABLE_EMAIL_DOMAINS: string[] = [
  "tempmail.com",
  "temp-mail.org",
  "throwaway.email",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "sharklasers.com",
  "grr.la",
  "mailinator.com",
  "yopmail.com",
  "10minutemail.com",
  "10minutemail.net",
  "trashmail.com",
  "fakeinbox.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "mailnesia.com",
  "mintemail.com",
  "tempinbox.com",
  "spam4.me",
  "moakt.com",
  "emailondeck.com",
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Maksymalne długości pól (spójne z backendem). */
export const FIELD_LIMITS = {
  name: 100,
  email: 255,
  phone: 40,
  organization: 200,
  shortText: 255,
  longText: 2000,
} as const;

export function isValidEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const v = value.trim();
  return v.length > 0 && v.length <= FIELD_LIMITS.email && EMAIL_REGEX.test(v);
}

export function isDisposableEmail(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const domain = value.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
}

export function isValidUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (!v) return false;
  try {
    const url = new URL(v);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Dzieli pole publication_links na poszczególne URL-e (newline / przecinek / spacja). */
export function splitLinks(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(/[\n,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Czy wszystkie wpisy w polu linków to poprawne URL-e. */
export function areValidUrlList(value: unknown): boolean {
  const links = splitLinks(value);
  if (links.length === 0) return false;
  return links.every((l) => isValidUrl(l));
}

export function isValidRole(value: unknown): value is MediaRole {
  return typeof value === "string" && (MEDIA_ROLE_VALUES as string[]).includes(value);
}

function nonEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

export interface ValidateOptions {
  /** Wymagaj zgody na przetwarzanie danych (domyślnie true). */
  requireConsent?: boolean;
  /** Wymagaj akceptacji regulaminu (gdy landing ma terms_text). */
  requireTerms?: boolean;
  /** Dodatkowe pola wymagane przez konfigurację organizatora. */
  requiredFields?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Zwraca które pola są dodatkowo wymagane dla danej roli.
 * Wykorzystywane przez UI do oznaczania pól gwiazdką w sekcji „Planowana relacja".
 */
export function getConditionalRequired(role: string | undefined): string[] {
  switch (role) {
    case "photographer":
      // portfolio_url LUB publication_links — oznaczamy oba jako warunkowe
      return ["portfolio_url", "publication_links"];
    case "video":
      return ["coverage_description"];
    case "influencer":
      return ["social_media"];
    case "journalist":
      return ["media_organization", "publication_links"];
    default:
      return [];
  }
}

/**
 * Główna walidacja zgłoszenia medialnego.
 * Reguły zależne od roli:
 *  - photographer → portfolio_url LUB publication_links
 *  - video        → coverage_description
 *  - influencer   → social_media
 *  - journalist   → media_organization ORAZ publication_links
 */
export function validateSubmission(
  data: SubmissionData,
  options: ValidateOptions = {},
): ValidationResult {
  const errors: Record<string, string> = {};
  const requireConsent = options.requireConsent !== false;

  // ── Pola bazowe ──────────────────────────────────────────────
  if (!nonEmpty(data.first_name)) errors.first_name = "Imię jest wymagane";
  if (!nonEmpty(data.last_name)) errors.last_name = "Nazwisko jest wymagane";

  if (!nonEmpty(data.email)) {
    errors.email = "Adres e-mail jest wymagany";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Nieprawidłowy format adresu e-mail";
  } else if (isDisposableEmail(data.email)) {
    errors.email = "Użyj służbowego adresu e-mail (adresy tymczasowe są niedozwolone)";
  }

  if (!nonEmpty(data.role)) {
    errors.role = "Wybierz typ relacji / rolę";
  } else if (!isValidRole(data.role)) {
    errors.role = "Nieprawidłowy typ relacji";
  }

  // ── Formaty URL (jeśli podane) ───────────────────────────────
  if (nonEmpty(data.portfolio_url) && !isValidUrl(data.portfolio_url)) {
    errors.portfolio_url = "Nieprawidłowy adres URL (użyj http:// lub https://)";
  }
  if (nonEmpty(data.publication_links) && !areValidUrlList(data.publication_links)) {
    errors.publication_links = "Podaj prawidłowe adresy URL (każdy w nowej linii)";
  }

  // ── Reguły zależne od roli ───────────────────────────────────
  const role = typeof data.role === "string" ? data.role : "";
  if (role === "photographer") {
    if (!nonEmpty(data.portfolio_url) && !nonEmpty(data.publication_links)) {
      errors.portfolio_url = "Fotoreporter: podaj portfolio lub linki do publikacji";
    }
  } else if (role === "video") {
    if (!nonEmpty(data.coverage_description)) {
      errors.coverage_description = "Opisz planowaną relację wideo";
    }
  } else if (role === "influencer") {
    if (!nonEmpty(data.social_media)) {
      errors.social_media = "Podaj profile w social media";
    }
  } else if (role === "journalist") {
    if (!nonEmpty(data.media_organization)) {
      errors.media_organization = "Podaj redakcję / medium";
    }
    if (!nonEmpty(data.publication_links)) {
      errors.publication_links = "Podaj linki do publikacji";
    }
  }

  // ── Zgody ────────────────────────────────────────────────────
  if (requireConsent && data.consent_data_processing !== true) {
    errors.consent_data_processing = "Zgoda na przetwarzanie danych jest wymagana";
  }
  if (options.requireTerms && data.accept_terms !== true) {
    errors.accept_terms = "Musisz zaakceptować regulamin";
  }

  // ── Pola wymagane z konfiguracji organizatora ────────────────
  if (options.requiredFields) {
    for (const key of options.requiredFields) {
      if (errors[key]) continue; // już oznaczone
      const v = data[key];
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === "string" && v.trim() === "") ||
        v === false;
      if (empty) errors[key] = "To pole jest wymagane";
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Wyciąga listę kluczy pól wymaganych z konfiguracji (visible + required). */
export function requiredFieldsFromConfig(config: FormConfig | undefined | null): string[] {
  if (!config?.fields) return [];
  return config.fields
    .filter((f) => f.required && f.visible)
    .map((f) => f.key);
}
