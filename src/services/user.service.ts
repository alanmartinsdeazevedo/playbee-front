import { api } from '@/lib/api';
import type { User } from '@/types/auth';

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  telefone?: string;
}

export interface ChangePasswordRequest {
  senhaAtual: string;
  novaSenha: string;
}

export interface UserStats {
  totalReservations: number;
  totalHoursPlayed: number;
  favoritesSport: string;
  totalSpent: number;
  memberSince: string;
}

export class UserService {
  /**
   * Buscar todos os usuários (admin apenas)
   */
  static async getAll(): Promise<User[]> {
    try {
      return await api.get<User[]>('/users');
    } catch (error) {
      console.error('Erro no UserService.getAll:', error);
      throw error;
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getById(id: string): Promise<User> {
    try {
      return await api.get<User>(`/users/${id}`);
    } catch (error) {
      console.error('Erro no UserService.getById:', error);
      throw error;
    }
  }

  /**
   * Buscar perfil do usuário logado
   */
  static async getProfile(): Promise<User> {
    try {
      const user = await api.get<User>('/users/profile');
      
      // Atualizar dados locais
      if (typeof window !== 'undefined') {
        localStorage.setItem('playbee_user', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error('Erro no UserService.getProfile:', error);
      throw error;
    }
  }

  /**
   * Atualizar dados do usuário
   */
  static async update(data: UpdateUserRequest): Promise<User> {
    try {
      const user = await api.put<User>('/users/profile', data);
      
      // Atualizar dados locais
      if (typeof window !== 'undefined') {
        localStorage.setItem('playbee_user', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error('Erro no UserService.update:', error);
      throw error;
    }
  }

  /**
   * Alterar senha do usuário
   */
  static async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await api.put<void>('/users/change-password', data);
    } catch (error) {
      console.error('Erro no UserService.changePassword:', error);
      throw error;
    }
  }

  /**
   * Buscar estatísticas do usuário
   */
  static async getStats(): Promise<UserStats> {
    try {
      return await api.get<UserStats>('/users/stats');
    } catch (error) {
      console.error('Erro no UserService.getStats:', error);
      // Retornar dados mock em caso de erro
      return {
        totalReservations: 0,
        totalHoursPlayed: 0,
        favoritesSport: 'Futebol',
        totalSpent: 0,
        memberSince: new Date().toISOString(),
      };
    }
  }

  /**
   * Deletar conta do usuário
   */
  static async deleteAccount(): Promise<void> {
    try {
      await api.delete<void>('/users/profile');
      // O logout já é feito automaticamente no api.ts se houver erro 401
    } catch (error) {
      console.error('Erro no UserService.deleteAccount:', error);
      throw error;
    }
  }

  /**
   * Buscar usuários com filtros (admin)
   */
  static async search(query: string, limit: number = 20): Promise<User[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
      });

      return await api.get<User[]>(`/users/search?${params}`);
    } catch (error) {
      console.error('Erro no UserService.search:', error);
      throw error;
    }
  }

  /**
   * Verificar se usuário tem permissão de admin
   */
  static async checkPermissions(): Promise<{ isAdmin: boolean; permissions: string[] }> {
    try {
      return await api.get<{ isAdmin: boolean; permissions: string[] }>('/users/permissions');
    } catch (error) {
      console.error('Erro no UserService.checkPermissions:', error);
      return { isAdmin: false, permissions: [] };
    }
  }

  /**
   * Atualizar preferências do usuário
   */
  static async updatePreferences(preferences: {
    notifications?: boolean;
    darkMode?: boolean;
    language?: string;
    emailNotifications?: boolean;
  }): Promise<void> {
    try {
      await api.put<void>('/users/preferences', preferences);
    } catch (error) {
      console.error('Erro no UserService.updatePreferences:', error);
      throw error;
    }
  }
}