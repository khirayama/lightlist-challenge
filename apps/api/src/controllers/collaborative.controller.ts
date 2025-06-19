import type { Request, Response } from "express";
import { CollaborativeService } from "../services/collaborative.service.js";

const collaborativeService = new CollaborativeService();

export class CollaborativeController {
  async getFullState(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskListId } = req.params;
      const state = await collaborativeService.getFullState(taskListId, req.user.id);

      res.status(200).json({
        message: "Collaborative state retrieved successfully",
        data: state
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Access denied") {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error("Get collaborative state error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async sync(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskListId } = req.params;
      const { stateVector, update } = req.body;

      if (!stateVector || typeof stateVector !== "string") {
        res.status(400).json({ error: "State vector is required" });
        return;
      }

      const result = await collaborativeService.sync(
        taskListId,
        req.user.id,
        stateVector,
        update
      );

      res.status(200).json({
        message: "Sync successful",
        data: result
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Access denied") {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error("Collaborative sync error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // デバッグ用：ドキュメントからタスクデータを取得
  async getTasks(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const { taskListId } = req.params;
      const tasks = await collaborativeService.getTasksFromDocument(taskListId, req.user.id);

      res.status(200).json({
        message: "Tasks retrieved from collaborative document",
        data: { tasks }
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Access denied") {
          res.status(403).json({ error: error.message });
          return;
        }
      }

      console.error("Get collaborative tasks error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}