import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import type { 
  LoginRequest, 
  RegisterRequest, 
  RequestPasswordResetRequest, 
  ResetPasswordRequest,
  RefreshTokenRequest
} from "../types/auth.js";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterRequest = req.body;
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      
      const result = await authService.register(data, userAgent, ipAddress);

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
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      
      const result = await authService.login(data, userAgent, ipAddress);

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

  async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const data: RequestPasswordResetRequest = req.body;
      console.log(`🔐 Password reset request received for email: ${data.email} at ${new Date().toISOString()}`);
      
      const result = await authService.requestPasswordReset(data);

      res.status(200).json(result);
    } catch (error) {
      console.error("Password reset request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const data: ResetPasswordRequest = req.body;
      console.log(`🔄 Password reset attempt with token: ${data.token.substring(0, 8)}... at ${new Date().toISOString()}`);
      
      const result = await authService.resetPassword(data);

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid or expired token") {
          console.log(`❌ Password reset failed: ${error.message}`);
          res.status(400).json({ error: error.message });
          return;
        }
      }

      console.error("Password reset error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const data: RefreshTokenRequest = req.body;
      const result = await authService.refreshToken(data);

      res.status(200).json({
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid or expired refresh token") {
          res.status(401).json({ error: error.message });
          return;
        }
      }

      console.error("Token refresh error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
