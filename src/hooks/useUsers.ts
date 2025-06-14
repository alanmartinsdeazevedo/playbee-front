// src/hooks/useUsers.ts

import { useState, useEffect, useCallback } from 'react';
import { UserService } from '@/services/user.service';
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

interface UseUsersResult {
  users: User[];
  isLoading: boolean;
  error: string;
  refreshUsers: () => Promise<void>;
  createUser: (data: CreateUserRequest) => Promise<User | null>;
  updateUser: (id: string, data: UpdateUserRequest) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Carregar usuários
  const refreshUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Hook: Carregando usuários...');
      const data = await UserService.getAll();
      
      // Verificar se retornou um array
      if (Array.isArray(data)) {
        setUsers(data);
        console.log('✅ Hook: Usuários carregados:', data.length);
      } else if (data && typeof data === 'object' && 'users' in data) {
        // Se retornar { users: [...] }
        setUsers((data as any).users);
        console.log('✅ Hook: Usuários carregados (formato {users}):', (data as any).users.length);
      } else {
        console.warn('⚠️ Hook: Formato de resposta inesperado:', data);
        setUsers([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuários';
      setError(errorMessage);
      console.error('❌ Hook: Erro ao carregar usuários:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar novo usuário
  const createUser = useCallback(async (data: CreateUserRequest): Promise<User | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = validateUserData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      console.log('🔍 Hook: Criando usuário:', data.email);
      const newUser = await UserService.create(data);
      
      // Atualizar lista local
      setUsers(prev => [...prev, newUser]);
      
      console.log('✅ Hook: Usuário criado:', newUser.nome);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar usuário';
      setError(errorMessage);
      console.error('❌ Hook: Erro ao criar usuário:', err);
      return null;
    }
  }, []);

  // Atualizar usuário
  const updateUser = useCallback(async (id: string, data: UpdateUserRequest): Promise<User | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = validateUserData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      console.log('🔍 Hook: Atualizando usuário:', id);
      const updatedUser = await UserService.update(id, data);
      
      // Atualizar lista local
      setUsers(prev => 
        prev.map(user => user.id === id ? updatedUser : user)
      );
      
      console.log('✅ Hook: Usuário atualizado:', updatedUser.nome);
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
      setError(errorMessage);
      console.error('❌ Hook: Erro ao atualizar usuário:', err);
      return null;
    }
  }, []);

  // Deletar usuário
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError('');
      
      console.log('🔍 Hook: Deletando usuário com ID:', id);
      
      await UserService.delete(id);
      
      console.log('✅ Hook: Usuário deletado, atualizando lista local');
      
      // Remover da lista local
      setUsers(prev => prev.filter(user => user.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir usuário';
      console.error('❌ Hook: Erro ao deletar usuário:', err);
      setError(errorMessage);
      return false;
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Carregar dados na montagem
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return {
    users,
    isLoading,
    error,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
};

// Hook para buscar um usuário específico
export const useUser = (id: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const refreshUser = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 useUser: Carregando usuário com ID:', id);
      
      const data = await UserService.getById(id);
      setUser(data);
      
      console.log('✅ useUser: Usuário carregado:', data.nome);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar usuário';
      setError(errorMessage);
      console.error('❌ useUser: Erro ao carregar usuário:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      console.log('🔍 useUser: useEffect disparado para ID:', id);
      refreshUser();
    }
  }, [id, refreshUser]);

  return {
    user,
    isLoading,
    error,
    refreshUser,
  };
};

// Função de validação
function validateUserData(data: CreateUserRequest | UpdateUserRequest): string[] {
  const errors: string[] = [];

  if ('nome' in data && data.nome !== undefined) {
    if (!data.nome || data.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
  }

  if ('email' in data && data.email !== undefined) {
    if (!data.email || !isValidEmail(data.email)) {
      errors.push('E-mail deve ser válido');
    }
  }

  if ('senha' in data && data.senha !== undefined) {
    if (!data.senha || data.senha.length < 6) {
      errors.push('Senha deve ter pelo menos 6 caracteres');
    }
  }

  if ('role' in data && data.role !== undefined) {
    if (!data.role || !['USER', 'ADMIN'].includes(data.role.toUpperCase())) {
      errors.push('Função deve ser USER ou ADMIN');
    }
  }

  return errors;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}