// src/lib/auth.ts
import { api } from './api';
import type { User } from '@/types/auth';

export class AuthService {
  private static readonly TOKEN_KEY = 'auth-token';
  private static readonly USER_KEY = 'user-data';

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${this.TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''}`;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${this.TOKEN_KEY}=`)
    );
    
    return authCookie ? authCookie.split('=')[1] : null;
  }

  static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao recuperar dados do usuário:', error);
      return null;
    }
  }

  static updateUser(user: User): void {
    this.setUser(user);
  }

  static removeAuth(): void {
    if (typeof window === 'undefined') return;
    
    document.cookie = `${this.TOKEN_KEY}=; path=/; max-age=0`;
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getUser() && !!this.getToken();
  }

  static hasRole(requiredRole: 'USER' | 'ADMIN'): boolean {
    const user = this.getUser();
    if (!user) return false;
    
    if (requiredRole === 'ADMIN') {
      return user.role === 'ADMIN';
    }
    
    return true;
  }

  static canManageUsers(): boolean {
    return this.hasRole('ADMIN');
  }

  static canManageAllReservations(): boolean {
    return this.hasRole('ADMIN');
  }

  static canAccessAdminFeatures(): boolean {
    return this.hasRole('ADMIN');
  }

  static async login(email: string, senha: string): Promise<User> {
    try {
      console.log('Fazendo login para:', email);
      
      const response = await api.post<{
        message: string;
        user: User;
        token: string;
      }>('/auth/login', { email, senha });

      console.log('Resposta do login:', response);

      this.setToken(response.token);
      this.setUser(response.user);
      
      console.log('Login realizado com sucesso');
      return response.user;

    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Email ou senha incorretos')) {
          throw new Error('Email ou senha incorretos');
        }
        
        if (error.message.includes('401')) {
          throw new Error('Email ou senha incorretos');
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conexão. Tente novamente mais tarde.');
        }
        
        if (error.message.includes('404')) {
          throw new Error('Serviço de login não encontrado. Verifique o backend.');
        }
        
        throw error;
      }
      
      throw new Error('Erro desconhecido ao fazer login');
    }
  }

  static async register(userData: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    role?: string;
  }): Promise<User> {
    try {
      console.log('Registrando novo usuário:', userData.email);
      
      const newUserData = {
        ...userData,
        role: userData.role || 'USER'
      };

      // Criar usuário usando POST /users (que existe no backend)
      const newUser = await api.post<User>('/users', newUserData);
      
      console.log('Usuário criado com sucesso:', newUser.nome);
      
      // Login automático após criação
      const loginResponse = await this.login(userData.email, userData.senha);
      
      return loginResponse;

    } catch (error) {
      console.error('Erro no registro:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('já está em uso') || error.message.includes('409')) {
          throw new Error('Email já está em uso');
        }
        
        if (error.message.includes('validation') || error.message.includes('400')) {
          throw new Error('Dados inválidos');
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conexão com o servidor');
        }
        
        throw error;
      }
      
      throw new Error('Erro desconhecido ao criar conta');
    }
  }

  static logout(): void {
    this.removeAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/desktop/login';
    }
  }
}