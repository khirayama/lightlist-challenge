import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enCommon from './locales/en/common.json';
import jaCommon from './locales/ja/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  ja: {
    common: jaCommon,
  },
};

const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem('language');
  
  if (!savedLanguage) {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    savedLanguage = ['ja', 'en'].includes(deviceLanguage) ? deviceLanguage : 'en';
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    debug: __DEV__,
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });
};

export { initI18n };
export default i18n;