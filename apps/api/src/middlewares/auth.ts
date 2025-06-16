import { PrismaClient } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.user = user;
    next();
  } catch (_error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const requireOwnership = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.params.userId;

  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (req.user.id !== userId) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  next();
};
