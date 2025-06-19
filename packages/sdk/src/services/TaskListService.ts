import { AuthenticatedFetchFunction } from './CollaborativeService';
import { Task } from '../types/Task';
import { TaskList } from '../types/TaskList';

// API専用の型定義（SDKの型と区別）
export interface ApiTask {
  id: string;
  content: string;
  completed: boolean;
  dueDate: string | null;
  order: number;
  taskListId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTaskList {
  id: string;
  name: string;
  order: number;
  color: string;
  taskCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskListRequest {
  name: string;
}

export interface UpdateTaskListRequest {
  name?: string;
  color?: string;
  order?: number;
}

export interface CreateTaskRequest {
  content: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  content?: string;
  completed?: boolean;
  dueDate?: string | null;
  order?: number;
}

export interface TaskListsResponse {
  message: string;
  data: {
    taskLists: ApiTaskList[];
  };
}

export interface TasksResponse {
  message: string;
  data: {
    tasks: ApiTask[];
  };
}

export interface TaskListResponse {
  message: string;
  data: {
    taskList: ApiTaskList;
  };
}

export interface TaskResponse {
  message: string;
  data: {
    task: ApiTask;
  };
}

export class TaskListService {
  private authenticatedFetch: AuthenticatedFetchFunction;
  private baseUrl: string;

  constructor(
    authenticatedFetch: AuthenticatedFetchFunction,
    baseUrl: string = 'http://localhost:3001'
  ) {
    this.authenticatedFetch = authenticatedFetch;
    this.baseUrl = baseUrl;
  }

  async getTaskLists(): Promise<ApiTaskList[]> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/task-lists`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch task lists: ${response.statusText}`);
    }

    const data: TaskListsResponse = await response.json();
    return data.data.taskLists;
  }

  async createTaskList(request: CreateTaskListRequest): Promise<ApiTaskList> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/task-lists`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task list: ${response.statusText}`);
    }

    const data: TaskListResponse = await response.json();
    return data.data.taskList;
  }

  async updateTaskList(taskListId: string, request: UpdateTaskListRequest): Promise<ApiTaskList> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/task-lists/${taskListId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task list: ${response.statusText}`);
    }

    const data: TaskListResponse = await response.json();
    return data.data.taskList;
  }

  async deleteTaskList(taskListId: string): Promise<void> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/task-lists/${taskListId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task list: ${response.statusText}`);
    }
  }

  async getTasks(taskListId: string): Promise<ApiTask[]> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/task-lists/${taskListId}/tasks`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data: TasksResponse = await response.json();
    return data.data.tasks;
  }

  async createTask(taskListId: string, request: CreateTaskRequest): Promise<ApiTask> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/task-lists/${taskListId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    const data: TaskResponse = await response.json();
    return data.data.task;
  }

  async updateTask(taskId: string, request: UpdateTaskRequest): Promise<ApiTask> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }

    const data: TaskResponse = await response.json();
    return data.data.task;
  }

  async deleteTask(taskId: string): Promise<void> {
    const response = await this.authenticatedFetch(`${this.baseUrl}/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  }
}