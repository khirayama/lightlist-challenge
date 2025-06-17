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
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface SettingsUpdateRequest {
  theme?: "system" | "light" | "dark";
  language?: "ja" | "en";
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
