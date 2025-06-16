import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const changeLanguage = async (language: string) => {
    await AsyncStorage.setItem('language', language);
    await i18n.changeLanguage(language);
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
  };
};