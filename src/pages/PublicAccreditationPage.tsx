import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_URL,
  supabase,
} from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  MapPin,
  CalendarDays,
  Clock,
  Mail,
  Hash,
} from "lucide-react";
import NotFound from "@/pages/NotFound";
import {
  type FormConfig,
  type FormField,
  type FormSectionId,
  type SubmissionData,
  FORM_SECTIONS,
  FIELD_SECTION,
  MEDIA_ROLES,
} from "@/lib/accreditation/types";
import {
  validateSubmission,
  requiredFieldsFromConfig,
  getConditionalRequired,
} from "@/lib/accreditation/submissionValidation";

interface LandingPage {
  id: string;
  slug: string;
  event_id: string;
  logo_url: string | null;
  banner_url: string | null;
  primary_color: string;
  secondary_color: string;
  description: string | null;
  terms_text: string | null;
  social_links: Record<string, string>;
  form_config: FormConfig;
  events: {
    title: string;
    location: string | null;
    start_date: string;
    end_date: string;
  };
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });

const PublicAccreditationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState<string>("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<SubmissionData>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formLoadedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!slug) return;
    formLoadedAt.current = Date.now();
    (supabase as any)
      .from("event_landing_pages")
      .select("*, events(title, location, start_date, end_date)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single()
      .then(({ data, error: err }: any) => {
        if (err || !data) {
          setError("not_found");
        } else {
          setPage(data);
          const initial: SubmissionData = {};
          const config = data.form_config as FormConfig;
          config?.fields?.forEach((f: FormField) => {
            if (f.visible) initial[f.key] = f.type === "checkbox" ? false : "";
          });
          initial.accreditation_type = config?.accreditation_types?.[0]?.value || "";
          initial.role = "";
          initial.consent_data_processing = false;
          initial.consent_marketing = false;
          setFormData(initial);
        }
        setLoading(false);
      });
  }, [slug]);

  const config = page?.form_config;
  const requiredFromConfig = useMemo(() => requiredFieldsFromConfig(config), [config]);

  // Conditional-required keys (driven by selected role)
  const conditionalRequired = useMemo(
    () => getConditionalRequired(formData.role),
    [formData.role],
  );

  // Visible config fields grouped by section
  const fieldsBySection = useMemo(() => {
    const map: Record<FormSectionId, FormField[]> = {
      person: [], media: [], coverage: [], access: [], consents: [],
    };
    (config?.fields || [])
      .filter((f) => f.visible)
      .forEach((f) => {
        const section = (f.section || FIELD_SECTION[f.key] || "media") as FormSectionId;
        map[section].push(f);
      });
    return map;
  }, [config]);

  // ── Progress (fraction of currently-required fields that are filled) ──
  const progress = useMemo(() => {
    const requiredNow = new Set<string>([
      "first_name", "last_name", "email", "role",
      ...conditionalRequired, ...requiredFromConfig,
    ]);
    // photographer = portfolio OR links → count as one satisfied if either present
    let total = 0;
    let filled = 0;
    requiredNow.forEach((k) => {
      total++;
      const v = formData[k];
      if (typeof v === "string" ? v.trim() !== "" : !!v) filled++;
    });
    // consent counts toward progress
    total++;
    if (formData.consent_data_processing) filled++;
    if (page?.terms_text) {
      total++;
      if (formData.accept_terms) filled++;
    }
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }, [formData, conditionalRequired, requiredFromConfig, page]);

  const updateField = (key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    setError("");

    // Client-side validation (mirror of backend; backend remains source of truth)
    const result = validateSubmission(formData, {
      requireConsent: true,
      requireTerms: !!page.terms_text,
      requiredFields: requiredFromConfig,
    });

    if (!result.valid) {
      setFieldErrors(result.errors);
      setError("Uzupełnij zaznaczone pola, aby wysłać zgłoszenie.");
      // Scroll to first error
      const firstKey = Object.keys(result.errors)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/landing-page-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          slug,
          ...formData,
          _form_loaded_at: formLoadedAt.current,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setFieldErrors({ email: data.error || "Ten e-mail został już zgłoszony na to wydarzenie." });
          setError(data.error || "Ten adres e-mail został już zarejestrowany.");
        } else if (data.field) {
          setFieldErrors({ [data.field]: data.error });
          setError(data.error || "Sprawdź wprowadzone dane.");
        } else {
          setError(data.error || "Wystąpił błąd. Spróbuj ponownie.");
        }
      } else {
        setReference(data.reference || "");
        setSubmitted(true);
      }
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="light">
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error === "not_found" || !page) {
    return <NotFound />;
  }

  const socialLinks = (page.social_links || {}) as Record<string, string>;
  const accreditationTypes = config?.accreditation_types || [];

  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="light">
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md space-y-6 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-success" />
            <div>
              <h2 className="text-2xl font-bold text-foreground">Zgłoszenie przyjęte!</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Dziękujemy. Twoje zgłoszenie akredytacyjne na{" "}
                <strong>{page.events?.title}</strong> zostało zapisane.
              </p>
            </div>

            {reference && (
              <div className="rounded-lg border border-border bg-card shadow-card p-4">
                <p className="text-xs text-muted-foreground mb-1">Numer zgłoszenia</p>
                <p className="font-mono text-lg font-semibold text-foreground flex items-center justify-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  {reference}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Zachowaj ten numer — przyda się w kontakcie z organizatorem.
                </p>
              </div>
            )}

            {/* Decision timeline */}
            <div className="rounded-lg border border-border bg-card shadow-card p-5 text-left space-y-4">
              <p className="text-sm font-semibold text-foreground">Co dalej?</p>
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Zgłoszenie przyjęte</p>
                    <p className="text-xs text-muted-foreground">Status: oczekuje na weryfikację</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Weryfikacja przez organizatora</p>
                    <p className="text-xs text-muted-foreground">Sprawdzamy medium i dane kontaktowe</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Decyzja e-mailem</p>
                    <p className="text-xs text-muted-foreground">
                      Powiadomienie wyślemy na{" "}
                      <strong className="text-foreground">{formData.email}</strong>
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Field renderer ──────────────────────────────────────────
  const renderField = (field: FormField) => {
    const err = fieldErrors[field.key];
    const isConditional = conditionalRequired.includes(field.key);
    const required = field.required || isConditional;
    const value = formData[field.key];

    return (
      <div key={field.key} data-field={field.key}>
        {field.type !== "checkbox" && (
          <Label className="text-sm font-medium text-foreground">
            {field.label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}

        {field.type === "textarea" ? (
          <Textarea
            maxLength={2000}
            value={(value as string) || ""}
            placeholder={field.placeholder}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={`mt-1 ${err ? "border-destructive" : ""}`}
            rows={3}
          />
        ) : field.type === "checkbox" ? (
          <label className="flex items-start gap-2 mt-1 cursor-pointer">
            <Checkbox
              checked={!!value}
              onCheckedChange={(checked) => updateField(field.key, checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm text-muted-foreground">{field.label}</span>
          </label>
        ) : field.type === "select" ? (
          <Select
            value={(value as string) || ""}
            onValueChange={(v) => updateField(field.key, v)}
          >
            <SelectTrigger className={`mt-1 ${err ? "border-destructive" : ""}`}>
              <SelectValue placeholder={field.placeholder || "Wybierz…"} />
            </SelectTrigger>
            <SelectContent>
              {(field.options || []).map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            type={field.type || "text"}
            inputMode={field.type === "tel" ? "tel" : field.type === "email" ? "email" : undefined}
            maxLength={field.type === "email" ? 255 : 255}
            value={(value as string) || ""}
            placeholder={field.placeholder}
            onChange={(e) => updateField(field.key, e.target.value)}
            className={`mt-1 ${err ? "border-destructive" : ""}`}
          />
        )}

        {err && <p className="text-xs text-destructive mt-1">{err}</p>}
      </div>
    );
  };

  const sectionHasContent = (id: FormSectionId): boolean => {
    if (id === "media") return true; // role selector always present
    if (id === "consents") return true; // consents always present
    return fieldsBySection[id].length > 0;
  };

  const visibleSections = FORM_SECTIONS.filter((s) => sectionHasContent(s.id));

  return (
    <div className="light">
      <div className="min-h-screen bg-background pb-24 md:pb-12">
        {/* Banner */}
        {page.banner_url && (
          <div className="w-full h-40 sm:h-48 md:h-64 overflow-hidden">
            <img src={page.banner_url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            {page.logo_url && (
              <img src={page.logo_url} alt="Logo" className="h-14 md:h-20 mx-auto object-contain" />
            )}
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground leading-tight">
                {page.events?.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Formularz akredytacji prasowej</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {page.events?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {page.events.location}
                </span>
              )}
              {page.events?.start_date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                  {fmtDate(page.events.start_date)}
                  {page.events?.end_date &&
                    page.events.end_date !== page.events.start_date &&
                    ` – ${fmtDate(page.events.end_date)}`}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {page.description && (
            <div className="rounded-lg border border-border bg-card shadow-card p-5 mb-6">
              <p className="text-sm text-muted-foreground whitespace-pre-line">{page.description}</p>
            </div>
          )}

          {/* Progress */}
          <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/95 backdrop-blur mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground">Postęp formularza</span>
              <span className="text-xs font-semibold text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Error banner */}
          {error && error !== "not_found" && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-start gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Honeypot — invisible to humans */}
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", top: "-9999px", opacity: 0, height: 0, overflow: "hidden" }}
            >
              <label htmlFor="__hp_website">Website</label>
              <input
                type="text" id="__hp_website" name="_website" tabIndex={-1} autoComplete="off"
                value={(formData._website as string) || ""}
                onChange={(e) => updateField("_website", e.target.value)}
              />
              <label htmlFor="__hp_field">Company URL</label>
              <input
                type="text" id="__hp_field" name="_hp_field" tabIndex={-1} autoComplete="off"
                value={(formData._hp_field as string) || ""}
                onChange={(e) => updateField("_hp_field", e.target.value)}
              />
            </div>

            {visibleSections.map((section, idx) => (
              <div
                key={section.id}
                className="rounded-lg border border-border bg-card shadow-card p-5 md:p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: page.primary_color }}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-foreground leading-none">{section.title}</h2>
                    {section.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                    )}
                  </div>
                </div>

                {/* Media section: accreditation type + role selector come first */}
                {section.id === "media" && accreditationTypes.length > 1 && (
                  <div data-field="accreditation_type">
                    <Label className="text-sm font-medium text-foreground">Typ akredytacji</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {accreditationTypes.map((at) => {
                        const active = formData.accreditation_type === at.value;
                        return (
                          <button
                            key={at.value}
                            type="button"
                            onClick={() => updateField("accreditation_type", at.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                              active
                                ? "text-white border-transparent shadow-card"
                                : "text-muted-foreground border-border hover:border-primary/40 bg-card"
                            }`}
                            style={active ? { backgroundColor: page.primary_color, borderColor: page.primary_color } : {}}
                          >
                            {at.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {section.id === "media" && (
                  <div data-field="role">
                    <Label className="text-sm font-medium text-foreground">
                      Typ relacji / rola <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                      {MEDIA_ROLES.map((r) => {
                        const active = formData.role === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            onClick={() => updateField("role", r.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                              active
                                ? "text-white border-transparent shadow-card"
                                : "text-muted-foreground border-border hover:border-primary/40 bg-card"
                            } ${fieldErrors.role && !active ? "border-destructive/50" : ""}`}
                            style={active ? { backgroundColor: page.primary_color, borderColor: page.primary_color } : {}}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                    {fieldErrors.role && <p className="text-xs text-destructive mt-1">{fieldErrors.role}</p>}
                  </div>
                )}

                {/* Config-driven fields for this section */}
                {fieldsBySection[section.id].map((field) => renderField(field))}

                {/* Consents section */}
                {section.id === "consents" && (
                  <div className="space-y-3">
                    {page.terms_text && (
                      <div className="rounded-lg border border-border bg-muted/50 p-3" data-field="accept_terms">
                        <p className="text-xs text-muted-foreground whitespace-pre-line max-h-32 overflow-y-auto mb-2">
                          {page.terms_text}
                        </p>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <Checkbox
                            checked={!!formData.accept_terms}
                            onCheckedChange={(c) => updateField("accept_terms", c === true)}
                            className="mt-0.5"
                          />
                          <span className="text-sm text-foreground">
                            Akceptuję regulamin <span className="text-destructive">*</span>
                          </span>
                        </label>
                        {fieldErrors.accept_terms && (
                          <p className="text-xs text-destructive mt-1">{fieldErrors.accept_terms}</p>
                        )}
                      </div>
                    )}

                    <div data-field="consent_data_processing">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <Checkbox
                          checked={!!formData.consent_data_processing}
                          onCheckedChange={(c) => updateField("consent_data_processing", c === true)}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-foreground">
                          Wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi
                          zgłoszenia akredytacyjnego. <span className="text-destructive">*</span>
                        </span>
                      </label>
                      {fieldErrors.consent_data_processing && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.consent_data_processing}</p>
                      )}
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer" data-field="consent_marketing">
                      <Checkbox
                        checked={!!formData.consent_marketing}
                        onCheckedChange={(c) => updateField("consent_marketing", c === true)}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-muted-foreground">
                        Chcę otrzymywać informacje o kolejnych wydarzeniach (opcjonalnie).
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ))}

            {/* Submit (sticky on mobile) */}
            <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/95 backdrop-blur p-3 md:static md:border-0 md:bg-transparent md:p-0">
              <div className="max-w-2xl mx-auto">
                <Button
                  type="submit"
                  className="w-full text-white font-semibold py-3 rounded-lg"
                  disabled={submitting}
                  style={{ backgroundColor: page.primary_color }}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wyślij zgłoszenie"}
                </Button>
              </div>
            </div>

            {/* Social links */}
            {Object.values(socialLinks).some(Boolean) && (
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                {Object.entries(socialLinks).map(([platform, url]) =>
                  url ? (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      {platform} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null,
                )}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground/60 text-center">
              Powered by PressOps by OSURMO
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicAccreditationPage;
