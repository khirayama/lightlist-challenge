import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskList, Task, CreateTaskListRequest, CreateTaskRequest } from '../lib/types/task-list';
import { taskListService } from '../lib/task-list';

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
  
  // Task operations
  createTask: (content: string) => Promise<void>;
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
    toggleTask,
    deleteTask,
  };

  return (
    <TaskListContext.Provider value={value}>
      {children}
    </TaskListContext.Provider>
  );
};