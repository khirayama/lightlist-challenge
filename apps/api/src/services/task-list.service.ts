import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface CreateTaskListRequest {
  name: string;
  userId: string;
}

export interface UpdateTaskListRequest {
  name?: string;
  order?: number;
  color?: string;
}

export class TaskListService {
  async getTaskListsByUserId(userId: string) {
    const taskLists = await prisma.taskList.findMany({
      where: {
        userId
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    });

    return taskLists.map(taskList => ({
      id: taskList.id,
      name: taskList.name,
      order: taskList.order,
      color: taskList.color,
      taskCount: taskList._count.tasks,
      completedCount: 0, // TODO: 完了タスク数をカウントする処理を後で追加
      createdAt: taskList.createdAt,
      updatedAt: taskList.updatedAt
    }));
  }

  async createTaskList(data: CreateTaskListRequest) {
    // 新しいタスクリストの順序番号を取得
    const lastTaskList = await prisma.taskList.findFirst({
      where: {
        userId: data.userId
      },
      orderBy: {
        order: 'desc'
      }
    });

    const newOrder = lastTaskList ? lastTaskList.order + 1 : 0;

    const taskList = await prisma.taskList.create({
      data: {
        name: data.name,
        userId: data.userId,
        order: newOrder
      }
    });

    return taskList;
  }

  async updateTaskList(taskListId: string, userId: string, data: UpdateTaskListRequest) {
    // タスクリストの存在確認と所有者チェック
    const existingTaskList = await prisma.taskList.findUnique({
      where: {
        id: taskListId
      }
    });

    if (!existingTaskList) {
      throw new Error("Task list not found");
    }

    if (existingTaskList.userId !== userId) {
      throw new Error("Access denied");
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.order !== undefined) updateData.order = data.order;
    if (data.color !== undefined) updateData.color = data.color;

    const taskList = await prisma.taskList.update({
      where: {
        id: taskListId
      },
      data: updateData
    });

    return taskList;
  }

  async deleteTaskList(taskListId: string, userId: string): Promise<boolean> {
    // タスクリストの存在確認と所有者チェック
    const existingTaskList = await prisma.taskList.findUnique({
      where: {
        id: taskListId
      }
    });

    if (!existingTaskList) {
      throw new Error("Task list not found");
    }

    if (existingTaskList.userId !== userId) {
      throw new Error("Access denied");
    }

    await prisma.taskList.delete({
      where: {
        id: taskListId
      }
    });

    return true;
  }

  async getTaskListById(taskListId: string, userId?: string) {
    const taskList = await prisma.taskList.findUnique({
      where: {
        id: taskListId
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!taskList) {
      throw new Error("Task list not found");
    }

    // 所有者チェックが必要な場合
    if (userId && taskList.userId !== userId) {
      throw new Error("Access denied");
    }

    return taskList;
  }
}