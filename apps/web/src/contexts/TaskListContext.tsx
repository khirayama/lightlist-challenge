'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskList, Task, CreateTaskListRequest, CreateTaskRequest, UpdateTaskListRequest } from '@/lib/types/task-list';
import { taskListService } from '@/lib/task-list';
import { parseTaskContent } from '@/lib/utils/dateParser';
import { useTranslation } from 'react-i18next';

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
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [currentTaskListId, setCurrentTaskListId] = useState<string | null>(null);
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
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
      
      // 日付の自動解析
      const parsedTask = parseTaskContent(content, i18n.language);
      const taskRequest: CreateTaskRequest = {
        content: parsedTask.content || content // 解析後のコンテンツがない場合は元のコンテンツを使用
      };
      
      if (parsedTask.dueDate) {
        taskRequest.dueDate = parsedTask.dueDate.toISOString();
      }
      
      const newTask = await taskListService.createTask(currentTaskListId, taskRequest);
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
      
      setCurrentTasks(prev => prev.map(t => 
        t.id === taskId ? updatedTask : t
      ));
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
    updateTaskList,
    deleteTaskList,
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