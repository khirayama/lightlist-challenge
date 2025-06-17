'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';

export default function Settings() {
  const { t, i18n } = useTranslation('common');
  const { theme, setTheme, themes } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ログイン時に設定を取得
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSettings();
    }
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const settings = await authService.getSettings(user.id);
      setTheme(settings.theme);
      i18n.changeLanguage(settings.language);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    
    if (isAuthenticated && user) {
      try {
        setIsLoading(true);
        await authService.updateSettings(user.id, { language: lang as 'ja' | 'en' });
      } catch (error) {
        console.error('Failed to update language:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    
    if (isAuthenticated && user) {
      try {
        setIsLoading(true);
        await authService.updateSettings(user.id, { theme: newTheme as 'system' | 'light' | 'dark' });
      } catch (error) {
        console.error('Failed to update theme:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background dark:bg-gray-900 p-6 lg:p-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-4">
            {t('settings.title')}
          </h1>
          <a 
            href="/" 
            className="text-primary hover:text-primary-600 transition-colors"
          >
            ← {t('settings.backToHome')}
          </a>
        </div>

        <div className="space-y-8">
          {/* テーマ設定 */}
          <div className="bg-surface dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border dark:border-gray-700">
            <h2 className="text-xl font-semibold text-text-primary dark:text-white mb-4">
              {t('settings.theme.title')}
            </h2>
            <div className="space-y-3">
              {['system', 'light', 'dark'].map((themeOption) => (
                <label
                  key={themeOption}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="theme"
                    value={themeOption}
                    checked={theme === themeOption}
                    onChange={() => handleThemeChange(themeOption)}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary border-border dark:border-gray-600 focus:ring-primary disabled:opacity-50"
                  />
                  <span className="text-text-primary dark:text-gray-300">
                    {t(`settings.theme.${themeOption}`)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 言語設定 */}
          <div className="bg-surface dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border dark:border-gray-700">
            <h2 className="text-xl font-semibold text-text-primary dark:text-white mb-4">
              {t('settings.language.title')}
            </h2>
            <div className="space-y-3">
              {[
                { code: 'ja', label: 'settings.language.japanese' },
                { code: 'en', label: 'settings.language.english' },
              ].map((lang) => (
                <label
                  key={lang.code}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang.code}
                    checked={i18n.language === lang.code}
                    onChange={() => handleLanguageChange(lang.code)}
                    disabled={isLoading}
                    className="w-4 h-4 text-primary border-border dark:border-gray-600 focus:ring-primary disabled:opacity-50"
                  />
                  <span className="text-text-primary dark:text-gray-300">
                    {t(lang.label)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}