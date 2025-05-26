import { API_BASE_URL } from '@/config/api';
import Cookies from 'js-cookie';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface RegisterResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Singleton pattern
    this.token = Cookies.get('token') || null;
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getToken(): string | null {
    return this.token;
  }

  private setToken(token: string): void {
    this.token = token;
    Cookies.set('token', token, { expires: 7 }); // 7 gün geçerli
  }

  private clearToken(): void {
    this.token = null;
    Cookies.remove('token');
  }

  public async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Login attempt:', { email, password });
      console.log('API URL:', `${API_BASE_URL}/auth/login`);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      const responseData = await response.json();
      console.log('Login response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Giriş başarısız');
      }

      if (!responseData.data || !responseData.data.token) {
        throw new Error('Geçersiz sunucu yanıtı');
      }

      this.setToken(responseData.data.token);
      return {
        token: responseData.data.token,
        user: responseData.data.user
      };
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Giriş yapılırken bir hata oluştu');
    }
  }

  public async register(name: string, email: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: defaultHeaders,
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify({ name, email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Kayıt başarısız');
      }

      if (!responseData.data || !responseData.data.token) {
        throw new Error('Geçersiz sunucu yanıtı');
      }

      this.setToken(responseData.data.token);
      return {
        token: responseData.data.token,
        user: responseData.data.user
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Kayıt olurken bir hata oluştu');
    }
  }

  public async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          'Authorization': `Bearer ${this.token}`,
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error('Çıkış yapılırken bir hata oluştu');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      this.clearToken();
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = AuthService.getInstance(); 