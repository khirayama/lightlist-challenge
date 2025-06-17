import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterRequest, LoginRequest, AuthResponse, RefreshTokenResponse } from './types/auth';

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
  private async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let token = await this.getToken();
    
    const makeRequest = async (accessToken: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
    };

    if (!token) {
      throw new Error('No access token available');
    }

    let response = await makeRequest(token);

    // アクセストークンが期限切れの場合、リフレッシュを試行
    if (response.status === 401) {
      try {
        const refreshResult = await this.refreshToken();
        await this.setToken(refreshResult.token);
        await this.setRefreshToken(refreshResult.refreshToken);
        
        // 新しいトークンで再リクエスト
        response = await makeRequest(refreshResult.token);
      } catch (error) {
        // リフレッシュ失敗時は認証状態をクリア
        await this.removeToken();
        await this.removeRefreshToken();
        await this.removeCurrentUser();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }
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

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refreshToken');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('refreshToken', token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  }

  async removeRefreshToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Error removing refresh token:', error);
    }
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // リフレッシュトークン無効の場合は削除
      await this.removeRefreshToken();
      await this.removeToken();
      await this.removeCurrentUser();
      const errorData = await response.json();
      throw new Error(errorData.error || 'Token refresh failed');
    }

    const result = await response.json();
    return result.data;
  }

  async getSettings(userId: string): Promise<{ settings: Settings }> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/settings`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get settings');
    }

    const result = await response.json();
    return result.data;
  }

  async updateSettings(userId: string, data: SettingsUpdateRequest): Promise<Settings> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/settings`, {
      method: 'PUT',
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
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get profile');
    }

    const result = await response.json();
    return result.data.user;
  }

  async updateProfile(userId: string, data: ProfileUpdateRequest): Promise<User> {
    const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
      method: 'PUT',
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