import { api } from '@/lib/api';
import type { 
  Reservation, 
  CreateReservationRequest, 
  UpdateReservationRequest 
} from '@/types/reservation';

export class ReservationService {
  
  /**
   * Criar nova reserva
   */
  static async create(reservationData: CreateReservationRequest): Promise<Reservation> {
    try {
      const newReservation = await api.post<Reservation>('/reservations', reservationData);
      return newReservation;
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('409')) {
          throw new Error('Horário não disponível');
        }
        if (error.message.includes('400')) {
          throw new Error('Dados da reserva inválidos');
        }
        if (error.message.includes('404')) {
          throw new Error('Quadra não encontrada');
        }
      }
      
      throw new Error('Erro ao criar reserva');
    }
  }

  /**
   * Buscar todas as reservas
   */
  static async getAll(): Promise<Reservation[]> {
    try {
      const reservations = await api.get<Reservation[]>('/reservations');
      return reservations;
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      throw new Error('Erro ao buscar reservas');
    }
  }

  /**
   * Buscar reserva por ID
   */
  static async getById(id: string): Promise<Reservation> {
    try {
      const reservation = await api.get<Reservation>(`/reservations/${id}`);
      return reservation;
    } catch (error) {
      console.error('Erro ao buscar reserva:', error);
      
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Reserva não encontrada');
      }
      
      throw new Error('Erro ao buscar reserva');
    }
  }

  /**
   * Buscar reservas do usuário
   */
  static async getUserReservations(userId: string): Promise<Reservation[]> {
    try {
      const reservations = await api.get<Reservation[]>(`/reservations/user/${userId}`);
      return reservations;
    } catch (error) {
      console.error('Erro ao buscar reservas do usuário:', error);
      throw new Error('Erro ao buscar reservas do usuário');
    }
  }

  /**
   * Buscar reservas por data
   */
  static async getByDate(date: string): Promise<Reservation[]> {
    try {
      const reservations = await api.get<Reservation[]>(`/reservations/date/${date}`);
      return reservations;
    } catch (error) {
      console.error('Erro ao buscar reservas por data:', error);
      throw new Error('Erro ao buscar reservas por data');
    }
  }

  /**
   * Buscar reservas de uma quadra específica
   */
  static async getCourtReservations(courtId: string): Promise<Reservation[]> {
    try {
      const reservations = await api.get<Reservation[]>(`/reservations/court/${courtId}`);
      return reservations;
    } catch (error) {
      console.error('Erro ao buscar reservas da quadra:', error);
      throw new Error('Erro ao buscar reservas da quadra');
    }
  }

  /**
   * Atualizar reserva
   */
  static async update(id: string, reservationData: UpdateReservationRequest): Promise<Reservation> {
    try {
      const updatedReservation = await api.put<Reservation>(`/reservations/${id}`, reservationData);
      return updatedReservation;
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Reserva não encontrada');
        }
        if (error.message.includes('409')) {
          throw new Error('Novo horário não disponível');
        }
        if (error.message.includes('400')) {
          throw new Error('Dados da reserva inválidos');
        }
      }
      
      throw new Error('Erro ao atualizar reserva');
    }
  }

  /**
   * Cancelar/Deletar reserva
   */
  static async cancel(id: string): Promise<void> {
    try {
      await api.delete(`/reservations/${id}`);
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Reserva não encontrada');
        }
        if (error.message.includes('409')) {
          throw new Error('Não é possível cancelar esta reserva');
        }
      }
      
      throw new Error('Erro ao cancelar reserva');
    }
  }

  /**
   * Buscar reservas por período
   */
  static async getByPeriod(startDate: string, endDate: string): Promise<Reservation[]> {
    try {
      const reservations = await api.get<Reservation[]>(
        `/reservations/period?startDate=${startDate}&endDate=${endDate}`
      );
      return reservations;
    } catch (error) {
      console.error('Erro ao buscar reservas por período:', error);
      throw new Error('Erro ao buscar reservas por período');
    }
  }

  /**
   * Buscar reservas ativas (não canceladas)
   */
  static async getActive(): Promise<Reservation[]> {
    try {
      const reservations = await api.get<Reservation[]>('/reservations/active');
      return reservations;
    } catch (error) {
      console.error('Erro ao buscar reservas ativas:', error);
      throw new Error('Erro ao buscar reservas ativas');
    }
  }

  /**
   * Buscar próximas reservas do usuário
   */
  static async getUpcoming(userId: string, limit: number = 5): Promise<Reservation[]> {
    try {
      const reservations = await api.get<Reservation[]>(
        `/reservations/user/${userId}/upcoming?limit=${limit}`
      );
      return reservations;
    } catch (error) {
      console.error('Erro ao buscar próximas reservas:', error);
      throw new Error('Erro ao buscar próximas reservas');
    }
  }

  /**
   * Verificar conflitos de horário
   */
  static async checkConflicts(
    courtId: string,
    startTime: string,
    endTime: string,
    excludeReservationId?: string
  ): Promise<Reservation[]> {
    try {
      const url = `/reservations/conflicts?courtId=${courtId}&startTime=${startTime}&endTime=${endTime}${
        excludeReservationId ? `&excludeId=${excludeReservationId}` : ''
      }`;
      
      const conflicts = await api.get<Reservation[]>(url);
      return conflicts;
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
      throw new Error('Erro ao verificar conflitos de horário');
    }
  }

  /**
   * Obter estatísticas de reservas
   */
  static async getStats(userId?: string): Promise<{
    total: number;
    active: number;
    cancelled: number;
    completed: number;
  }> {
    try {
      const url = userId ? `/reservations/stats?userId=${userId}` : '/reservations/stats';
      const stats = await api.get<{
        total: number;
        active: number;
        cancelled: number;
        completed: number;
      }>(url);
      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas de reservas');
    }
  }
}