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

export const getAccessTokenExpiresAt = (): number => {
  // 有効期限の文字列を秒数に変換
  const expiresInStr = ACCESS_TOKEN_EXPIRES_IN;
  let expiresInSeconds: number;
  
  if (expiresInStr.endsWith('h')) {
    expiresInSeconds = parseInt(expiresInStr.slice(0, -1)) * 3600;
  } else if (expiresInStr.endsWith('m')) {
    expiresInSeconds = parseInt(expiresInStr.slice(0, -1)) * 60;
  } else if (expiresInStr.endsWith('s')) {
    expiresInSeconds = parseInt(expiresInStr.slice(0, -1));
  } else {
    // 数値のみの場合は秒として扱う
    expiresInSeconds = parseInt(expiresInStr);
  }
  
  // 現在時刻 + 有効期限（Unix timestamp）
  return Math.floor(Date.now() / 1000) + expiresInSeconds;
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
