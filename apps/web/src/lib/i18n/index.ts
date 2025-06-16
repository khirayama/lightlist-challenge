import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import jaCommon from './locales/ja/common.json';
import enCommon from './locales/en/common.json';

const resources = {
  ja: {
    common: jaCommon,
  },
  en: {
    common: enCommon,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'ja', // Default language
    lng: 'ja', // Initial language
    
    // Common i18next options
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },
    
    // LanguageDetector options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    // Namespace
    defaultNS: 'common',
    ns: ['common'],
  });

export default i18n;