
import React from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { toast } from "sonner";

interface LanguageSwitcherProps {
  variant?: "icon" | "full" | "compact";
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = "full" }) => {
  const { locale, changeLocale, supportedLanguages, t } = useI18n();

  const handleLanguageChange = (newLocale: typeof locale) => {
    if (newLocale !== locale) {
      changeLocale(newLocale);
      const selectedLang = supportedLanguages.find(lang => lang.code === newLocale);
      toast.success(`Język zmieniony na ${selectedLang?.native || newLocale}`);
    }
  };

  const currentLanguage = supportedLanguages.find(lang => lang.code === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={variant === "icon" ? "icon" : "sm"} className="gap-2">
          <Languages className="h-4 w-4" />
          {variant === "full" && currentLanguage && (
            <>
              <span className="mr-1">{currentLanguage.flag}</span>
              <span>{currentLanguage.native}</span>
            </>
          )}
          {variant === "compact" && currentLanguage && (
            <span>{currentLanguage.flag}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background max-h-80 overflow-y-auto">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="gap-2 cursor-pointer"
          >
            <span>{lang.flag}</span>
            <span>{lang.native}</span>
            <span className="text-xs text-muted-foreground ml-auto">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
