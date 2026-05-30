/**
 * Współdzielone typy dla publicznego workflow akredytacji medialnej.
 *
 * Te typy są źródłem prawdy dla:
 *  - konfiguracji formularza (`form_config`) na `event_landing_pages`,
 *  - danych zgłoszenia (`landing_page_submissions`),
 *  - walidacji po stronie frontendu (`submissionValidation.ts`).
 *
 * Edge function (`landing-page-register`) działa w Deno i nie może importować
 * z `src/`, dlatego utrzymuje równoległą (zsynchronizowaną logicznie) kopię
 * reguł walidacji. Każda zmiana reguł musi być odzwierciedlona w obu miejscach.
 */

/** Stała rola medialna — steruje walidacją zależną od typu. */
export type MediaRole =
  | "journalist"
  | "photographer"
  | "video"
  | "radio"
  | "podcast"
  | "influencer"
  | "other";

export const MEDIA_ROLES: { value: MediaRole; label: string }[] = [
  { value: "journalist", label: "Dziennikarz / Redaktor" },
  { value: "photographer", label: "Fotoreporter" },
  { value: "video", label: "Operator / Wideo" },
  { value: "radio", label: "Radio" },
  { value: "podcast", label: "Podcast" },
  { value: "influencer", label: "Influencer / Twórca" },
  { value: "other", label: "Inne" },
];

export const MEDIA_ROLE_VALUES: MediaRole[] = MEDIA_ROLES.map((r) => r.value);

/** Pojedyncze pole konfigurowalne przez organizatora. */
export interface FormField {
  key: string;
  label: string;
  /** text | email | tel | url | textarea | checkbox | select */
  type: string;
  required: boolean;
  visible: boolean;
  /** Sekcja, w której pole jest renderowane (opcjonalne — domyślnie z FIELD_SECTION). */
  section?: FormSectionId;
  placeholder?: string;
  /** Opcje dla pola typu `select`. */
  options?: { value: string; label: string }[];
}

/** Konfigurowalna przez organizatora kategoria akredytacji. */
export interface AccreditationType {
  value: string;
  label: string;
}

export interface FormConfig {
  fields: FormField[];
  accreditation_types: AccreditationType[];
}

/** Dane jednego zgłoszenia medialnego. */
export interface SubmissionData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  media_organization?: string;
  media_type?: string;
  job_title?: string;
  role?: string;
  portfolio_url?: string;
  publication_links?: string;
  social_media?: string;
  coverage_description?: string;
  requested_access?: string;
  previous_accreditation?: boolean;
  consent_data_processing?: boolean;
  consent_marketing?: boolean;
  accreditation_type?: string;
  accept_terms?: boolean;
  [key: string]: unknown;
}

/** Sekcje formularza publicznego (kolejność = kolejność renderowania). */
export type FormSectionId = "person" | "media" | "coverage" | "access" | "consents";

export const FORM_SECTIONS: { id: FormSectionId; title: string; description?: string }[] = [
  { id: "person", title: "Dane osoby", description: "Kto składa zgłoszenie" },
  { id: "media", title: "Medium", description: "Redakcja i typ relacji" },
  { id: "coverage", title: "Planowana relacja", description: "Jak relacjonujesz wydarzenie" },
  { id: "access", title: "Dostęp", description: "Czego potrzebujesz na miejscu" },
  { id: "consents", title: "Zgody", description: "Wymagane zgody i regulamin" },
];

/** Domyślne przypisanie znanych pól do sekcji. */
export const FIELD_SECTION: Record<string, FormSectionId> = {
  first_name: "person",
  last_name: "person",
  email: "person",
  phone: "person",
  media_organization: "media",
  media_type: "media",
  job_title: "media",
  role: "media",
  coverage_description: "coverage",
  portfolio_url: "coverage",
  publication_links: "coverage",
  social_media: "coverage",
  requested_access: "access",
  previous_accreditation: "access",
};
