'use client';

import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-24 bg-background dark:bg-gray-900">
      <div className="max-w-4xl w-full flex flex-col items-center justify-center">
        <h1 className="text-4xl lg:text-5xl font-bold text-center mb-8 text-text-primary dark:text-white">
          {t('home.title')}
        </h1>
        <div className="text-center">
          <p className="text-lg text-text-secondary dark:text-gray-300 mb-6">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/settings" 
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              {t('home.goToSettings')}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}