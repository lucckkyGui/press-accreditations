/**
 * AISuggestionCard.tsx — karta z sugestią dla organizatora.
 *
 * Wzorzec wizualny: artboard "Dashboard · real-time" prawy dolny.
 *
 * Otrzymuje w propsach treść — może być wygenerowana przez backend AI
 * albo regułową heurystykę (np. kolejka > 14 osób → "Otwórz drugą bramkę").
 */

import React from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AISuggestionCardProps {
  title: string;
  body: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  /** Override the eyebrow label. Default: "SUGESTIA AI" */
  eyebrow?: string;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = ({
  title,
  body,
  primaryAction,
  secondaryAction,
  eyebrow = "SUGESTIA AI",
}) => {
  return (
    <div className="card-glow rounded-xl p-4 relative">
      <div className="relative">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap className="h-3.5 w-3.5 text-primary fill-primary" />
          <span className="mono text-[10.5px] tracking-wider text-primary">{eyebrow}</span>
        </div>

        <div className="text-[14px] text-foreground leading-snug font-medium mb-1">{title}</div>
        <div className="text-[13px] text-muted-foreground leading-relaxed">{body}</div>

        {(primaryAction || secondaryAction) && (
          <div className="flex gap-2 mt-3">
            {primaryAction && (
              <Button
                size="sm"
                className="rounded-md h-8 px-3 gap-1.5 bg-primary hover:bg-primary/90 glow-accent"
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-md h-8 px-3 text-muted-foreground hover:text-foreground"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestionCard;
