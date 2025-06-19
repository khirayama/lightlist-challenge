'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';

interface SharedTaskListPageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export default function SharedTaskListPage({ params: paramsPromise }: SharedTaskListPageProps) {
  const [shareToken, setShareToken] = useState<string | null>(null);
  const { t } = useTranslation('common');
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { showError, showInfo } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [taskListInfo, setTaskListInfo] = useState<{
    id: string;
    name: string;
    permission: string;
  } | null>(null);

  useEffect(() => {
    const loadParams = async () => {
      const params = await paramsPromise;
      setShareToken(params.shareToken);
    };
    loadParams();
  }, [paramsPromise]);

  useEffect(() => {
    const fetchSharedTaskList = async () => {
      if (!shareToken) return;
      
      try {
        setIsLoading(true);
        // TODO: APIを呼び出して共有タスクリスト情報を取得
        // const response = await fetch(`/api/share/${shareToken}`);
        // const data = await response.json();
        // setTaskListInfo(data.taskList);
        
        // 仮のデータをセット
        setTaskListInfo({
          id: 'dummy-id',
          name: 'サンプル共有タスクリスト',
          permission: 'edit'
        });
        
        showInfo(t('share.accessingSharedList'));
      } catch (error) {
        console.error('Failed to fetch shared task list:', error);
        showError(t('share.accessError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchSharedTaskList();
    }
  }, [shareToken, showError, showInfo, t]);

  const handleJoinTaskList = async () => {
    if (!isAuthenticated) {
      // 未認証の場合はログインページへ
      router.push(`/login?redirect=/share/${shareToken}`);
      return;
    }

    try {
      // TODO: タスクリストに参加する処理
      showInfo(t('share.joinSuccess'));
      router.push('/');
    } catch (error) {
      console.error('Failed to join task list:', error);
      showError(t('share.joinError'));
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary dark:text-gray-300">{t('common.loading')}</p>
        </div>
      </main>
    );
  }

  if (!taskListInfo) {
    return (
      <main className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary dark:text-white mb-4">
            {t('share.notFound')}
          </h1>
          <p className="text-text-secondary dark:text-gray-300 mb-6">
            {t('share.notFoundDescription')}
          </p>
          <a 
            href="/"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            {t('common.backToHome')}
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface dark:bg-gray-800 rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-text-primary dark:text-white mb-2">
          {t('share.joinTaskList')}
        </h1>
        <p className="text-text-secondary dark:text-gray-300 mb-6">
          {t('share.invitedToJoin')}
        </p>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white mb-2">
            {taskListInfo.name}
          </h2>
          <p className="text-sm text-text-secondary dark:text-gray-300">
            {t('share.permission')}: {t(`share.permission.${taskListInfo.permission}`)}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleJoinTaskList}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            {isAuthenticated ? t('share.joinButton') : t('share.loginToJoin')}
          </button>
          <a
            href="/"
            className="block text-center text-text-secondary dark:text-gray-300 hover:text-primary transition-colors"
          >
            {t('common.cancel')}
          </a>
        </div>
      </div>
    </main>
  );
}