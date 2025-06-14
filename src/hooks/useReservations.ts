import { useState, useEffect, useCallback } from 'react';
import { ReservationsService } from '@/services/reservations.service';
import type { 
  Schedule, 
  CreateScheduleRequest, 
  UpdateScheduleRequest, 
  ReservationFilter 
} from '@/types/reservation';

interface UseReservationsResult {
  reservations: Schedule[];
  isLoading: boolean;
  error: string;
  refreshReservations: () => Promise<void>;
  createReservation: (data: CreateScheduleRequest) => Promise<Schedule | null>;
  updateReservation: (id: string, data: UpdateScheduleRequest) => Promise<Schedule | null>;
  deleteReservation: (id: string) => Promise<boolean>;
  searchReservations: (filters: ReservationFilter) => Promise<Schedule[]>;
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
      
      const data = await ReservationsService.getAll();
      setReservations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar reservas';
      setError(errorMessage);
      console.error('Erro ao carregar reservas:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Criar nova reserva
  const createReservation = useCallback(async (data: CreateScheduleRequest): Promise<Schedule | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = ReservationsService.validateReservationData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      // Verificar conflitos de horário
      const hasConflict = await ReservationsService.checkConflict(
        data.courtId,
        data.dataHoraInicio,
        data.dataHoraFim
      );

      if (hasConflict) {
        setError('Já existe uma reserva para este horário');
        return null;
      }

      const newReservation = await ReservationsService.create(data);
      
      // Atualizar lista local
      setReservations(prev => [...prev, newReservation]);
      
      return newReservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar reserva';
      setError(errorMessage);
      console.error('Erro ao criar reserva:', err);
      return null;
    }
  }, []);

  // Atualizar reserva
  const updateReservation = useCallback(async (id: string, data: UpdateScheduleRequest): Promise<Schedule | null> => {
    try {
      setError('');
      
      // Validar dados antes de enviar
      const validationErrors = ReservationsService.validateReservationData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      // Verificar conflitos se houver mudança de horário
      if (data.dataHoraInicio && data.dataHoraFim && data.courtId) {
        const hasConflict = await ReservationsService.checkConflict(
          data.courtId,
          new Date(data.dataHoraInicio),
          new Date(data.dataHoraFim),
          id // Excluir própria reserva da verificação
        );

        if (hasConflict) {
          setError('Já existe uma reserva para este horário');
          return null;
        }
      }

      const updatedReservation = await ReservationsService.update(id, data);
      
      // Atualizar lista local
      setReservations(prev => 
        prev.map(reservation => reservation.id === id ? updatedReservation : reservation)
      );
      
      return updatedReservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar reserva';
      setError(errorMessage);
      console.error('Erro ao atualizar reserva:', err);
      return null;
    }
  }, []);

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

  // Buscar reservas com filtros
  const searchReservations = useCallback(async (filters: ReservationFilter): Promise<Schedule[]> => {
    try {
      setError('');
      
      const results = await ReservationsService.search(filters);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar reservas';
      setError(errorMessage);
      console.error('Erro ao buscar reservas:', err);
      return [];
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
    searchReservations,
    clearError,
  };
};

// Hook para buscar uma reserva específica
export const useReservation = (id: string) => {
  const [reservation, setReservation] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const refreshReservation = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError('');
      
      const data = await ReservationsService.getById(id);
      setReservation(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar reserva';
      setError(errorMessage);
      console.error('Erro ao carregar reserva:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refreshReservation();
  }, [refreshReservation]);

  return {
    reservation,
    isLoading,
    error,
    refreshReservation,
  };
};