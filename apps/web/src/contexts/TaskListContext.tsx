'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskList, Task, CreateTaskListRequest, CreateTaskRequest, UpdateTaskListRequest } from '@/lib/types/task-list';
import { taskListService } from '@/lib/task-list';
import { parseTaskContent } from '@/lib/utils/dateParser';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';

interface TaskListContextType {
  taskLists: TaskList[];
  currentTaskListId: string | null;
  currentTasks: Task[];
  isLoading: boolean;
  error: string | null;
  
  // Task List operations
  fetchTaskLists: () => Promise<void>;
  createTaskList: (request: CreateTaskListRequest) => Promise<void>;
  selectTaskList: (taskListId: string) => Promise<void>;
  updateTaskList: (taskListId: string, request: UpdateTaskListRequest) => Promise<void>;
  deleteTaskList: (taskListId: string) => Promise<void>;
  
  // Task operations
  createTask: (content: string) => Promise<void>;
  updateTask: (taskId: string, updates: { content?: string; dueDate?: Date | null }) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  sortTasks: () => void;
  reorderTasks: (taskIds: string[]) => Promise<void>;
  deleteCompletedTasks: () => Promise<void>;
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

export const TaskListProvider: React.FC<TaskListProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [currentTaskListId, setCurrentTaskListId] = useState<string | null>(null);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSort, setAutoSort] = useState(false);

  // 設定を取得する関数
  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const response = await authService.getSettings(user.id);
      setAutoSort(response.settings.autoSort || false);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

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

  const createTaskList = async (request: CreateTaskListRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const newTaskList = await taskListService.createTaskList(request);
      setTaskLists(prev => [...prev, newTaskList]);
      setCurrentTaskListId(newTaskList.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task list');
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
      setCurrentTasks(applySorting(tasks));
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
      
      // 日付の自動解析
      const parsedTask = parseTaskContent(content, i18n.language);
      const taskRequest: CreateTaskRequest = {
        content: parsedTask.content || content // 解析後のコンテンツがない場合は元のコンテンツを使用
      };
      
      if (parsedTask.dueDate) {
        taskRequest.dueDate = parsedTask.dueDate.toISOString();
      }
      
      const newTask = await taskListService.createTask(currentTaskListId, taskRequest);
      setCurrentTasks(prev => applySorting([newTask, ...prev]));
      
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

  const updateTask = async (taskId: string, updates: { content?: string; dueDate?: Date | null }) => {
    try {
      setError(null);
      const updateRequest: any = {};
      
      if (updates.content !== undefined) {
        updateRequest.content = updates.content;
      }
      
      if (updates.dueDate !== undefined) {
        updateRequest.dueDate = updates.dueDate ? updates.dueDate.toISOString() : null;
      }
      
      const updatedTask = await taskListService.updateTask(taskId, updateRequest);
      
      setCurrentTasks(prev => applySorting(prev.map(t => 
        t.id === taskId ? updatedTask : t
      )));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err; // 呼び出し元でエラーハンドリングできるように
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
      
      setCurrentTasks(prev => applySorting(prev.map(t => 
        t.id === taskId ? updatedTask : t
      )));
      
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

  const updateTaskList = async (taskListId: string, request: UpdateTaskListRequest) => {
    try {
      setError(null);
      const updatedTaskList = await taskListService.updateTaskList(taskListId, request);
      
      // タスクリストを更新
      setTaskLists(prev => prev.map(list => 
        list.id === taskListId ? updatedTaskList : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task list');
    }
  };

  const deleteTaskList = async (taskListId: string) => {
    try {
      setError(null);
      await taskListService.deleteTaskList(taskListId);
      
      // タスクリストを削除
      setTaskLists(prev => prev.filter(list => list.id !== taskListId));
      
      // 削除されたタスクリストが現在選択されている場合
      if (currentTaskListId === taskListId) {
        setCurrentTaskListId(null);
        setCurrentTasks([]);
        
        // 他のタスクリストがある場合は最初のものを選択
        setTaskLists(prev => {
          const remainingLists = prev.filter(list => list.id !== taskListId);
          if (remainingLists.length > 0) {
            setCurrentTaskListId(remainingLists[0].id);
          }
          return remainingLists;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task list');
    }
  };

  // 高度なソート関数：完了・未完了、日付で自動ソート、それ以外は手動順序を維持
  const smartSortTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      // 1. 完了・未完了で分類（未完了を上に）
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // 2. 日付有無で分類（日付ありを上に）
      const aHasDate = !!a.dueDate;
      const bHasDate = !!b.dueDate;
      if (aHasDate !== bHasDate) {
        return bHasDate ? 1 : -1;
      }
      
      // 3. 日付がある場合は日付順（早い順）
      if (aHasDate && bHasDate) {
        return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
      }
      
      // 4. 同じカテゴリ内では手動の並び順（order属性）を維持
      return a.order - b.order;
    });
  };

  // 通常のソート関数：orderのみでソート（自動並び替えが無効の場合）
  const basicSortTasks = (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => a.order - b.order);
  };

  // 設定に応じてソート関数を選択
  const applySorting = (tasks: Task[]): Task[] => {
    return autoSort ? smartSortTasks(tasks) : basicSortTasks(tasks);
  };

  const sortTasks = () => {
    setCurrentTasks(prev => smartSortTasks(prev));
  };

  const reorderTasks = async (taskIds: string[]) => {
    try {
      setError(null);
      
      // 手動で並び替えられたタスクの順序を更新
      const reorderedTasks = taskIds.map((id, index) => {
        const task = currentTasks.find(t => t.id === id);
        return task ? { ...task, order: index } : null;
      }).filter(Boolean) as Task[];
      
      // 高度なソート機能を適用
      const sorted = applySorting(reorderedTasks);
      
      // ローカル状態を即座に更新（楽観的更新）
      setCurrentTasks(sorted);
      
      // API呼び出しで順序を保存（元の手動順序を保存）
      const updatePromises = reorderedTasks.map((task) => 
        taskListService.updateTask(task.id, { order: task.order })
      );
      
      await Promise.all(updatePromises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks');
      // エラー時は元の状態に戻す
      if (currentTaskListId) {
        const tasks = await taskListService.getTasks(currentTaskListId);
        setCurrentTasks(applySorting(tasks));
      }
      throw err;
    }
  };

  const deleteCompletedTasks = async () => {
    try {
      setError(null);
      const completedTasks = currentTasks.filter(task => task.completed);
      
      // 完了タスクを一括削除
      const deletePromises = completedTasks.map(task => taskListService.deleteTask(task.id));
      await Promise.all(deletePromises);
      
      // ローカル状態を更新
      setCurrentTasks(prev => prev.filter(task => !task.completed));
      
      // タスクリストのタスク数と完了数を更新
      setTaskLists(prev => prev.map(list => 
        list.id === currentTaskListId 
          ? { 
              ...list, 
              taskCount: list.taskCount - completedTasks.length,
              completedCount: 0
            }
          : list
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete completed tasks');
      throw err;
    }
  };

  // 初期化時にタスクリストを取得
  useEffect(() => {
    fetchTaskLists();
  }, []);

  // ユーザーが変更されたときに設定を取得
  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  // 現在のタスクリストが変更されたときにタスクを取得
  useEffect(() => {
    if (currentTaskListId) {
      selectTaskList(currentTaskListId);
    }
  }, [currentTaskListId]);

  // autoSort設定が変更されたときに現在のタスクを再ソート
  useEffect(() => {
    if (currentTasks.length > 0) {
      setCurrentTasks(prev => applySorting(prev));
    }
  }, [autoSort]);

  const value: TaskListContextType = {
    taskLists,
    currentTaskListId,
    currentTasks,
    isLoading,
    error,
    fetchTaskLists,
    createTaskList,
    selectTaskList,
    updateTaskList,
    deleteTaskList,
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    sortTasks,
    reorderTasks,
    deleteCompletedTasks,
  };

  return (
    <TaskListContext.Provider value={value}>
      {children}
    </TaskListContext.Provider>
  );
};