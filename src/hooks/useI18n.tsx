
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { pl } from "../i18n/pl";
import { en } from "../i18n/en";

type Locale = "pl" | "en";
type Translations = typeof pl;

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  changeLocale: (locale: Locale) => void;
  locales: Locale[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key];
    }
    return path; // Fallback to the key itself if not found
  }, obj);
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  // Default locale from browser or localStorage
  const getDefaultLocale = (): Locale => {
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    if (savedLocale && ["pl", "en"].includes(savedLocale)) {
      return savedLocale;
    }
    
    // Based on browser language
    const browserLang = navigator.language.split("-")[0];
    return browserLang === "pl" ? "pl" : "en";
  };

  const [locale, setLocale] = useState<Locale>(getDefaultLocale());
  const [translations, setTranslations] = useState<Translations>(locale === "pl" ? pl : en);
  
  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    setTranslations(newLocale === "pl" ? pl : en);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  };
  
  const t = (key: string): string => {
    return getNestedValue(translations, key);
  };
  
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  
  return (
    <I18nContext.Provider value={{ locale, t, changeLocale, locales: ["pl", "en"] }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
