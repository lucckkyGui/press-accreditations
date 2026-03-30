import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface FormField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  visible: boolean;
}

interface AccreditationType {
  value: string;
  label: string;
}

interface FormConfig {
  fields: FormField[];
  accreditation_types: AccreditationType[];
}

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

const PublicAccreditationPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (!slug) return;
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
          // Initialize form data
          const initial: Record<string, any> = {};
          const config = data.form_config as FormConfig;
          config?.fields?.forEach((f: FormField) => {
            if (f.visible) {
              initial[f.key] = f.type === "checkbox" ? false : "";
            }
          });
          initial["accreditation_type"] = config?.accreditation_types?.[0]?.value || "";
          setFormData(initial);
        }
        setLoading(false);
      });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!page) return;
    if (page.terms_text && !acceptTerms) {
      setError("Musisz zaakceptować regulamin");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/landing-page-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ slug, ...formData }),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Wystąpił błąd");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error === "not_found" || !page) {
    return null; // Let React Router fall through to NotFound
  }

  const config = page.form_config;
  const visibleFields = config?.fields?.filter((f) => f.visible) || [];
  const socialLinks = (page.social_links || {}) as Record<string, string>;

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: `linear-gradient(135deg, ${page.primary_color}15, ${page.secondary_color}15)` }}>
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle className="h-20 w-20 mx-auto" style={{ color: page.primary_color }} />
          <h2 className="text-2xl font-bold text-gray-900">Zgłoszenie przyjęte!</h2>
          <p className="text-gray-500">
            Twoje zgłoszenie akredytacyjne zostało wysłane i oczekuje na rozpatrzenie.
            Otrzymasz powiadomienie na podany adres e-mail.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(135deg, ${page.primary_color}08, ${page.secondary_color}08)` }}>
      {/* Banner */}
      {page.banner_url && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img src={page.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          {page.logo_url && (
            <img
              src={page.logo_url}
              alt="Logo"
              className="h-16 md:h-20 mx-auto object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {page.events?.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Formularz akredytacji prasowej</p>
          </div>
          {page.events?.location && (
            <p className="text-sm text-gray-500">📍 {page.events.location}</p>
          )}
          {page.events?.start_date && (
            <p className="text-sm text-gray-400">
              📅{" "}
              {new Date(page.events.start_date).toLocaleDateString("pl-PL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              {page.events?.end_date &&
                page.events.end_date !== page.events.start_date &&
                ` – ${new Date(page.events.end_date).toLocaleDateString("pl-PL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}`}
            </p>
          )}
        </div>

        {/* Description */}
        {page.description && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <p className="text-sm text-gray-600 whitespace-pre-line">{page.description}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border p-6 md:p-8 space-y-5">
          <div
            className="h-1.5 rounded-full mx-auto w-20 mb-4"
            style={{ background: `linear-gradient(90deg, ${page.primary_color}, ${page.secondary_color})` }}
          />

          {error && error !== "not_found" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Accreditation type selector */}
          {config?.accreditation_types && config.accreditation_types.length > 1 && (
            <div>
              <Label className="text-sm font-medium text-gray-700">Typ akredytacji *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {config.accreditation_types.map((at) => (
                  <button
                    key={at.value}
                    type="button"
                    onClick={() => updateField("accreditation_type", at.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      formData.accreditation_type === at.value
                        ? "text-white border-transparent shadow-md"
                        : "text-gray-600 border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                    style={
                      formData.accreditation_type === at.value
                        ? { backgroundColor: page.primary_color, borderColor: page.primary_color }
                        : {}
                    }
                  >
                    {at.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic fields */}
          {visibleFields.map((field) => (
            <div key={field.key}>
              <Label className="text-sm font-medium text-gray-700">
                {field.label} {field.required && "*"}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  required={field.required}
                  maxLength={1000}
                  value={formData[field.key] || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              ) : field.type === "checkbox" ? (
                <div className="flex items-center gap-2 mt-1">
                  <Checkbox
                    checked={formData[field.key] || false}
                    onCheckedChange={(checked) => updateField(field.key, checked)}
                  />
                  <span className="text-sm text-gray-600">{field.label}</span>
                </div>
              ) : (
                <Input
                  type={field.type || "text"}
                  required={field.required}
                  maxLength={255}
                  value={formData[field.key] || ""}
                  onChange={(e) => updateField(field.key, e.target.value)}
                  className="mt-1"
                />
              )}
            </div>
          ))}

          {/* Terms */}
          {page.terms_text && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-xs text-gray-500 whitespace-pre-line max-h-32 overflow-y-auto">
                {page.terms_text}
              </p>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                />
                <span className="text-sm text-gray-600">Akceptuję regulamin</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full text-white font-semibold py-3"
            disabled={submitting}
            style={{ backgroundColor: page.primary_color }}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wyślij zgłoszenie"}
          </Button>

          {/* Social links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="flex justify-center gap-4 pt-2">
              {Object.entries(socialLinks).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                  >
                    {platform} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null
              )}
            </div>
          )}

          <p className="text-[10px] text-gray-400 text-center">
            Powered by Press Accreditations
          </p>
        </form>
      </div>
    </div>
  );
};

export default PublicAccreditationPage;
