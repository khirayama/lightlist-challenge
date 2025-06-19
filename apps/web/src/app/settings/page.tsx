'use client';

import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { LoadingButton } from '@/components/Loading';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Settings() {
  const { t, i18n } = useTranslation('common');
  const { theme, setTheme, themes } = useTheme();
  const { user, isAuthenticated, refreshAuth, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [taskInsertPosition, setTaskInsertPosition] = useState<'top' | 'bottom'>('top');
  const [autoSort, setAutoSort] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ログイン時に設定とプロフィールを取得
  useEffect(() => {
    if (isAuthenticated && user) {
      loadSettings();
      loadProfile();
    }
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    if (!user) return;
    
    try {
      const response = await authService.getSettings(user.id);
      setTheme(response.settings.theme);
      i18n.changeLanguage(response.settings.language);
      setTaskInsertPosition(response.settings.taskInsertPosition || 'top');
      setAutoSort(response.settings.autoSort || false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showError(t('settings.loadError'));
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const profile = await authService.getProfile(user.id);
      setName(profile.name || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      showError(t('settings.profile.loadError'));
    }
  };

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    
    if (isAuthenticated && user) {
      try {
        setIsLoading(true);
        await authService.updateSettings(user.id, { language: lang as 'ja' | 'en' });
        showSuccess(t('settings.language.updateSuccess'));
      } catch (error) {
        console.error('Failed to update language:', error);
        showError(t('settings.language.updateError'));
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
        showSuccess(t('settings.theme.updateSuccess'));
      } catch (error) {
        console.error('Failed to update theme:', error);
        showError(t('settings.theme.updateError'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNameUpdate = async () => {
    if (!user || !name.trim()) return;
    
    try {
      setIsProfileLoading(true);
      const updatedUser = await authService.updateProfile(user.id, { name: name.trim() });
      
      // localStorageとAuthContextのユーザー情報を更新
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedCurrentUser = { ...currentUser, name: updatedUser.name };
        authService.setCurrentUser(updatedCurrentUser);
        await refreshAuth();
      }
      showSuccess(t('settings.profile.updateSuccess'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError(t('settings.profile.updateError'));
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleTaskSettingsUpdate = async (updates: { taskInsertPosition?: 'top' | 'bottom'; autoSort?: boolean }) => {
    if (!user) return;
    
    try {
      setIsSettingsLoading(true);
      await authService.updateSettings(user.id, updates);
      
      if (updates.taskInsertPosition !== undefined) {
        setTaskInsertPosition(updates.taskInsertPosition);
      }
      if (updates.autoSort !== undefined) {
        setAutoSort(updates.autoSort);
      }
      
      showSuccess(t('settings.task.updateSuccess'));
    } catch (error) {
      console.error('Failed to update task settings:', error);
      showError(t('settings.task.updateError'));
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm(t('auth.logoutConfirm'))) {
      try {
        setIsLoading(true);
        await logout();
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
        showError(t('auth.logoutError'));
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
          {/* プロフィール設定 */}
          {isAuthenticated && (
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border dark:border-gray-700">
              <h2 className="text-xl font-semibold text-text-primary dark:text-white mb-4">
                {t('settings.profile.title')}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-2">
                    {t('settings.profile.name')}
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('settings.profile.namePlaceholder')}
                      disabled={isProfileLoading}
                      className="flex-1 px-3 py-2 border border-border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:opacity-50 bg-background dark:bg-gray-700 text-text-primary dark:text-white"
                    />
                    <LoadingButton
                      onClick={handleNameUpdate}
                      loading={isProfileLoading}
                      disabled={!name.trim()}
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProfileLoading ? t('common.updating') : t('common.update')}
                    </LoadingButton>
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* タスク設定 */}
          {isAuthenticated && (
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border dark:border-gray-700">
              <h2 className="text-xl font-semibold text-text-primary dark:text-white mb-4">
                {t('settings.task.title')}
              </h2>
              <div className="space-y-6">
                {/* タスクの挿入位置 */}
                <div>
                  <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-3">
                    {t('settings.task.insertPosition')}
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'top', label: 'settings.task.insertTop' },
                      { value: 'bottom', label: 'settings.task.insertBottom' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="taskInsertPosition"
                          value={option.value}
                          checked={taskInsertPosition === option.value}
                          onChange={() => handleTaskSettingsUpdate({ taskInsertPosition: option.value as 'top' | 'bottom' })}
                          disabled={isSettingsLoading}
                          className="w-4 h-4 text-primary border-border dark:border-gray-600 focus:ring-primary disabled:opacity-50"
                        />
                        <span className="text-text-primary dark:text-gray-300">
                          {t(option.label)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 自動並び替え */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSort}
                      onChange={(e) => handleTaskSettingsUpdate({ autoSort: e.target.checked })}
                      disabled={isSettingsLoading}
                      className="w-4 h-4 text-primary border-border dark:border-gray-600 rounded focus:ring-primary disabled:opacity-50"
                    />
                    <div>
                      <span className="text-text-primary dark:text-gray-300 font-medium">
                        {t('settings.task.autoSort')}
                      </span>
                      <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                        {t('settings.task.autoSortDescription')}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ログアウト */}
          {isAuthenticated && (
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-lg shadow-md border border-border dark:border-gray-700">
              <h2 className="text-xl font-semibold text-text-primary dark:text-white mb-4">
                {t('auth.logout')}
              </h2>
              <p className="text-text-secondary dark:text-gray-400 mb-4">
                {t('settings.logout.description')}
              </p>
              <LoadingButton
                onClick={handleLogout}
                loading={isLoading}
                className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('common.processing') : t('auth.logout')}
              </LoadingButton>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}