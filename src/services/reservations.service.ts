import { api } from '@/lib/api';
import type { 
  Schedule, 
  CreateScheduleRequest, 
  UpdateScheduleRequest, 
  ReservationFilter 
} from '@/types/reservation';

export class ReservationsService {
  static async create(data: CreateScheduleRequest): Promise<Schedule> {
    try {
      const payload = {
        dataHoraInicio: data.dataHoraInicio instanceof Date ? data.dataHoraInicio.toISOString() : data.dataHoraInicio,
        dataHoraFim: data.dataHoraFim instanceof Date ? data.dataHoraFim.toISOString() : data.dataHoraFim,
        status: data.status,
        userId: data.userId,
        courtId: data.courtId,
      };

      console.log('Payload sendo enviado para /schedule:', payload);
      
      const response = await api.post<any>('/schedule', payload);
      
      if (response && typeof response === 'object') {
        if ('schedule' in response && response.schedule) {
          return response.schedule;
        }
        if ('id' in response && 'dataHoraInicio' in response) {
          return response as Schedule;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      console.error('Erro detalhado ao criar reserva:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Validation Schema Error')) {
          console.error('Erro de validação schema - detalhes:', error);
          throw new Error('Erro de validação: Verifique se todos os campos estão preenchidos corretamente');
        }
        
        if (error.message.includes('conflict') || error.message.includes('409')) {
          throw new Error('Conflito de horário: já existe uma reserva neste período');
        }
        
        if (error.message.includes('validation') || error.message.includes('400')) {
          throw new Error('Dados inválidos da reserva');
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conexão com o servidor');
        }
      }
      
      throw error;
    }
  }

  static async getById(id: string): Promise<Schedule> {
    try {
      const response = await api.get<any>(`/schedule/${id}`);
      
      if (response && typeof response === 'object') {
        if ('schedule' in response && response.schedule) {
          return response.schedule;
        }
        if ('id' in response && 'dataHoraInicio' in response) {
          return response as Schedule;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Reserva não encontrada');
        }
        
        if (error.message.includes('500')) {
          throw new Error('Erro interno do servidor ao buscar reserva');
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conexão ao buscar reserva');
        }
      }
      
      throw error;
    }
  }

  static async update(id: string, data: UpdateScheduleRequest): Promise<Schedule> {
    try {
      const response = await api.put<any>(`/schedule/${id}`, data);
      
      if (response && typeof response === 'object') {
        if ('schedule' in response && response.schedule) {
          return response.schedule;
        }
        if ('id' in response && 'dataHoraInicio' in response) {
          return response as Schedule;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Reserva não encontrada');
        }
        
        if (error.message.includes('conflict') || error.message.includes('409')) {
          throw new Error('Conflito de horário: já existe uma reserva neste período');
        }
        
        if (error.message.includes('validation') || error.message.includes('400')) {
          throw new Error('Dados inválidos da reserva');
        }
      }
      
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`/schedule/${id}`);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Reserva não encontrada');
        }
      }
      
      throw error;
    }
  }

  static async getAll(): Promise<Schedule[]> {
    try {
      const response = await api.get<any>('/schedule');
      
      if (response && typeof response === 'object') {
        if ('schedules' in response && Array.isArray(response.schedules)) {
          return response.schedules;
        }
        if (Array.isArray(response)) {
          return response;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      return [];
    }
  }

  static async getAllByUser(userId: string): Promise<Schedule[]> {
    try {
      const response = await api.get<any>(`/schedule?userId=${userId}`);
      
      if (response && typeof response === 'object') {
        if ('schedules' in response && Array.isArray(response.schedules)) {
          return response.schedules;
        }
        if (Array.isArray(response)) {
          return response;
        }
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao buscar reservas do usuário:', error);
      return [];
    }
  }

  static async getByUser(userId: string): Promise<Schedule[]> {
    try {
      const allReservations = await this.getAll();
      return allReservations.filter(reservation => reservation.userId === userId);
    } catch (error) {
      return [];
    }
  }

  static async getByCourt(courtId: string): Promise<Schedule[]> {
    try {
      const allReservations = await this.getAll();
      return allReservations.filter(reservation => reservation.courtId === courtId);
    } catch (error) {
      return [];
    }
  }

  static async getByStatus(status: string): Promise<Schedule[]> {
    try {
      const allReservations = await this.getAll();
      return allReservations.filter(reservation => reservation.status === status);
    } catch (error) {
      return [];
    }
  }

  static async checkConflict(
    courtId: string, 
    dataHoraInicio: Date, 
    dataHoraFim: Date,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const courtReservations = await this.getByCourt(courtId);
      
      return courtReservations.some(reservation => {
        if (excludeId && reservation.id === excludeId) {
          return false;
        }
        
        if (reservation.status === 'cancelled' || reservation.status === 'cancelado') {
          return false;
        }
        
        const existingStart = new Date(reservation.dataHoraInicio);
        const existingEnd = new Date(reservation.dataHoraFim);
        
        return (
          (dataHoraInicio >= existingStart && dataHoraInicio < existingEnd) ||
          (dataHoraFim > existingStart && dataHoraFim <= existingEnd) ||
          (dataHoraInicio <= existingStart && dataHoraFim >= existingEnd)
        );
      });
    } catch (error) {
      return false;
    }
  }

  static calculateDuration(dataHoraInicio: Date, dataHoraFim: Date): number {
    const diffMs = dataHoraFim.getTime() - dataHoraInicio.getTime();
    return diffMs / (1000 * 60 * 60);
  }

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

  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'short'
    });
  }

  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

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
}