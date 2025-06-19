import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateTaskRequest {
  content: string;
  taskListId: string;
  userId: string;
}

export interface UpdateTaskRequest {
  content?: string;
  completed?: boolean;
  dueDate?: string | null;
  order?: number;
}

export class TaskService {
  async getTasksByTaskListId(taskListId: string, userId: string) {
    // まずタスクリストの存在確認と所有者チェック
    const taskList = await prisma.taskList.findUnique({
      where: {
        id: taskListId
      }
    });

    if (!taskList) {
      throw new Error("Task list not found");
    }

    if (taskList.userId !== userId) {
      throw new Error("Access denied");
    }

    const tasks = await prisma.task.findMany({
      where: {
        taskListId
      },
      orderBy: {
        order: 'asc'
      }
    });

    return tasks;
  }

  async createTask(data: CreateTaskRequest) {
    // タスクリストの存在確認と所有者チェック
    const taskList = await prisma.taskList.findUnique({
      where: {
        id: data.taskListId
      }
    });

    if (!taskList) {
      throw new Error("Task list not found");
    }

    if (taskList.userId !== data.userId) {
      throw new Error("Access denied");
    }

    // 新しいタスクの順序番号を取得
    const lastTask = await prisma.task.findFirst({
      where: {
        taskListId: data.taskListId
      },
      orderBy: {
        order: 'desc'
      }
    });

    const newOrder = lastTask ? lastTask.order + 1 : 0;

    // 日付解析処理
    const { content, extractedDate } = this.extractDateFromContent(data.content);

    const task = await prisma.task.create({
      data: {
        content,
        taskListId: data.taskListId,
        order: newOrder,
        dueDate: extractedDate
      }
    });

    return task;
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskRequest) {
    // タスクの存在確認と所有者チェック
    const task = await prisma.task.findUnique({
      where: {
        id: taskId
      },
      include: {
        taskList: true
      }
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.taskList.userId !== userId) {
      throw new Error("Access denied");
    }

    const updateData: any = {};
    if (data.content !== undefined) updateData.content = data.content.trim();
    if (data.completed !== undefined) updateData.completed = data.completed;
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.order !== undefined) updateData.order = data.order;

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: updateData
    });

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string): Promise<boolean> {
    // タスクの存在確認と所有者チェック
    const task = await prisma.task.findUnique({
      where: {
        id: taskId
      },
      include: {
        taskList: true
      }
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.taskList.userId !== userId) {
      throw new Error("Access denied");
    }

    await prisma.task.delete({
      where: {
        id: taskId
      }
    });

    return true;
  }

  private extractDateFromContent(content: string): { content: string; extractedDate: Date | null } {
    const dateKeywords = {
      ja: {
        今日: () => new Date(),
        明日: () => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow;
        },
        月曜日: () => this.getNextWeekday(1),
        火曜日: () => this.getNextWeekday(2),
        水曜日: () => this.getNextWeekday(3),
        木曜日: () => this.getNextWeekday(4),
        金曜日: () => this.getNextWeekday(5),
        土曜日: () => this.getNextWeekday(6),
        日曜日: () => this.getNextWeekday(0)
      },
      en: {
        today: () => new Date(),
        tomorrow: () => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return tomorrow;
        },
        monday: () => this.getNextWeekday(1),
        tuesday: () => this.getNextWeekday(2),
        wednesday: () => this.getNextWeekday(3),
        thursday: () => this.getNextWeekday(4),
        friday: () => this.getNextWeekday(5),
        saturday: () => this.getNextWeekday(6),
        sunday: () => this.getNextWeekday(0)
      }
    };

    // 日付形式（YYYY/MM/DD, YYYY-MM-DD）をチェック
    const dateRegex = /^(\d{4}[/-]\d{1,2}[/-]\d{1,2})\s+(.+)$/;
    const dateMatch = content.match(dateRegex);
    
    if (dateMatch) {
      const dateStr = dateMatch[1];
      const cleanContent = dateMatch[2];
      const parsedDate = new Date(dateStr);
      
      if (!isNaN(parsedDate.getTime())) {
        return { content: cleanContent, extractedDate: parsedDate };
      }
    }

    // 日本語キーワードをチェック
    for (const [keyword, getDate] of Object.entries(dateKeywords.ja)) {
      if (content.startsWith(keyword)) {
        const cleanContent = content.substring(keyword.length).trim();
        return { content: cleanContent, extractedDate: getDate() };
      }
    }

    // 英語キーワードをチェック
    for (const [keyword, getDate] of Object.entries(dateKeywords.en)) {
      if (content.toLowerCase().startsWith(keyword)) {
        const cleanContent = content.substring(keyword.length).trim();
        return { content: cleanContent, extractedDate: getDate() };
      }
    }

    return { content, extractedDate: null };
  }

  private getNextWeekday(targetDay: number): Date {
    const today = new Date();
    const currentDay = today.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7;
    const nextDate = new Date(today);
    
    if (daysUntilTarget === 0) {
      // 同じ曜日の場合は次週
      nextDate.setDate(today.getDate() + 7);
    } else {
      nextDate.setDate(today.getDate() + daysUntilTarget);
    }
    
    return nextDate;
  }
}