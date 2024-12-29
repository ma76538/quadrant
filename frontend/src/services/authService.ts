import axios from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, ResetPasswordData, User } from '../types/user';

const API_URL = 'http://localhost:8000';  

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;

  private constructor() {
    this.token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('發送登錄請求：', {
        ...credentials,
        password: '[HIDDEN]'
      });

      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await axios.post<AuthResponse>(`${API_URL}/token`, formData);
      this.setSession(response.data);
      console.log('登錄響應：', {
        ...response.data,
        access_token: '[HIDDEN]',
        user: response.data.user
      });
      return response.data.user;
    } catch (error: any) {
      console.error('登錄錯誤：', error.response || error);
      throw error;
    }
  }

  public async register(data: RegisterData): Promise<User> {
    try {
      console.log('發送註冊請求：', {
        ...data,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      const response = await axios.post<User>(`${API_URL}/register`, {
        email: data.email,
        username: data.username,
        password: data.password
      });

      console.log('註冊響應：', {
        ...response.data,
        id: response.data.id,
        email: response.data.email,
        username: response.data.username
      });

      return response.data;
    } catch (error: any) {
      console.error('註冊錯誤：', error.response || error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    this.clearSession();
  }

  public async resetPassword(data: ResetPasswordData): Promise<void> {
    try {
      console.log('發送重置密碼請求：', {
        ...data,
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });

      await axios.post(`${API_URL}/reset-password`, data);
    } catch (error: any) {
      console.error('重置密碼錯誤：', error.response || error);
      throw error;
    }
  }

  public async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('發送重置郵件請求：', email);

      await axios.post(`${API_URL}/forgot-password`, { email });
    } catch (error: any) {
      console.error('發送重置郵件錯誤：', error.response || error);
      throw error;
    }
  }

  public async updateProfile(data: Partial<User>): Promise<User> {
    try {
      console.log('發送更新個人資料請求：', data);

      const response = await axios.put<User>(
        `${API_URL}/users/me`,
        data,
        { headers: this.getAuthHeader() }
      );

      console.log('更新個人資料響應：', response.data);

      this.user = response.data;
      localStorage.setItem('user', JSON.stringify(this.user));
      return response.data;
    } catch (error: any) {
      console.error('更新個人資料錯誤：', error.response || error);
      throw error;
    }
  }

  public async uploadAvatar(file: File): Promise<string> {
    try {
      console.log('發送上傳頭像請求：', file);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post<{ url: string }>(
        `${API_URL}/users/avatar`,
        formData,
        {
          headers: {
            ...this.getAuthHeader(),
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('上傳頭像響應：', response.data);

      if (this.user) {
        this.user.avatar = response.data.url;
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return response.data.url;
    } catch (error: any) {
      console.error('上傳頭像錯誤：', error.response || error);
      throw error;
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  public getUser(): User | null {
    return this.user;
  }

  public getToken(): string | null {
    return this.token;
  }

  private setSession(authResponse: AuthResponse): void {
    this.token = authResponse.access_token;
    this.user = authResponse.user;
    localStorage.setItem('token', this.token);
    localStorage.setItem('user', JSON.stringify(this.user));
  }

  private clearSession(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export default AuthService.getInstance();
