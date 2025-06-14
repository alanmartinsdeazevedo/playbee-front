// src/hooks/useCourts.ts

import { useState, useEffect, useCallback } from 'react';
import { CourtsService } from '@/services/courts.service';
import type { Court, CreateCourtRequest, UpdateCourtRequest } from '@/types/court';

interface UseCourtResult {
  courts: Court[];
  isLoading: boolean;
  error: string;
  refreshCourts: () => Promise<void>;
  createCourt: (data: CreateCourtRequest) => Promise<Court | null>;
  updateCourt: (id: string, data: UpdateCourtRequest) => Promise<Court | null>;
  deleteCourt: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useCourts = (): UseCourtResult => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Carregar quadras
  const refreshCourts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = await CourtsService.getAll();
      setCourts(data);
    } catch (err) {
      // Se a rota não existe ainda, começar com lista vazia
      if (err instanceof Error && err.message.includes('not found')) {
        console.warn('Endpoint de quadras não encontrado, iniciando com lista vazia');
        setCourts([]);
        setError('');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar quadras';
        setError(errorMessage);
        console.error('Erro ao carregar quadras:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar nova quadra
  const createCourt = useCallback(async (data: CreateCourtRequest): Promise<Court | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = CourtsService.validateCourtData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      const newCourt = await CourtsService.create(data);
      
      // Atualizar lista local
      setCourts(prev => [...prev, newCourt]);
      
      return newCourt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar quadra';
      setError(errorMessage);
      console.error('Erro ao criar quadra:', err);
      return null;
    }
  }, []);

  // Atualizar quadra
  const updateCourt = useCallback(async (id: string, data: UpdateCourtRequest): Promise<Court | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = CourtsService.validateCourtData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      const updatedCourt = await CourtsService.update(id, data);
      
      // Atualizar lista local
      setCourts(prev => 
        prev.map(court => court.id === id ? updatedCourt : court)
      );
      
      return updatedCourt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar quadra';
      setError(errorMessage);
      console.error('Erro ao atualizar quadra:', err);
      return null;
    }
  }, []);

  // Deletar quadra
  const deleteCourt = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError('');
      
      console.log('🔍 Hook: Deletando quadra com ID:', id);
      
      await CourtsService.delete(id);
      
      console.log('✅ Hook: Quadra deletada, atualizando lista local');
      
      // Remover da lista local
      setCourts(prev => prev.filter(court => court.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir quadra';
      console.error('❌ Hook: Erro ao deletar quadra:', err);
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
    refreshCourts();
  }, [refreshCourts]);

  return {
    courts,
    isLoading,
    error,
    refreshCourts,
    createCourt,
    updateCourt,
    deleteCourt,
    clearError,
  };
};

// Hook para buscar uma quadra específica
export const useCourt = (id: string) => {
  const [court, setCourt] = useState<Court | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const refreshCourt = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError('');
      
      const data = await CourtsService.getById(id);
      setCourt(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar quadra';
      setError(errorMessage);
      console.error('Erro ao carregar quadra:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshCourt();
  }, [refreshCourt]);

  return {
    court,
    isLoading,
    error,
    refreshCourt,
  };
};