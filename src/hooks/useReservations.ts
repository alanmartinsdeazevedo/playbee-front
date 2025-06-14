import { useState, useEffect, useCallback } from 'react';
import { ReservationsService } from '@/services/reservations.service';
import type { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '@/types/reservation';

export interface CreateReservationRequest {
  dataHoraInicio: Date;
  dataHoraFim: Date;
  status: string;
  userId: string;
  courtId: string;
}

export interface UpdateReservationRequest {
  dataHoraInicio?: string;
  dataHoraFim?: string;
  status?: string;
  userId?: string;
  courtId?: string;
}

interface UseReservationsResult {
  reservations: Schedule[];
  isLoading: boolean;
  error: string;
  refreshReservations: () => Promise<void>;
  createReservation: (data: CreateReservationRequest) => Promise<Schedule | null>;
  updateReservation: (id: string, data: UpdateReservationRequest) => Promise<Schedule | null>;
  deleteReservation: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useReservations = (): UseReservationsResult => {
  const [reservations, setReservations] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Carregar reservas
  const refreshReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Hook: Carregando reservas...');
      const data = await ReservationsService.getAll();
      
      if (Array.isArray(data)) {
        setReservations(data);
        console.log('✅ Hook: Reservas carregadas:', data.length);
      } else {
        console.warn('⚠️ Hook: Formato de resposta inesperado:', data);
        setReservations([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar reservas';
      setError(errorMessage);
      console.error('❌ Hook: Erro ao carregar reservas:', err);
      
      // Se o endpoint não existe ainda, começar com lista vazia
      if (err instanceof Error && err.message.includes('not found')) {
        setReservations([]);
        setError('');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar nova reserva
  const createReservation = useCallback(async (data: CreateReservationRequest): Promise<Schedule | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = ReservationsService.validateReservationData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      // Verificar conflito de horários
      const hasConflict = await ReservationsService.checkConflict(
        data.courtId,
        data.dataHoraInicio,
        data.dataHoraFim
      );

      if (hasConflict) {
        setError('Conflito de horário: já existe uma reserva neste período');
        return null;
      }

      console.log('🔍 Hook: Criando reserva...');
      const newReservation = await ReservationsService.create(data);
      
      // Atualizar lista local
      setReservations(prev => [...prev, newReservation]);
      
      console.log('✅ Hook: Reserva criada:', newReservation.id);
      return newReservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar reserva';
      setError(errorMessage);
      console.error('❌ Hook: Erro ao criar reserva:', err);
      return null;
    }
  }, []);

  // Atualizar reserva
  const updateReservation = useCallback(async (id: string, data: UpdateReservationRequest): Promise<Schedule | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = ReservationsService.validateReservationData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      // Verificar conflito de horários se mudou data/hora
      if (data.dataHoraInicio && data.dataHoraFim) {
        const currentReservation = reservations.find(r => r.id === id);
        if (currentReservation) {
          const hasConflict = await ReservationsService.checkConflict(
            currentReservation.courtId,
            new Date(data.dataHoraInicio),
            new Date(data.dataHoraFim),
            id // excluir própria reserva da verificação
          );

          if (hasConflict) {
            setError('Conflito de horário: já existe uma reserva neste período');
            return null;
          }
        }
      }

      console.log('🔍 Hook: Atualizando reserva:', id);
      const updatedReservation = await ReservationsService.update(id, data);
      
      // Atualizar lista local
      setReservations(prev => 
        prev.map(reservation => reservation.id === id ? updatedReservation : reservation)
      );
      
      console.log('✅ Hook: Reserva atualizada:', updatedReservation.id);
      return updatedReservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar reserva';
      setError(errorMessage);
      console.error('❌ Hook: Erro ao atualizar reserva:', err);
      return null;
    }
  }, [reservations]);

  // Deletar reserva
  const deleteReservation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError('');
      
      console.log('🔍 Hook: Deletando reserva com ID:', id);
      
      await ReservationsService.delete(id);
      
      console.log('✅ Hook: Reserva deletada, atualizando lista local');
      
      // Remover da lista local
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir reserva';
      console.error('❌ Hook: Erro ao deletar reserva:', err);
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
    refreshReservations();
  }, [refreshReservations]);

  return {
    reservations,
    isLoading,
    error,
    refreshReservations,
    createReservation,
    updateReservation,
    deleteReservation,
    clearError,
  };
};

// Hook para buscar uma reserva específica
export const useReservation = (id: string) => {
  const [reservation, setReservation] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const refreshReservation = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 useReservation: Carregando reserva com ID:', id);
      
      const data = await ReservationsService.getById(id);
      setReservation(data);
      
      console.log('✅ useReservation: Reserva carregada:', data.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar reserva';
      setError(errorMessage);
      console.error('❌ useReservation: Erro ao carregar reserva:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      console.log('🔍 useReservation: useEffect disparado para ID:', id);
      refreshReservation();
    }
  }, [id, refreshReservation]);

  return {
    reservation,
    isLoading,
    error,
    refreshReservation,
  };
};