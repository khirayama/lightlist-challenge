import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { JwtPayload } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const ACCESS_TOKEN_EXPIRES_IN = "60m"; // 60分

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateToken = (payload: JwtPayload): string => {
  // 後方互換性のため残す（削除予定）
  return generateAccessToken(payload);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyToken = (token: string): JwtPayload => {
  // 後方互換性のため残す（削除予定）
  return verifyAccessToken(token);
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch {
    return null;
  }
};

export const getRefreshTokenExpiresAt = (): Date => {
  // 3年後の日付を返す
  const now = new Date();
  now.setFullYear(now.getFullYear() + 3);
  return now;
};
