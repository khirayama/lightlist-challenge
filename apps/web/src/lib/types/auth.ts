export interface RegisterRequest {
  email: string;
  password: string;
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

export interface User {
  id: string;
  email: string;
  name: string | null;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: number; // アクセストークンの有効期限のタイムスタンプ (Unix time)
}