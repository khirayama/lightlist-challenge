import { 
  TaskList, 
  Task, 
  CreateTaskListRequest, 
  UpdateTaskListRequest, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  TaskListsResponse,
  TasksResponse,
  TaskListResponse,
  TaskResponse
} from './types/task-list';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class TaskListService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired, user needs to login again
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }

    return response;
  }

  async getTaskLists(): Promise<TaskList[]> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/task-lists`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch task lists: ${response.statusText}`);
    }

    const data: TaskListsResponse = await response.json();
    return data.data.taskLists;
  }

  async createTaskList(request: CreateTaskListRequest): Promise<TaskList> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/task-lists`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task list: ${response.statusText}`);
    }

    const data: TaskListResponse = await response.json();
    return data.data.taskList;
  }

  async updateTaskList(taskListId: string, request: UpdateTaskListRequest): Promise<TaskList> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/task-lists/${taskListId}`, {
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
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/task-lists/${taskListId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task list: ${response.statusText}`);
    }
  }

  async getTasks(taskListId: string): Promise<Task[]> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/task-lists/${taskListId}/tasks`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }

    const data: TasksResponse = await response.json();
    return data.data.tasks;
  }

  async createTask(taskListId: string, request: CreateTaskRequest): Promise<Task> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/task-lists/${taskListId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    const data: TaskResponse = await response.json();
    return data.data.task;
  }

  async updateTask(taskId: string, request: UpdateTaskRequest): Promise<Task> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
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
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  }
}

// シングルトンのインスタンスをエクスポート
export const taskListService = new TaskListService();