
export const supportedLanguages = [
  { code: 'pl', name: 'Polski', flag: '🇵🇱', native: 'Polski' },
  { code: 'en', name: 'English', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', native: 'Español' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳', native: '中文' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', native: 'العربية' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', native: 'Português' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', native: 'Русский' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', native: '日本語' },
  { code: 'de', name: 'German', flag: '🇩🇪', native: 'Deutsch' }
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];
