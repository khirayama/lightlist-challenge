import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { JwtPayload } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret";
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h"; // 環境変数から読み込み

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
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // 明示的に有効期限をチェック
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      throw new Error('Token has expired');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
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
  // 1年後の日付を返す
  const now = new Date();
  now.setFullYear(now.getFullYear() + 1);
  return now;
};
