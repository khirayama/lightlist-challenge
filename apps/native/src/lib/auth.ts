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
  private refreshPromise: Promise<RefreshTokenResponse> | null = null;
  private refreshTimeoutId: NodeJS.Timeout | null = null;

  public async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
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

    // アクセストークンが期限切れまたは無効の場合、リフレッシュを試行
    if (response.status === 401 || response.status === 403) {
      console.log(`[AuthService] Token expired or invalid (${response.status}), attempting refresh...`);
      try {
        const refreshResult = await this.getOrCreateRefreshPromise();
        await this.setToken(refreshResult.token);
        await this.setRefreshToken(refreshResult.refreshToken);
        await this.setTokenExpiresAt(refreshResult.expiresAt);
        this.scheduleProactiveRefresh(refreshResult.expiresAt);
        
        console.log('[AuthService] Token refresh successful, retrying request...');
        // 新しいトークンで再リクエスト
        response = await makeRequest(refreshResult.token);
      } catch (error) {
        console.error('[AuthService] Token refresh failed:', error);
        // リフレッシュ失敗時は認証状態をクリア
        await this.removeToken();
        await this.removeRefreshToken();
        await this.removeCurrentUser();
        await this.removeTokenExpiresAt();
        this.clearRefreshTimeout();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  private async getOrCreateRefreshPromise(): Promise<RefreshTokenResponse> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.refreshToken();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  public scheduleProactiveRefresh(expiresAt: number): void {
    this.clearRefreshTimeout();
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    // 期限の5分前（300秒前）にリフレッシュ実行（ただし最低30秒は残す）
    const refreshInSeconds = Math.max(timeUntilExpiry - 300, 30);
    
    if (refreshInSeconds > 0) {
      this.refreshTimeoutId = setTimeout(async () => {
        try {
          const refreshResult = await this.refreshToken();
          await this.setToken(refreshResult.token);
          await this.setRefreshToken(refreshResult.refreshToken);
          await this.setTokenExpiresAt(refreshResult.expiresAt);
          this.scheduleProactiveRefresh(refreshResult.expiresAt);
        } catch (error) {
          console.warn('Proactive refresh failed:', error);
          // エラーが発生してもアプリを継続させる
        }
      }, refreshInSeconds * 1000);
    }
  }

  private clearRefreshTimeout(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
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
      
      // 有効期限情報を保存してプロアクティブリフレッシュを開始
      if (result.data.expiresAt) {
        await this.setTokenExpiresAt(result.data.expiresAt);
        this.scheduleProactiveRefresh(result.data.expiresAt);
      }
      
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
      
      // 有効期限情報を保存してプロアクティブリフレッシュを開始
      if (result.data.expiresAt) {
        await this.setTokenExpiresAt(result.data.expiresAt);
        this.scheduleProactiveRefresh(result.data.expiresAt);
      }
      
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
    } finally {
      // プロアクティブリフレッシュタイマーをクリア
      this.clearRefreshTimeout();
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

  async getTokenExpiresAt(): Promise<number | null> {
    try {
      const expiresAtStr = await AsyncStorage.getItem('tokenExpiresAt');
      return expiresAtStr ? parseInt(expiresAtStr) : null;
    } catch (error) {
      console.error('Error getting token expires at:', error);
      return null;
    }
  }

  async setTokenExpiresAt(expiresAt: number): Promise<void> {
    try {
      await AsyncStorage.setItem('tokenExpiresAt', expiresAt.toString());
    } catch (error) {
      console.error('Error setting token expires at:', error);
    }
  }

  async removeTokenExpiresAt(): Promise<void> {
    try {
      await AsyncStorage.removeItem('tokenExpiresAt');
    } catch (error) {
      console.error('Error removing token expires at:', error);
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

  /**
   * 認証付きfetchメソッドのpublicラッパー
   */
  public fetch(url: string, options: RequestInit = {}): Promise<Response> {
    return this.authenticatedFetch(url, options);
  }
}

export const authService = new AuthService();