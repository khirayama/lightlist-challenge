import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import type { SettingsUpdateRequest } from "../types/auth.js";

const userService = new UserService();

export class UsersController {
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const settings = await userService.getSettings(userId);

      res.status(200).json({
        message: "Settings retrieved successfully",
        data: settings,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Settings not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }

      console.error("Get settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const data: SettingsUpdateRequest = req.body;

      const settings = await userService.updateSettings(userId, data);

      res.status(200).json({
        message: "Settings updated successfully",
        data: settings,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Settings not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }

      console.error("Update settings error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await userService.getUserProfile(userId);

      res.status(200).json({
        message: "User profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          res.status(404).json({ error: error.message });
          return;
        }
      }

      console.error("Get profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
