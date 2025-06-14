import { api } from '@/lib/api';
import type { User } from '@/types/auth';

export interface CreateUserRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  role: string;
}

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  telefone?: string;
  role?: string;
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
      console.log('🔍 Service: Buscando todos os usuários...');
      
      const response = await api.get<any>('/users');
      
      console.log('🔍 Service: Resposta bruta da API:', response);
      
      // Verificar se a resposta tem a estrutura esperada
      if (response && typeof response === 'object') {
        // Se retornar { users: [...] }
        if ('users' in response && Array.isArray(response.users)) {
          console.log('✅ Service: Usuários encontrados (formato {users}):', response.users.length);
          return response.users;
        }
        // Se retornar array diretamente
        if (Array.isArray(response)) {
          console.log('✅ Service: Usuários encontrados (formato array):', response.length);
          return response;
        }
      }
      
      console.warn('⚠️ Service: Resposta em formato inesperado, retornando array vazio');
      return [];
    } catch (error) {
      console.error('❌ Service: Erro ao buscar usuários:', error);
      throw error;
    }
  }

  /**
   * Buscar usuário por ID
   */
  static async getById(id: string): Promise<User> {
    try {
      console.log('🔍 Service: Buscando usuário por ID:', id);
      
      const response = await api.get<any>(`/users/${id}`);
      
      console.log('🔍 Service: Resposta bruta da API:', response);
      
      // Verificar se a resposta tem a estrutura esperada
      if (response && typeof response === 'object') {
        // Se retornar { user: {...} }
        if ('user' in response && response.user) {
          console.log('✅ Service: Usuário encontrado (formato {user}):', response.user);
          return response.user;
        }
        // Se retornar o objeto do usuário diretamente
        if ('id' in response && 'nome' in response && 'email' in response) {
          console.log('✅ Service: Usuário encontrado (formato direto):', response);
          return response as User;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      console.error('❌ Service: Erro ao buscar usuário por ID:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Usuário não encontrado');
        }
        
        if (error.message.includes('500')) {
          throw new Error('Erro interno do servidor ao buscar usuário');
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conexão ao buscar usuário');
        }
      }
      
      throw error;
    }
  }

  /**
   * Criar novo usuário
   */
  static async create(data: CreateUserRequest): Promise<User> {
    try {
      console.log('🔍 Service: Criando usuário:', data.email);
      
      const response = await api.post<any>('/users', data);
      
      console.log('🔍 Service: Resposta da criação:', response);
      
      // Verificar estrutura da resposta
      if (response && typeof response === 'object') {
        // Se retornar { user: {...} }
        if ('user' in response && response.user) {
          console.log('✅ Service: Usuário criado (formato {user}):', response.user);
          return response.user;
        }
        // Se retornar o objeto do usuário diretamente
        if ('id' in response && 'nome' in response && 'email' in response) {
          console.log('✅ Service: Usuário criado (formato direto):', response);
          return response as User;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      console.error('❌ Service: Erro ao criar usuário:', error);
      
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
      }
      
      throw error;
    }
  }

  /**
   * Atualizar usuário
   */
  static async update(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      console.log('🔍 Service: Atualizando usuário:', id);
      
      const response = await api.put<any>(`/users/${id}`, data);
      
      console.log('🔍 Service: Resposta da atualização:', response);
      
      // Verificar estrutura da resposta
      if (response && typeof response === 'object') {
        // Se retornar { user: {...} }
        if ('user' in response && response.user) {
          console.log('✅ Service: Usuário atualizado (formato {user}):', response.user);
          return response.user;
        }
        // Se retornar o objeto do usuário diretamente
        if ('id' in response && 'nome' in response && 'email' in response) {
          console.log('✅ Service: Usuário atualizado (formato direto):', response);
          return response as User;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      console.error('❌ Service: Erro ao atualizar usuário:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Usuário não encontrado');
        }
        
        if (error.message.includes('já está em uso') || error.message.includes('409')) {
          throw new Error('Email já está em uso');
        }
        
        if (error.message.includes('validation') || error.message.includes('400')) {
          throw new Error('Dados inválidos');
        }
      }
      
      throw error;
    }
  }

  /**
   * Deletar usuário
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('🔍 Service: Deletando usuário:', id);
      
      await api.delete(`/users/${id}`);
      
      console.log('✅ Service: Usuário deletado com sucesso');
    } catch (error) {
      console.error('❌ Service: Erro ao deletar usuário:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Usuário não encontrado');
        }
        
        if (error.message.includes('constraint')) {
          throw new Error('Não é possível excluir usuário com reservas associadas');
        }
      }
      
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
        localStorage.setItem('user-data', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error('Erro no UserService.getProfile:', error);
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