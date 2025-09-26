// i18n configuration and utilities
export const languages = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  fr: { name: 'Français', flag: '🇫🇷' },
  zh: { name: '中文', flag: '🇨🇳' }
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'en';

// Function to load translations
export async function loadTranslations(lang: Language) {
  try {
    const translations = await import(`../public/locales/${lang}/common.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for ${lang}`, error);
    // Fallback to English
    const fallback = await import(`../public/locales/en/common.json`);
    return fallback.default;
  }
}

// Get nested translation value
export function getTranslation(translations: any, key: string): string {
  const keys = key.split('.');
  let value = translations;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return the key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}