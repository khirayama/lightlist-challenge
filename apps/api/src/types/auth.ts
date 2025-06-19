export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  token: string;
  refreshToken: string;
  expiresAt: number; // アクセストークンの有効期限のタイムスタンプ (Unix time)
}

export interface JwtPayload {
  userId: string;
  email: string;
  exp?: number; // 有効期限のタイムスタンプ
  iat?: number; // 発行時刻のタイムスタンプ
}

export interface SettingsUpdateRequest {
  theme?: "system" | "light" | "dark";
  language?: "ja" | "en";
  taskInsertPosition?: "top" | "bottom";
  autoSort?: boolean;
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface PasswordResetResponse {
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: number; // アクセストークンの有効期限のタイムスタンプ (Unix time)
}
