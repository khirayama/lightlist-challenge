import { RegisterRequest, LoginRequest, AuthResponse } from './types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Settings {
  id: string;
  theme: 'system' | 'light' | 'dark';
  language: 'ja' | 'en';
  createdAt: string;
  updatedAt: string;
}

interface SettingsUpdateRequest {
  theme?: 'system' | 'light' | 'dark';
  language?: 'ja' | 'en';
}

interface ProfileUpdateRequest {
  name?: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const result = await response.json();
    return result.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const result = await response.json();
    return result.data;
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('authToken', token);
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('authToken');
  }

  getCurrentUser(): { id: string; email: string; name: string | null } | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }

  setCurrentUser(user: { id: string; email: string; name: string | null }): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  removeCurrentUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('currentUser');
  }

  async getSettings(userId: string): Promise<{ settings: Settings }> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get settings');
    }

    const result = await response.json();
    return result.data;
  }

  async updateSettings(userId: string, data: SettingsUpdateRequest): Promise<Settings> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update settings');
    }

    const result = await response.json();
    return result.data;
  }

  async getProfile(userId: string): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get profile');
    }

    const result = await response.json();
    return result.data.user;
  }

  async updateProfile(userId: string, data: ProfileUpdateRequest): Promise<User> {
    const token = this.getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    const result = await response.json();
    return result.data.user;
  }
}

export const authService = new AuthService();