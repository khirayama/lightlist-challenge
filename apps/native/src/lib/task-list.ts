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
import { authService } from './auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export class TaskListService {
  private async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    return authService.authenticatedFetch(url, options);
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