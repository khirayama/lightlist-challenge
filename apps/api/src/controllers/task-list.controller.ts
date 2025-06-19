import type { Request, Response } from "express";
import { TaskListService } from "../services/task-list.service.js";

const taskListService = new TaskListService();

export class TaskListController {
  async getTaskLists(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const taskLists = await taskListService.getTaskListsByUserId(req.user.id);

      res.status(200).json({
        message: "Task lists retrieved successfully",
        data: {
          taskLists
        }
      });
    } catch (error) {
      console.error("Get task lists error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createTaskList(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { name } = req.body;

      if (!name || typeof name !== "string") {
        res.status(400).json({ error: "Task list name is required" });
        return;
      }

      const taskList = await taskListService.createTaskList({
        name: name.trim(),
        userId: req.user.id
      });

      res.status(201).json({
        message: "Task list created successfully",
        data: {
          taskList
        }
      });
    } catch (error) {
      console.error("Create task list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTaskList(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskListId } = req.params;
      const { name, order, color } = req.body;

      const taskList = await taskListService.updateTaskList(taskListId, req.user.id, {
        name,
        order,
        color
      });

      if (!taskList) {
        res.status(404).json({ error: "Task list not found" });
        return;
      }

      res.status(200).json({
        message: "Task list updated successfully",
        data: {
          taskList
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Task list not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === "Access denied") {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error("Update task list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteTaskList(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskListId } = req.params;

      const success = await taskListService.deleteTaskList(taskListId, req.user.id);

      if (!success) {
        res.status(404).json({ error: "Task list not found" });
        return;
      }

      res.status(200).json({
        message: "Task list deleted successfully"
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Task list not found") {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === "Access denied") {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error("Delete task list error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}