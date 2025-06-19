import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
    name: z.string().optional(),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
    deviceId: z.string().optional(),
    deviceName: z.string().optional(),
  }),
});

export const settingsUpdateSchema = z.object({
  body: z.object({
    theme: z.enum(["system", "light", "dark"]).optional(),
    language: z.enum(["ja", "en"]).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").max(100, "Name cannot exceed 100 characters").optional(),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().cuid("Invalid user ID format"),
  }),
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      ),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

type ValidationSchema = z.ZodSchema<{
  body?: unknown;
  params?: unknown;
  query?: unknown;
}>;

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (result.body) req.body = result.body;
      if (result.params) req.params = result.params as Record<string, string>;
      if (result.query) req.query = result.query as Record<string, string | string[]>;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        }));

        res.status(400).json({
          error: "Validation failed",
          details: errors,
        });
        return;
      }

      res.status(500).json({ error: "Internal server error" });
    }
  };
};
