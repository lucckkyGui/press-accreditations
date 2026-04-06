import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Eye, Sparkles, Crown } from "lucide-react";

export type TemplateType = "basic" | "elegant" | "minimal" | "corporate" | "casual" | "festival" | "gala" | "tech-conference";

type InvitationTemplate = {
  id: TemplateType;
  name: string;
  description: string;
  category: "free" | "premium";
  colors: { primary: string; accent: string };
  previewStyle: React.CSSProperties;
};

const templates: InvitationTemplate[] = [
  {
    id: "basic",
    name: "Podstawowy",
    description: "Prosty, przejrzysty układ z logiem na górze",
    category: "free",
    colors: { primary: "#7c6ce7", accent: "#38b2ac" },
    previewStyle: { background: "linear-gradient(135deg, #7c6ce7 0%, #38b2ac 100%)" },
  },
  {
    id: "elegant",
    name: "Elegancki",
    description: "Stonowane kolory, delikatne elementy ozdobne",
    category: "free",
    colors: { primary: "#1e1b3a", accent: "#c9a962" },
    previewStyle: { background: "linear-gradient(135deg, #1e1b3a 0%, #2d2854 50%, #c9a962 100%)" },
  },
  {
    id: "minimal",
    name: "Minimalistyczny",
    description: "Jak najmniej elementów, maksimum treści",
    category: "free",
    colors: { primary: "#111", accent: "#e5e5e5" },
    previewStyle: { background: "#fafafa", border: "2px solid #111" },
  },
  {
    id: "corporate",
    name: "Korporacyjny",
    description: "Profesjonalny wygląd dla wydarzeń biznesowych",
    category: "free",
    colors: { primary: "#0f4c81", accent: "#00b894" },
    previewStyle: { background: "linear-gradient(180deg, #0f4c81 0%, #1a6db5 100%)" },
  },
  {
    id: "casual",
    name: "Casual",
    description: "Swobodny styl dla nieformalnych wydarzeń",
    category: "free",
    colors: { primary: "#ff6b6b", accent: "#feca57" },
    previewStyle: { background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)" },
  },
  {
    id: "festival",
    name: "Festiwalowy",
    description: "Żywe kolory i dynamiczny układ dla festiwali",
    category: "premium",
    colors: { primary: "#e91e63", accent: "#ff9800" },
    previewStyle: { background: "linear-gradient(135deg, #e91e63 0%, #ff9800 50%, #ffeb3b 100%)" },
  },
  {
    id: "gala",
    name: "Gala & VIP",
    description: "Luksusowy szablon na gale i eventy VIP",
    category: "premium",
    colors: { primary: "#0d0d0d", accent: "#d4af37" },
    previewStyle: { background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a2e 50%, #d4af37 100%)" },
  },
  {
    id: "tech-conference",
    name: "Tech Conference",
    description: "Nowoczesny, technologiczny design",
    category: "premium",
    colors: { primary: "#00d2ff", accent: "#7b2ff7" },
    previewStyle: { background: "linear-gradient(135deg, #0a0a2e 0%, #00d2ff 50%, #7b2ff7 100%)" },
  },
];

type InvitationTemplatesProps = {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  isPremiumUser?: boolean;
};

const InvitationTemplates: React.FC<InvitationTemplatesProps> = ({
  selectedTemplate,
  onSelectTemplate,
  isPremiumUser = false,
}) => {
  const [previewTemplate, setPreviewTemplate] = React.useState<TemplateType | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span>{templates.length} szablonów — {templates.filter(t => t.category === "free").length} darmowych, {templates.filter(t => t.category === "premium").length} premium</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => {
          const isLocked = template.category === "premium" && !isPremiumUser;
          const isSelected = selectedTemplate === template.id;

          return (
            <Card
              key={template.id}
              className={`overflow-hidden transition-all cursor-pointer group ${
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:border-primary/50 hover:shadow-md"
              } ${isLocked ? "opacity-75" : ""}`}
              onClick={() => !isLocked && onSelectTemplate(template.id)}
            >
              <div
                className="relative aspect-[3/2] overflow-hidden flex items-center justify-center"
                style={template.previewStyle}
              >
                {/* Mini preview layout */}
                <div className="text-center text-white p-4 relative z-10">
                  <div className="w-8 h-1 bg-white/60 rounded mx-auto mb-2" />
                  <div className="text-xs font-bold opacity-90">ZAPROSZENIE</div>
                  <div className="w-12 h-0.5 bg-white/40 rounded mx-auto mt-1 mb-1" />
                  <div className="w-6 h-6 border border-white/40 rounded mx-auto mt-2" />
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {template.category === "premium" && (
                    <Badge variant="secondary" className="bg-amber-500/90 text-white text-[10px] px-1.5">
                      <Crown className="h-3 w-3 mr-0.5" />
                      PRO
                    </Badge>
                  )}
                </div>

                {isSelected && (
                  <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}

                {/* Hover preview */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template.id);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Podgląd
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{template.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </p>
                {isLocked && (
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    Wymaga planu Professional
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default InvitationTemplates;
