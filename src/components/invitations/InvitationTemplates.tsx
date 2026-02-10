
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export type TemplateType = "basic" | "elegant" | "minimal" | "corporate" | "casual";

type InvitationTemplate = {
  id: TemplateType;
  name: string;
  description: string;
  previewImage: string;
};

const templates: InvitationTemplate[] = [
  {
    id: "basic",
    name: "Podstawowy",
    description: "Prosty, przejrzysty układ z logiem na górze",
    previewImage: "/placeholder.svg",
  },
  {
    id: "elegant",
    name: "Elegancki",
    description: "Stonowane kolory, delikatne elementy ozdobne",
    previewImage: "/placeholder.svg",
  },
  {
    id: "minimal",
    name: "Minimalistyczny",
    description: "Jak najmniej elementów, maksimum treści",
    previewImage: "/placeholder.svg",
  },
  {
    id: "corporate",
    name: "Korporacyjny",
    description: "Profesjonalny wygląd dla wydarzeń biznesowych",
    previewImage: "/placeholder.svg",
  },
  {
    id: "casual",
    name: "Casual",
    description: "Swobodny styl dla nieformalnych wydarzeń",
    previewImage: "/placeholder.svg",
  },
];

type InvitationTemplatesProps = {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
};

const InvitationTemplates: React.FC<InvitationTemplatesProps> = ({
  selectedTemplate,
  onSelectTemplate,
}) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <Card
          key={template.id}
          className={`overflow-hidden transition-all ${
            selectedTemplate === template.id
              ? "ring-2 ring-primary"
              : "hover:border-primary/50"
          }`}
        >
          <div className="relative aspect-[3/2] overflow-hidden bg-muted">
            <img
              src={template.previewImage}
              alt={template.name}
              className="h-full w-full object-cover"
            />
            {selectedTemplate === template.id && (
              <div className="absolute right-2 top-2 rounded-full bg-primary p-1">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="mb-2 font-medium">{template.name}</div>
            <p className="mb-4 text-sm text-muted-foreground">
              {template.description}
            </p>
            <Button
              variant={selectedTemplate === template.id ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() => onSelectTemplate(template.id)}
            >
              {selectedTemplate === template.id ? "Wybrano" : "Wybierz"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default InvitationTemplates;
