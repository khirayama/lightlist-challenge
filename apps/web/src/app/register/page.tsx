'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { LoadingButton } from '@/components/Loading';

export default function RegisterPage() {
  const { t } = useTranslation('common');
  const { register, isLoading } = useAuth();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      const errorMessage = t('auth.passwordMismatch');
      setError(errorMessage);
      showError(errorMessage);
      return;
    }

    try {
      await register(formData.email, formData.password);
      showSuccess(t('auth.registerSuccess'));
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.registerError');
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-surface dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-text-primary dark:text-white">
            {t('auth.register')}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                {t('auth.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                {t('auth.password')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-1">
                {t('auth.confirmPassword')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <LoadingButton
              type="submit"
              loading={isLoading}
              className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('auth.registering') : t('auth.register')}
            </LoadingButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-text-secondary dark:text-gray-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <a href="/login" className="text-primary hover:text-primary-600 font-medium">
                {t('auth.login')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}