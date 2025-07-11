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
  cancelReservation: (id: string) => Promise<Schedule | null>;
  searchReservations: (filters: ReservationFilter) => Promise<Schedule[]>;
  clearError: () => void;
}

export const useReservations = (): UseReservationsResult => {
  const [reservations, setReservations] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const refreshReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // A API já filtra automaticamente baseado no role do usuário
      const data = await ReservationsService.getAll();
      setReservations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar reservas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReservation = useCallback(async (data: CreateScheduleRequest): Promise<Schedule | null> => {
    try {
      setError('');
      
      const validationErrors = ReservationsService.validateReservationData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

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
      
      setReservations(prev => [...prev, newReservation]);
      
      return newReservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar reserva';
      setError(errorMessage);
      return null;
    }
  }, []);

  const updateReservation = useCallback(async (id: string, data: UpdateScheduleRequest): Promise<Schedule | null> => {
    try {
      setError('');
      
      const validationErrors = ReservationsService.validateReservationData(data);
      if (validationErrors.length > 0) {
        setError(validationErrors.join(', '));
        return null;
      }

      if (data.dataHoraInicio && data.dataHoraFim && data.courtId) {
        const hasConflict = await ReservationsService.checkConflict(
          data.courtId,
          new Date(data.dataHoraInicio),
          new Date(data.dataHoraFim),
          id
        );

        if (hasConflict) {
          setError('Já existe uma reserva para este horário');
          return null;
        }
      }

      const updatedReservation = await ReservationsService.update(id, data);
      
      setReservations(prev => 
        prev.map(reservation => reservation.id === id ? updatedReservation : reservation)
      );
      
      return updatedReservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar reserva';
      setError(errorMessage);
      return null;
    }
  }, []);

  const deleteReservation = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError('');
      
      await ReservationsService.delete(id);
      
      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir reserva';
      setError(errorMessage);
      return false;
    }
  }, []);

  const cancelReservation = useCallback(async (id: string): Promise<Schedule | null> => {
    try {
      setError('');
      
      const cancelledReservation = await ReservationsService.cancel(id);
      
      // Atualizar a reserva na lista local
      setReservations(prev => 
        prev.map(reservation => reservation.id === id ? cancelledReservation : reservation)
      );
      
      return cancelledReservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar reserva';
      setError(errorMessage);
      return null;
    }
  }, []);

  const searchReservations = useCallback(async (filters: ReservationFilter): Promise<Schedule[]> => {
    try {
      setError('');
      
      const results = await ReservationsService.search(filters);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar reservas';
      setError(errorMessage);
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

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
    cancelReservation,
    searchReservations,
    clearError,
  };
};

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