import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import type { LoginRequest, RegisterRequest } from "../types/auth.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;
      const result = await authService.register(data);

      res.status(201).json({
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User already exists with this email") {
          res.status(409).json({ error: error.message });
          return;
        }
      }

      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginRequest = req.body;
      const result = await authService.login(data);

      res.status(200).json({
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid email or password") {
          res.status(401).json({ error: error.message });
          return;
        }
      }

      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async logout(_req: Request, res: Response): Promise<void> {
    res.status(200).json({
      message: "Logout successful",
    });
  }
}
