
import React from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { toast } from "sonner";

interface LanguageSwitcherProps {
  variant?: "icon" | "full";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = "full" }) => {
  const { locale, changeLocale, locales, t } = useI18n();
  
  const getLanguageName = (code: string) => {
    switch (code) {
      case "pl": return "Polski";
      case "en": return "English";
      default: return code.toUpperCase();
    }
  };
  
  const getLanguageFlag = (code: string) => {
    switch (code) {
      case "pl": return "🇵🇱";
      case "en": return "🇬🇧";
      default: return "🌐";
    }
  };

  const handleLanguageChange = (newLocale: typeof locale) => {
    if (newLocale !== locale) {
      changeLocale(newLocale);
      toast.success(t('notifications.languageChanged').replace('{language}', getLanguageName(newLocale)));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={variant === "icon" ? "icon" : "sm"} className="gap-2">
          <Languages className="h-4 w-4" />
          {variant === "full" && (
            <>
              <span className="mr-1">{getLanguageFlag(locale)}</span>
              <span>{getLanguageName(locale)}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background">
        {locales.map((loc) => (
          <DropdownMenuItem 
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className="gap-2 cursor-pointer"
          >
            <span>{getLanguageFlag(loc)}</span>
            <span>{getLanguageName(loc)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
