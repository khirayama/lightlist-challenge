import type { Request, Response } from "express";
import { TaskService } from "../services/task.service.js";

const taskService = new TaskService();

export class TaskController {
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskListId } = req.params;
      const tasks = await taskService.getTasksByTaskListId(taskListId, req.user.id);

      res.status(200).json({
        message: "Tasks retrieved successfully",
        data: {
          tasks
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Task list not found" || error.message === "Access denied") {
          res.status(404).json({ error: "Task list not found" });
          return;
        }
      }

      console.error("Get tasks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskListId } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== "string") {
        res.status(400).json({ error: "Task content is required" });
        return;
      }

      const task = await taskService.createTask({
        content: content.trim(),
        taskListId,
        userId: req.user.id
      });

      res.status(201).json({
        message: "Task created successfully",
        data: {
          task
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Task list not found" || error.message === "Access denied") {
          res.status(404).json({ error: "Task list not found" });
          return;
        }
      }

      console.error("Create task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskId } = req.params;
      const { content, completed, dueDate, order } = req.body;

      const task = await taskService.updateTask(taskId, req.user.id, {
        content,
        completed,
        dueDate,
        order
      });

      res.status(200).json({
        message: "Task updated successfully",
        data: {
          task
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Task not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === "Access denied") {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error("Update task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskId } = req.params;

      const success = await taskService.deleteTask(taskId, req.user.id);

      if (!success) {
        res.status(404).json({ error: "Task not found" });
        return;
      }

      res.status(200).json({
        message: "Task deleted successfully"
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Task not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === "Access denied") {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error("Delete task error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}