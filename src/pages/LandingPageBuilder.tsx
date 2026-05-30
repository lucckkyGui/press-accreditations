import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft, Globe, Palette, FileText, Settings2, Eye, Copy, Check,
  Plus, Trash2, GripVertical, ExternalLink, Loader2, Save,
  Monitor, Smartphone, MapPin, CalendarDays
} from "lucide-react";
import {
  type FormConfig,
  type FormField,
  type FormSectionId,
  FORM_SECTIONS,
  FIELD_SECTION,
  MEDIA_ROLES,
} from "@/lib/accreditation/types";

const MEDIA_TYPE_OPTIONS = [
  { value: "press", label: "Prasa" },
  { value: "online", label: "Portal / Online" },
  { value: "tv", label: "Telewizja" },
  { value: "radio", label: "Radio" },
  { value: "agency", label: "Agencja prasowa" },
  { value: "podcast", label: "Podcast" },
  { value: "social", label: "Social media" },
  { value: "other", label: "Inne" },
];

const DEFAULT_FORM_CONFIG: FormConfig = {
  fields: [
    { key: "first_name", label: "Imię", type: "text", required: true, visible: true },
    { key: "last_name", label: "Nazwisko", type: "text", required: true, visible: true },
    { key: "email", label: "Email", type: "email", required: true, visible: true },
    { key: "phone", label: "Telefon", type: "tel", required: false, visible: true },
    { key: "media_organization", label: "Redakcja / Medium", type: "text", required: true, visible: true },
    { key: "media_type", label: "Typ medium", type: "select", required: false, visible: true, options: MEDIA_TYPE_OPTIONS },
    { key: "job_title", label: "Stanowisko", type: "text", required: false, visible: true },
    { key: "coverage_description", label: "Opis planowanej relacji", type: "textarea", required: false, visible: true },
    { key: "portfolio_url", label: "Portfolio / Strona", type: "url", required: false, visible: true },
    { key: "publication_links", label: "Linki do publikacji", type: "textarea", required: false, visible: true },
    { key: "social_media", label: "Social media", type: "textarea", required: false, visible: false },
    { key: "requested_access", label: "Wnioskowany dostęp / strefy", type: "textarea", required: false, visible: false },
    { key: "previous_accreditation", label: "Posiadam wcześniejsze akredytacje", type: "checkbox", required: false, visible: false },
  ],
  accreditation_types: [
    { value: "press", label: "Prasa" },
    { value: "photographer", label: "Fotograf" },
    { value: "tv", label: "Telewizja" },
    { value: "radio", label: "Radio" },
    { value: "online", label: "Media online" },
    { value: "blogger", label: "Blogger / Influencer" },
  ],
};

const LandingPageBuilder = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [secondaryColor, setSecondaryColor] = useState("#8b5cf6");
  const [description, setDescription] = useState("");
  const [termsText, setTermsText] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    Instagram: "",
    Facebook: "",
    Twitter: "",
    Website: "",
  });
  const [formConfig, setFormConfig] = useState<FormConfig>(DEFAULT_FORM_CONFIG);
  const [isActive, setIsActive] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const slugValid = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(slug);

  useEffect(() => {
    if (!eventId) return;
    loadData();
  }, [eventId]);

  const loadData = async () => {
    // Load event
    const { data: ev } = await supabase
      .from("events")
      .select("id, title, location, start_date")
      .eq("id", eventId!)
      .single();

    if (ev) {
      setEvent(ev);
      // Generate default slug from title
      const defaultSlug = ev.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      
      // Load existing landing page
      const { data: lp } = await (supabase as any)
        .from("event_landing_pages")
        .select("*")
        .eq("event_id", eventId!)
        .single();

      if (lp) {
        setPageId(lp.id);
        setSlug(lp.slug);
        setLogoUrl(lp.logo_url || "");
        setBannerUrl(lp.banner_url || "");
        setPrimaryColor(lp.primary_color || "#6366f1");
        setSecondaryColor(lp.secondary_color || "#8b5cf6");
        setDescription(lp.description || "");
        setTermsText(lp.terms_text || "");
        setSocialLinks(lp.social_links || { Instagram: "", Facebook: "", Twitter: "", Website: "" });
        setFormConfig(lp.form_config || DEFAULT_FORM_CONFIG);
        setIsActive(lp.is_active);
      } else {
        setSlug(defaultSlug);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!eventId) return;
    if (!slug || slug.length < 3) {
      toast.error("Slug musi mieć minimum 3 znaki");
      return;
    }
    if (!/^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/.test(slug)) {
      toast.error("Slug może zawierać tylko małe litery, cyfry i myślniki");
      return;
    }

    setSaving(true);
    const payload = {
      event_id: eventId,
      slug,
      logo_url: logoUrl || null,
      banner_url: bannerUrl || null,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      description: description || null,
      terms_text: termsText || null,
      social_links: socialLinks,
      form_config: formConfig,
      is_active: isActive,
    };

    let error;
    if (pageId) {
      const res = await (supabase as any)
        .from("event_landing_pages")
        .update(payload)
        .eq("id", pageId);
      error = res.error;
    } else {
      const res = await (supabase as any)
        .from("event_landing_pages")
        .insert(payload)
        .select("id")
        .single();
      error = res.error;
      if (res.data) setPageId(res.data.id);
    }

    if (error) {
      if (error.message?.includes("slug_format")) {
        toast.error("Nieprawidłowy format slug");
      } else if (error.message?.includes("unique")) {
        toast.error("Ten slug jest już zajęty. Wybierz inny.");
      } else {
        toast.error("Błąd zapisu: " + error.message);
      }
    } else {
      toast.success("Strona zapisana!");
    }
    setSaving(false);
  };

  const toggleField = (index: number, prop: "visible" | "required") => {
    setFormConfig((prev) => {
      const fields = [...prev.fields];
      // Don't allow hiding/unrequiring core fields
      if (["first_name", "last_name", "email"].includes(fields[index].key) && prop === "visible") return prev;
      if (["first_name", "last_name", "email"].includes(fields[index].key) && prop === "required") return prev;
      fields[index] = { ...fields[index], [prop]: !fields[index][prop] };
      return { ...prev, fields };
    });
  };

  const addAccreditationType = () => {
    setFormConfig((prev) => ({
      ...prev,
      accreditation_types: [...prev.accreditation_types, { value: `custom-${Date.now()}`, label: "" }],
    }));
  };

  const removeAccreditationType = (index: number) => {
    setFormConfig((prev) => ({
      ...prev,
      accreditation_types: prev.accreditation_types.filter((_, i) => i !== index),
    }));
  };

  const updateAccreditationType = (index: number, label: string) => {
    setFormConfig((prev) => {
      const types = [...prev.accreditation_types];
      types[index] = { ...types[index], label, value: label.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
      return { ...prev, accreditation_types: types };
    });
  };

  const publicUrl = `${window.location.origin}/${slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Strona akredytacji</h1>
            <p className="text-sm text-muted-foreground">{event?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {pageId && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/${slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-1" /> Podgląd
              </a>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
            Zapisz
          </Button>
        </div>
      </div>

      {/* URL Preview */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">pressaccreditations.com/</span>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className={`max-w-[200px] h-8 text-sm font-mono ${slug && !slugValid ? "border-destructive" : ""}`}
                  placeholder="nazwa-wydarzenia"
                />
              </div>
              {slug && !slugValid && (
                <p className="text-[11px] text-destructive mt-1">
                  Min. 3 znaki: małe litery, cyfry i myślniki (nie na początku/końcu).
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={copyUrl}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground">Aktywna</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="appearance">
        <TabsList className="w-full">
          <TabsTrigger value="appearance" className="flex-1">
            <Palette className="h-4 w-4 mr-1" /> Wygląd
          </TabsTrigger>
          <TabsTrigger value="content" className="flex-1">
            <FileText className="h-4 w-4 mr-1" /> Treść
          </TabsTrigger>
          <TabsTrigger value="form" className="flex-1">
            <Settings2 className="h-4 w-4 mr-1" /> Formularz
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1">
            <Eye className="h-4 w-4 mr-1" /> Podgląd
          </TabsTrigger>
        </TabsList>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>URL logotypu</Label>
                <Input
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                {logoUrl && <img src={logoUrl} alt="Logo preview" className="h-12 mt-2 object-contain" />}
              </div>
              <div>
                <Label>URL bannera</Label>
                <Input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                />
                {bannerUrl && <img src={bannerUrl} alt="Banner preview" className="h-24 mt-2 w-full object-cover rounded-lg" />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kolor główny</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
                <div>
                  <Label>Kolor dodatkowy</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <div key={platform}>
                  <Label className="text-sm">{platform}</Label>
                  <Input
                    value={url}
                    onChange={(e) => setSocialLinks((prev) => ({ ...prev, [platform]: e.target.value }))}
                    placeholder={`https://${platform.toLowerCase()}.com/...`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opis wydarzenia</CardTitle>
              <CardDescription>Informacje wyświetlane nad formularzem</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opisz wydarzenie, zasady akredytacji, wymagania..."
                rows={6}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Regulamin</CardTitle>
              <CardDescription>Jeśli podasz regulamin, formularz będzie wymagał jego akceptacji</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={termsText}
                onChange={(e) => setTermsText(e.target.value)}
                placeholder="Warunki uczestnictwa, polityka prywatności..."
                rows={6}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Form config */}
        <TabsContent value="form" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pola formularza</CardTitle>
              <CardDescription>Włącz/wyłącz pola i ustaw wymagalność</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formConfig.fields.map((field, i) => {
                  const isCore = ["first_name", "last_name", "email"].includes(field.key);
                  return (
                    <div
                      key={field.key}
                      className="flex items-center justify-between py-2 px-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{field.label}</span>
                        {isCore && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            wymagane
                          </span>
                        )}
                      </div>
                      {!isCore && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs text-muted-foreground">Widoczne</Label>
                            <Switch
                              checked={field.visible}
                              onCheckedChange={() => toggleField(i, "visible")}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Label className="text-xs text-muted-foreground">Wymagane</Label>
                            <Switch
                              checked={field.required}
                              onCheckedChange={() => toggleField(i, "required")}
                              disabled={!field.visible}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Typy akredytacji</CardTitle>
              <CardDescription>Kategorie do wyboru przez zgłaszających się</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {formConfig.accreditation_types.map((at, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={at.label}
                    onChange={(e) => updateAccreditationType(i, e.target.value)}
                    placeholder="Nazwa typu"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAccreditationType(i)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addAccreditationType} className="mt-2">
                <Plus className="h-4 w-4 mr-1" /> Dodaj typ
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live preview */}
        <TabsContent value="preview" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Podgląd na żywo — tak zobaczą stronę zgłaszający się.
            </p>
            <div className="inline-flex rounded-lg border bg-card p-0.5">
              <Button
                type="button"
                variant={previewDevice === "desktop" ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor className="h-4 w-4 mr-1" /> Desktop
              </Button>
              <Button
                type="button"
                variant={previewDevice === "mobile" ? "secondary" : "ghost"}
                size="sm"
                className="h-8"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone className="h-4 w-4 mr-1" /> Mobile
              </Button>
            </div>
          </div>

          <div className="flex justify-center bg-muted/40 rounded-xl border p-4 md:p-6 overflow-x-auto">
            <div
              className={`bg-white text-slate-900 rounded-lg shadow-lg overflow-hidden transition-all ${
                previewDevice === "mobile" ? "w-[375px]" : "w-full max-w-[760px]"
              }`}
            >
              <LandingPreview
                event={event}
                logoUrl={logoUrl}
                bannerUrl={bannerUrl}
                primaryColor={primaryColor}
                description={description}
                termsText={termsText}
                formConfig={formConfig}
                isActive={isActive}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Non-interactive live preview of the public landing ──────────────
interface LandingPreviewProps {
  event: { title?: string; location?: string | null; start_date?: string } | null;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  description: string;
  termsText: string;
  formConfig: FormConfig;
  isActive: boolean;
}

const LandingPreview: React.FC<LandingPreviewProps> = ({
  event, logoUrl, bannerUrl, primaryColor, description, termsText, formConfig, isActive,
}) => {
  const visibleFields = (formConfig.fields || []).filter((f) => f.visible);
  const bySection: Record<FormSectionId, FormField[]> = {
    person: [], media: [], coverage: [], access: [], consents: [],
  };
  visibleFields.forEach((f) => {
    const section = (f.section || FIELD_SECTION[f.key] || "media") as FormSectionId;
    bySection[section].push(f);
  });

  const sectionHasContent = (id: FormSectionId) =>
    id === "media" || id === "consents" || bySection[id].length > 0;
  const sections = FORM_SECTIONS.filter((s) => sectionHasContent(s.id));
  const accTypes = formConfig.accreditation_types || [];

  return (
    <div className="text-sm">
      {!isActive && (
        <div className="bg-amber-100 text-amber-800 text-xs text-center py-1.5 font-medium">
          Strona nieaktywna — niewidoczna publicznie
        </div>
      )}
      {bannerUrl && (
        <div className="w-full h-28 overflow-hidden bg-slate-100">
          <img src={bannerUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5 space-y-4">
        <div className="text-center space-y-2">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-10 mx-auto object-contain" />}
          <h1 className="text-lg font-bold">{event?.title || "Tytuł wydarzenia"}</h1>
          <p className="text-xs text-slate-500">Formularz akredytacji prasowej</p>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {event?.location && (
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
            )}
            {event?.start_date && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {new Date(event.start_date).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
        </div>

        {description && (
          <div className="rounded-lg border bg-slate-50 p-3 text-xs text-slate-600 whitespace-pre-line">
            {description}
          </div>
        )}

        {sections.map((section, idx) => (
          <div key={section.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {idx + 1}
              </span>
              <span className="font-semibold text-xs">{section.title}</span>
            </div>

            {section.id === "media" && accTypes.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {accTypes.map((t) => (
                  <span key={t.value} className="text-[11px] border rounded px-2 py-0.5 text-slate-600">{t.label}</span>
                ))}
              </div>
            )}

            {section.id === "media" && (
              <div>
                <p className="text-[11px] text-slate-500 mb-1">Typ relacji / rola *</p>
                <div className="flex flex-wrap gap-1.5">
                  {MEDIA_ROLES.map((r) => (
                    <span key={r.value} className="text-[11px] border rounded px-2 py-0.5 text-slate-600">{r.label}</span>
                  ))}
                </div>
              </div>
            )}

            {bySection[section.id].map((f) => (
              <div key={f.key}>
                <p className="text-[11px] text-slate-500">
                  {f.label}{f.required ? " *" : ""}
                </p>
                {f.type === "checkbox" ? (
                  <div className="h-4 w-4 border rounded bg-slate-50" />
                ) : f.type === "textarea" ? (
                  <div className="h-10 border rounded bg-slate-50" />
                ) : (
                  <div className="h-7 border rounded bg-slate-50" />
                )}
              </div>
            ))}

            {section.id === "consents" && (
              <div className="space-y-1.5 text-[11px] text-slate-600">
                {termsText && <p>☐ Akceptuję regulamin *</p>}
                <p>☐ Zgoda na przetwarzanie danych osobowych *</p>
                <p>☐ Zgoda marketingowa (opcjonalnie)</p>
              </div>
            )}
          </div>
        ))}

        <button
          className="w-full text-white font-semibold py-2 rounded-lg text-sm"
          style={{ backgroundColor: primaryColor }}
          disabled
        >
          Wyślij zgłoszenie
        </button>
      </div>
    </div>
  );
};

export default LandingPageBuilder;
