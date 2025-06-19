export interface Task {
  id: string;
  content: string;
  completed: boolean;
  dueDate?: number; // Unix timestamp
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface TaskUpdate {
  content?: string;
  completed?: boolean;
  dueDate?: number | null;
  order?: number;
}