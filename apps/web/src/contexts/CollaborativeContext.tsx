'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CollaborativeService, Task, CollaborativeContextType } from '@lightlist/sdk';
import { authService } from '@/lib/auth';

interface CollaborativeProviderProps {
  children: React.ReactNode;
  taskListId?: string;
}

interface ExtendedCollaborativeContextType extends CollaborativeContextType {
  service: CollaborativeService | null;
}

const CollaborativeContext = createContext<ExtendedCollaborativeContextType | null>(null);

export function CollaborativeProvider({ children, taskListId }: CollaborativeProviderProps) {
  const [doc, setDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const serviceRef = useRef<CollaborativeService | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 初期化とクリーンアップ
  useEffect(() => {
    if (!taskListId) {
      return;
    }

    const initializeCollaborativeService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // サービスを初期化
        const service = new CollaborativeService(
          taskListId,
          authService.fetch.bind(authService)
        );
        serviceRef.current = service;

        // 完全な状態を取得
        await service.fetchFullState();
        
        // ドキュメントを設定
        setDoc(service.getDoc());

        // 定期同期を開始（5秒間隔）
        const syncInterval = setInterval(async () => {
          if (serviceRef.current) {
            try {
              setIsSyncing(true);
              await serviceRef.current.sync();
              setLastSyncTime(new Date());
              setError(null);
            } catch (syncError) {
              console.error('Sync error:', syncError);
              setError(syncError instanceof Error ? syncError.message : 'Sync failed');
            } finally {
              setIsSyncing(false);
            }
          }
        }, 5000);

        syncIntervalRef.current = syncInterval;
      } catch (initError) {
        console.error('Failed to initialize collaborative service:', initError);
        setError(initError instanceof Error ? initError.message : 'Initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCollaborativeService();

    // クリーンアップ
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      
      if (serviceRef.current) {
        serviceRef.current.destroy();
        serviceRef.current = null;
      }
      
      setDoc(null);
    };
  }, [taskListId]);

  const value: ExtendedCollaborativeContextType = {
    doc,
    isLoading,
    isSyncing,
    lastSyncTime,
    error,
    service: serviceRef.current,
  };

  return (
    <CollaborativeContext.Provider value={value}>
      {children}
    </CollaborativeContext.Provider>
  );
}

export function useCollaborative(): ExtendedCollaborativeContextType {
  const context = useContext(CollaborativeContext);
  if (!context) {
    throw new Error('useCollaborative must be used within a CollaborativeProvider');
  }
  return context;
}

// タスク操作フック
export function useCollaborativeTasks() {
  const { doc, service } = useCollaborative();
  const [tasks, setTasks] = useState<Task[]>([]);

  // タスクリストの変更を監視
  useEffect(() => {
    if (!doc) {
      setTasks([]);
      return;
    }

    const updateTasks = () => {
      const tasksArray = doc.getArray('tasks');
      const taskList: Task[] = tasksArray.toArray().map((taskMap: any) => ({
        id: taskMap.get('id'),
        content: taskMap.get('content'),
        completed: taskMap.get('completed'),
        order: taskMap.get('order'),
        createdAt: taskMap.get('createdAt'),
        updatedAt: taskMap.get('updatedAt'),
        dueDate: taskMap.get('dueDate'),
      }));
      
      // 順序でソート
      taskList.sort((a, b) => a.order - b.order);
      setTasks(taskList);
    };

    // 初回読み込み
    updateTasks();

    // 変更を監視
    const unsubscribe = doc.on('update', updateTasks);

    return () => {
      doc.off('update', unsubscribe);
    };
  }, [doc]);

  // タスク操作関数
  const addTask = useCallback((content: string, order?: number): string | null => {
    if (!doc || !service) return null;

    return service.addTask(content, order);
  }, [doc, service]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>): boolean => {
    if (!doc || !service) return false;

    return service.updateTask(taskId, updates);
  }, [doc, service]);

  const deleteTask = useCallback((taskId: string): boolean => {
    if (!doc || !service) return false;

    return service.deleteTask(taskId);
  }, [doc, service]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
  };
}