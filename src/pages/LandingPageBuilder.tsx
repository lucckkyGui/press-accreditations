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
  Plus, Trash2, GripVertical, ExternalLink, Loader2, Save
} from "lucide-react";

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

const DEFAULT_FORM_CONFIG: FormConfig = {
  fields: [
    { key: "first_name", label: "Imię", type: "text", required: true, visible: true },
    { key: "last_name", label: "Nazwisko", type: "text", required: true, visible: true },
    { key: "email", label: "Email", type: "email", required: true, visible: true },
    { key: "media_organization", label: "Redakcja / Medium", type: "text", required: true, visible: true },
    { key: "job_title", label: "Stanowisko", type: "text", required: false, visible: true },
    { key: "phone", label: "Telefon", type: "tel", required: false, visible: false },
    { key: "social_media", label: "Social media", type: "textarea", required: false, visible: false },
    { key: "portfolio_url", label: "Portfolio / Strona", type: "url", required: false, visible: false },
    { key: "coverage_description", label: "Opis planowanej relacji", type: "textarea", required: false, visible: true },
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
                  className="max-w-[200px] h-8 text-sm font-mono"
                  placeholder="nazwa-wydarzenia"
                />
              </div>
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
      </Tabs>
    </div>
  );
};

export default LandingPageBuilder;
