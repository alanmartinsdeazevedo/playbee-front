// src/services/reservations.service.ts

import { api } from '@/lib/api';
import type { 
  Schedule, 
  CreateScheduleRequest, 
  UpdateScheduleRequest, 
  ScheduleResponse,
  ReservationFilter 
} from '@/types/reservation';

export class ReservationsService {
  /**
   * Criar uma nova reserva
   */
  static async create(data: CreateScheduleRequest): Promise<Schedule> {
    const response = await api.post<Schedule>('/schedule', data);
    return response;
  }

  /**
   * Buscar uma reserva por ID
   */
  static async getById(id: string): Promise<Schedule> {
    const response = await api.get<Schedule>(`/schedule/${id}`);
    return response;
  }

  /**
   * Atualizar uma reserva
   */
  static async update(id: string, data: UpdateScheduleRequest): Promise<Schedule> {
    const response = await api.put<Schedule>(`/schedule/${id}`, data);
    return response;
  }

  /**
   * Deletar uma reserva
   */
  static async delete(id: string): Promise<void> {
    await api.delete(`/schedule/${id}`);
  }

  /**
   * Listar todas as reservas (simulado - não existe endpoint no backend ainda)
   */
  static async getAll(): Promise<Schedule[]> {
    // TODO: Implementar quando houver endpoint no backend
    // Por enquanto, retorna array vazio
    console.warn('Endpoint GET /schedule não implementado no backend');
    return [];
  }

  /**
   * Buscar reservas por usuário
   */
  static async getByUser(userId: string): Promise<Schedule[]> {
    const allReservations = await this.getAll();
    return allReservations.filter(reservation => reservation.userId === userId);
  }

  /**
   * Buscar reservas por quadra
   */
  static async getByCourt(courtId: string): Promise<Schedule[]> {
    const allReservations = await this.getAll();
    return allReservations.filter(reservation => reservation.courtId === courtId);
  }

  /**
   * Buscar reservas por status
   */
  static async getByStatus(status: string): Promise<Schedule[]> {
    const allReservations = await this.getAll();
    return allReservations.filter(reservation => reservation.status === status);
  }

  /**
   * Buscar reservas com filtros
   */
  static async search(filters: ReservationFilter): Promise<Schedule[]> {
    const allReservations = await this.getAll();
    
    return allReservations.filter(reservation => {
      const matchesStatus = !filters.status || reservation.status === filters.status;
      const matchesUser = !filters.userId || reservation.userId === filters.userId;
      const matchesCourt = !filters.courtId || reservation.courtId === filters.courtId;
      
      let matchesDateRange = true;
      if (filters.dateFrom || filters.dateTo) {
        const reservationDate = new Date(reservation.dataHoraInicio);
        
        if (filters.dateFrom) {
          const dateFrom = new Date(filters.dateFrom);
          matchesDateRange = matchesDateRange && reservationDate >= dateFrom;
        }
        
        if (filters.dateTo) {
          const dateTo = new Date(filters.dateTo);
          matchesDateRange = matchesDateRange && reservationDate <= dateTo;
        }
      }
      
      return matchesStatus && matchesUser && matchesCourt && matchesDateRange;
    });
  }

  /**
   * Verificar conflito de horários
   */
  static async checkConflict(
    courtId: string, 
    dataHoraInicio: Date, 
    dataHoraFim: Date,
    excludeId?: string
  ): Promise<boolean> {
    const courtReservations = await this.getByCourt(courtId);
    
    return courtReservations.some(reservation => {
      if (excludeId && reservation.id === excludeId) {
        return false; // Ignore própria reserva ao editar
      }
      
      if (reservation.status === 'cancelled') {
        return false; // Ignore reservas canceladas
      }
      
      const existingStart = new Date(reservation.dataHoraInicio);
      const existingEnd = new Date(reservation.dataHoraFim);
      
      // Verifica sobreposição de horários
      return (
        (dataHoraInicio >= existingStart && dataHoraInicio < existingEnd) ||
        (dataHoraFim > existingStart && dataHoraFim <= existingEnd) ||
        (dataHoraInicio <= existingStart && dataHoraFim >= existingEnd)
      );
    });
  }

  /**
   * Calcular duração em horas
   */
  static calculateDuration(dataHoraInicio: Date, dataHoraFim: Date): number {
    const diffMs = dataHoraFim.getTime() - dataHoraInicio.getTime();
    return diffMs / (1000 * 60 * 60); // Converter para horas
  }

  /**
   * Validar dados da reserva
   */
  static validateReservationData(data: CreateScheduleRequest | UpdateScheduleRequest): string[] {
    const errors: string[] = [];

    if ('dataHoraInicio' in data && 'dataHoraFim' in data && data.dataHoraInicio && data.dataHoraFim) {
      const inicio = new Date(data.dataHoraInicio);
      const fim = new Date(data.dataHoraFim);
      
      if (inicio >= fim) {
        errors.push('Data/hora de início deve ser anterior à data/hora de fim');
      }
      
      if (inicio < new Date()) {
        errors.push('Data/hora de início não pode ser no passado');
      }
      
      const duration = this.calculateDuration(inicio, fim);
      if (duration > 8) {
        errors.push('Duração máxima é de 8 horas');
      }
      
      if (duration < 0.5) {
        errors.push('Duração mínima é de 30 minutos');
      }
    }

    if ('userId' in data && data.userId !== undefined) {
      if (!data.userId) {
        errors.push('Usuário é obrigatório');
      }
    }

    if ('courtId' in data && data.courtId !== undefined) {
      if (!data.courtId) {
        errors.push('Quadra é obrigatória');
      }
    }

    return errors;
  }

  /**
   * Formatar data para exibição
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'short'
    });
  }

  /**
   * Formatar hora para exibição
   */
  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}