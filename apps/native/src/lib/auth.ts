import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterRequest, LoginRequest, AuthResponse } from './types/auth';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

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

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  async getCurrentUser(): Promise<{ id: string; email: string; name: string | null } | null> {
    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async setCurrentUser(user: { id: string; email: string; name: string | null }): Promise<void> {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  async removeCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error removing current user:', error);
    }
  }

  async getSettings(userId: string): Promise<{ settings: Settings }> {
    const token = await this.getToken();
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
    const token = await this.getToken();
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
    const token = await this.getToken();
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
    const token = await this.getToken();
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

  async requestPasswordReset(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to request password reset');
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to reset password');
    }
  }
}

export const authService = new AuthService();