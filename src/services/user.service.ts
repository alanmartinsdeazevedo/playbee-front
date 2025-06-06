import { api } from '@/lib/api';
import type { User } from '@/types/auth';

export interface CreateUserRequest {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  role: string;
}

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  role?: string;
}

export class UserService {
  static async getAll(): Promise<User[]> {
    try {
      const response = await api.get<{ users: User[] }>('/users');
      return response.users;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error('Erro ao carregar usuários');
    }
  }

  static async create(userData: CreateUserRequest): Promise<User> {
    try {
      const user = await api.post<User>('/users', userData);
      return user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Erro ao criar usuário');
    }
  }

  static async update(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await api.put<{ user: User }>(`/users/${id}`, userData);
      return response.user;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await api.delete<void>(`/users/${id}`);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error('Erro ao deletar usuário');
    }
  }
}