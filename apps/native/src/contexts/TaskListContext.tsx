import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskListService, ApiTaskList, ApiTask, CreateTaskListRequest, CreateTaskRequest, UpdateTaskRequest } from '@lightlist/sdk';
import { authService } from '../lib/auth';

interface TaskListContextType {
  taskLists: ApiTaskList[];
  currentTaskListId: string | null;
  currentTasks: ApiTask[];
  isLoading: boolean;
  error: string | null;
  
  // Task List operations
  fetchTaskLists: () => Promise<void>;
  createTaskList: (request: CreateTaskListRequest) => Promise<ApiTaskList>;
  selectTaskList: (taskListId: string) => Promise<void>;
  
  // Task operations
  createTask: (content: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<UpdateTaskRequest>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TaskListContext = createContext<TaskListContextType | undefined>(undefined);

export const useTaskList = (): TaskListContextType => {
  const context = useContext(TaskListContext);
  if (context === undefined) {
    throw new Error('useTaskList must be used within a TaskListProvider');
  }
  return context;
};

interface TaskListProviderProps {
  children: ReactNode;
}

// TaskListServiceインスタンスを作成
const taskListService = new TaskListService(
  authService.fetch.bind(authService),
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'
);

export const TaskListProvider: React.FC<TaskListProviderProps> = ({ children }) => {
  const [taskLists, setTaskLists] = useState<ApiTaskList[]>([]);
  const [currentTaskListId, setCurrentTaskListId] = useState<string | null>(null);
  const [currentTasks, setCurrentTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskLists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const lists = await taskListService.getTaskLists();
      setTaskLists(lists);
      
      // 最初のタスクリストを自動選択
      if (lists.length > 0 && !currentTaskListId) {
        setCurrentTaskListId(lists[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task lists');
    } finally {
      setIsLoading(false);
    }
  };

  const createTaskList = async (request: CreateTaskListRequest): Promise<ApiTaskList> => {
    try {
      setIsLoading(true);
      setError(null);
      const newTaskList = await taskListService.createTaskList(request);
      // 新しいタスクリストを先頭に追加（最近作成したものを上に表示）
      setTaskLists(prev => [newTaskList, ...prev]);
      setCurrentTaskListId(newTaskList.id);
      return newTaskList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task list');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const selectTaskList = async (taskListId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentTaskListId(taskListId);
      const tasks = await taskListService.getTasks(taskListId);
      setCurrentTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (content: string) => {
    if (!currentTaskListId) return;
    
    try {
      setError(null);
      const newTask = await taskListService.createTask(currentTaskListId, { content });
      setCurrentTasks(prev => [newTask, ...prev]);
      
      // タスクリストのタスク数を更新
      setTaskLists(prev => prev.map(list => 
        list.id === currentTaskListId 
          ? { ...list, taskCount: list.taskCount + 1 }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<UpdateTaskRequest>) => {
    try {
      setError(null);
      const updatedTask = await taskListService.updateTask(taskId, updates);
      
      setCurrentTasks(prev => prev.map(t => 
        t.id === taskId ? updatedTask : t
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      setError(null);
      const task = currentTasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedTask = await taskListService.updateTask(taskId, { 
        completed: !task.completed 
      });
      
      setCurrentTasks(prev => prev.map(t => 
        t.id === taskId ? updatedTask : t
      ));
      
      // タスクリストの完了数を更新
      setTaskLists(prev => prev.map(list => 
        list.id === currentTaskListId 
          ? { 
              ...list, 
              completedCount: task.completed 
                ? list.completedCount - 1 
                : list.completedCount + 1 
            }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError(null);
      const task = currentTasks.find(t => t.id === taskId);
      await taskListService.deleteTask(taskId);
      
      setCurrentTasks(prev => prev.filter(t => t.id !== taskId));
      
      // タスクリストのタスク数を更新
      setTaskLists(prev => prev.map(list => 
        list.id === currentTaskListId 
          ? { 
              ...list, 
              taskCount: list.taskCount - 1,
              completedCount: task?.completed 
                ? list.completedCount - 1 
                : list.completedCount
            }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // 初期化時にタスクリストを取得
  useEffect(() => {
    fetchTaskLists();
  }, []);

  // 現在のタスクリストが変更されたときにタスクを取得
  useEffect(() => {
    if (currentTaskListId) {
      selectTaskList(currentTaskListId);
    }
  }, [currentTaskListId]);

  const value: TaskListContextType = {
    taskLists,
    currentTaskListId,
    currentTasks,
    isLoading,
    error,
    fetchTaskLists,
    createTaskList,
    selectTaskList,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
  };

  return (
    <TaskListContext.Provider value={value}>
      {children}
    </TaskListContext.Provider>
  );
};