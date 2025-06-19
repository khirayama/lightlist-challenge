export interface TaskList {
  id: string;
  name: string;
  order: number;
  color: string;
  taskCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  content: string;
  completed: boolean;
  dueDate: string | null;
  order: number;
  taskListId: string;
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
    taskLists: TaskList[];
  };
}

export interface TasksResponse {
  message: string;
  data: {
    tasks: Task[];
  };
}

export interface TaskListResponse {
  message: string;
  data: {
    taskList: TaskList;
  };
}

export interface TaskResponse {
  message: string;
  data: {
    task: Task;
  };
}