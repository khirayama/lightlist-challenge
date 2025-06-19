import { Task } from './Task';

export interface TaskList {
  id: string;
  name: string;
  order: number;
  color?: string;
  taskCount: number;
  completedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskListWithTasks extends TaskList {
  tasks: Task[];
}