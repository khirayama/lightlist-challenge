import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CollaborativeService } from '@lightlist/sdk';
import { authService } from '../lib/auth';

// CollaborativeServiceから必要な型をインポート
export interface Task {
  id: string;
  content: string;
  completed: boolean;
  dueDate: number | null;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface CollaborativeContextType {
  doc: any | null;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

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

        // 定期同期を開始
        startPeriodicSync();
        
        setLastSyncTime(new Date());
      } catch (err) {
        console.error('Failed to initialize collaborative service:', err);
        setError(err instanceof Error ? err.message : 'Initialization failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCollaborativeService();

    return () => {
      // クリーンアップ
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [taskListId]);

  const startPeriodicSync = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(async () => {
      if (serviceRef.current) {
        await performSync();
      }
    }, 5000); // 5秒間隔で同期
  };

  const performSync = useCallback(async () => {
    if (!serviceRef.current || isSyncing) {
      return;
    }

    try {
      setIsSyncing(true);
      await serviceRef.current.sync();
      setLastSyncTime(new Date());
      setError(null);
    } catch (err) {
      console.error('Sync failed:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

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

export function useCollaborativeTasks(): {
  tasks: Task[];
  addTask: (content: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
} {
  const { doc, service } = useCollaborative();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!doc) return;

    const updateTasks = () => {
      if (service) {
        const currentTasks = service.getTasks();
        setTasks(currentTasks);
      }
    };

    // 初期タスク読み込み
    updateTasks();

    // Yjsの変更を監視
    const tasksArray = doc.getArray('tasks');
    const handleUpdate = () => {
      updateTasks();
    };

    tasksArray.observe(handleUpdate);

    return () => {
      tasksArray.unobserve(handleUpdate);
    };
  }, [doc, service]);

  const addTask = useCallback((content: string) => {
    if (service) {
      service.addTask(content);
    }
  }, [service]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    if (service) {
      service.updateTask(taskId, updates);
    }
  }, [service]);

  const deleteTask = useCallback((taskId: string) => {
    if (service) {
      service.deleteTask(taskId);
    }
  }, [service]);

  const toggleTask = useCallback((taskId: string) => {
    if (service) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        service.updateTask(taskId, { completed: !task.completed });
      }
    }
  }, [service, tasks]);

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}