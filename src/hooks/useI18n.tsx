
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { pl } from "../i18n/pl";
import { en } from "../i18n/en";
import { es } from "../i18n/es";
import { zh } from "../i18n/zh";
import { hi } from "../i18n/hi";
import { ar } from "../i18n/ar";
import { pt } from "../i18n/pt";
import { ru } from "../i18n/ru";
import { ja } from "../i18n/ja";
import { de } from "../i18n/de";
import { supportedLanguages, type SupportedLanguage } from "../i18n/languages";

// Create a type that represents the full translation structure
export type TranslationsType = typeof en;

interface I18nContextType {
  locale: SupportedLanguage;
  currentLanguage: SupportedLanguage;
  t: (key: string, replacements?: Record<string, string>) => string;
  changeLocale: (locale: SupportedLanguage) => void;
  locales: SupportedLanguage[];
  supportedLanguages: typeof supportedLanguages;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Helper function to get nested values from an object using dot notation
const getNestedValue = (obj: any, path: string): string => {
  const keys = path.split('.');
  return keys.reduce((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return acc[key];
    }
    return path; // Fallback to the key itself if not found
  }, obj);
};

// Helper function to replace placeholders in translation strings
const applyReplacements = (text: string, replacements?: Record<string, string>): string => {
  if (!replacements) return text;
  
  return Object.entries(replacements).reduce((result, [key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    return result.replace(regex, value);
  }, text);
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  // Default locale from browser or localStorage
  const getDefaultLocale = (): SupportedLanguage => {
    const savedLocale = localStorage.getItem("locale") as SupportedLanguage | null;
    if (savedLocale && supportedLanguages.some(lang => lang.code === savedLocale)) {
      return savedLocale;
    }
    
    // Based on browser language
    const browserLang = navigator.language.split("-")[0];
    const supportedLang = supportedLanguages.find(lang => lang.code === browserLang);
    return supportedLang ? supportedLang.code : "en";
  };

  const [locale, setLocale] = useState<SupportedLanguage>(getDefaultLocale());
  
  const getTranslations = (locale: SupportedLanguage): any => {
    switch (locale) {
      case 'pl': return pl;
      case 'en': return en;
      case 'es': return es;
      case 'zh': return zh;
      case 'hi': return hi;
      case 'ar': return ar;
      case 'pt': return pt;
      case 'ru': return ru;
      case 'ja': return ja;
      case 'de': return de;
      default: return en; // Fallback dla innych języków
    }
  };

  const [translations, setTranslations] = useState<any>(getTranslations(locale));
  
  const changeLocale = (newLocale: SupportedLanguage) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
    
    // Update translations based on locale
    setTranslations(getTranslations(newLocale));
    
    // Add a visual feedback for language change
    document.documentElement.classList.add('language-transition');
    setTimeout(() => {
      document.documentElement.classList.remove('language-transition');
    }, 1000);
  };
  
  const t = (key: string, replacements?: Record<string, string>): string => {
    const value = getNestedValue(translations, key);
    return applyReplacements(value, replacements);
  };
  
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  
  return (
    <I18nContext.Provider value={{ 
      locale, 
      currentLanguage: locale,
      t, 
      changeLocale, 
      locales: supportedLanguages.map(lang => lang.code),
      supportedLanguages
    }}>
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
