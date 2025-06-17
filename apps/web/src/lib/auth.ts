import { RegisterRequest, LoginRequest, AuthResponse, RefreshTokenResponse } from './types/auth';

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
  private async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let token = this.getToken();
    
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
        this.setToken(refreshResult.token);
        this.setRefreshToken(refreshResult.refreshToken);
        
        // 新しいトークンで再リクエスト
        response = await makeRequest(refreshResult.token);
      } catch (error) {
        // リフレッシュ失敗時は認証状態をクリア
        this.removeToken();
        this.removeRefreshToken();
        this.removeCurrentUser();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        switch (response.status) {
          case 400:
            throw new Error(errorData.error || 'Invalid input data');
          case 409:
            throw new Error('User already exists with this email');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(errorData.error || 'Registration failed');
        }
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again');
      }
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        switch (response.status) {
          case 400:
            throw new Error(errorData.error || 'Invalid email or password');
          case 401:
            throw new Error('Invalid email or password');
          case 429:
            throw new Error('Too many login attempts. Please try again later');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(errorData.error || 'Login failed');
        }
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again');
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
      });

      if (!response.ok) {
        // ログアウトは失敗してもクライアント側で認証状態をクリアするため、エラーをログ出力のみ
        console.warn('Logout API call failed, but proceeding with local logout');
      }
    } catch (error) {
      // ネットワークエラーでもログアウト処理は続行
      console.warn('Network error during logout, but proceeding with local logout');
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

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('refreshToken', token);
  }

  removeRefreshToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('refreshToken');
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
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
      this.removeRefreshToken();
      this.removeToken();
      this.removeCurrentUser();
      const errorData = await response.json();
      throw new Error(errorData.error || 'Token refresh failed');
    }

    const result = await response.json();
    return result.data;
  }

  async getSettings(userId: string): Promise<{ settings: Settings }> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/settings`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        switch (response.status) {
          case 403:
            throw new Error('Access denied');
          case 404:
            throw new Error('Settings not found');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(errorData.error || 'Failed to get settings');
        }
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again');
      }
      throw error;
    }
  }

  async updateSettings(userId: string, data: SettingsUpdateRequest): Promise<Settings> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/settings`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        switch (response.status) {
          case 400:
            throw new Error('Invalid settings data');
          case 403:
            throw new Error('Access denied');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(errorData.error || 'Failed to update settings');
        }
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again');
      }
      throw error;
    }
  }

  async getProfile(userId: string): Promise<User> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        switch (response.status) {
          case 403:
            throw new Error('Access denied');
          case 404:
            throw new Error('Profile not found');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(errorData.error || 'Failed to get profile');
        }
      }

      const result = await response.json();
      return result.data.user;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again');
      }
      throw error;
    }
  }

  async updateProfile(userId: string, data: ProfileUpdateRequest): Promise<User> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE_URL}/api/users/${userId}/profile`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error occurred' }));
        
        switch (response.status) {
          case 400:
            throw new Error('Invalid profile data');
          case 403:
            throw new Error('Access denied');
          case 500:
            throw new Error('Server error. Please try again later');
          default:
            throw new Error(errorData.error || 'Failed to update profile');
        }
      }

      const result = await response.json();
      return result.data.user;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection and try again');
      }
      throw error;
    }
  }
}

export const authService = new AuthService();