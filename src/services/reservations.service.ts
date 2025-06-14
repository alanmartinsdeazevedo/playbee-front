import { api } from '@/lib/api';
import type { 
  Schedule, 
  CreateScheduleRequest, 
  UpdateScheduleRequest, 
  ReservationFilter 
} from '@/types/reservation';

export class ReservationsService {
  /**
   * Criar uma nova reserva
   */
  static async create(data: CreateScheduleRequest): Promise<Schedule> {
    try {
      console.log('🔍 Service: Criando reserva:', data);
      
      const response = await api.post<any>('/schedule', data);
      
      console.log('🔍 Service: Resposta da criação:', response);
      
      // Verificar estrutura da resposta
      if (response && typeof response === 'object') {
        // Se retornar { schedule: {...} }
        if ('schedule' in response && response.schedule) {
          console.log('✅ Service: Reserva criada (formato {schedule}):', response.schedule);
          return response.schedule;
        }
        // Se retornar o objeto diretamente
        if ('id' in response && 'dataHoraInicio' in response) {
          console.log('✅ Service: Reserva criada (formato direto):', response);
          return response as Schedule;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      console.error('❌ Service: Erro ao criar reserva:', error);
      
      if (error instanceof Error) {
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

  /**
   * Buscar uma reserva por ID
   */
  static async getById(id: string): Promise<Schedule> {
    try {
      console.log('🔍 Service: Buscando reserva por ID:', id);
      
      const response = await api.get<any>(`/schedule/${id}`);
      
      console.log('🔍 Service: Resposta bruta da API:', response);
      
      // Verificar estrutura da resposta
      if (response && typeof response === 'object') {
        // Se retornar { schedule: {...} }
        if ('schedule' in response && response.schedule) {
          console.log('✅ Service: Reserva encontrada (formato {schedule}):', response.schedule);
          return response.schedule;
        }
        // Se retornar o objeto diretamente
        if ('id' in response && 'dataHoraInicio' in response) {
          console.log('✅ Service: Reserva encontrada (formato direto):', response);
          return response as Schedule;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      console.error('❌ Service: Erro ao buscar reserva por ID:', error);
      
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

  /**
   * Atualizar uma reserva
   */
  static async update(id: string, data: UpdateScheduleRequest): Promise<Schedule> {
    try {
      console.log('🔍 Service: Atualizando reserva:', id, data);
      
      const response = await api.put<any>(`/schedule/${id}`, data);
      
      console.log('🔍 Service: Resposta da atualização:', response);
      
      // Verificar estrutura da resposta
      if (response && typeof response === 'object') {
        // Se retornar { schedule: {...} }
        if ('schedule' in response && response.schedule) {
          console.log('✅ Service: Reserva atualizada (formato {schedule}):', response.schedule);
          return response.schedule;
        }
        // Se retornar o objeto diretamente
        if ('id' in response && 'dataHoraInicio' in response) {
          console.log('✅ Service: Reserva atualizada (formato direto):', response);
          return response as Schedule;
        }
      }
      
      throw new Error('Resposta da API em formato inesperado');
    } catch (error) {
      console.error('❌ Service: Erro ao atualizar reserva:', error);
      
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

  /**
   * Deletar uma reserva
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('🔍 Service: Deletando reserva:', id);
      
      await api.delete(`/schedule/${id}`);
      
      console.log('✅ Service: Reserva deletada com sucesso');
    } catch (error) {
      console.error('❌ Service: Erro ao deletar reserva:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Reserva não encontrada');
        }
      }
      
      throw error;
    }
  }

  /**
   * Listar todas as reservas
   */
  static async getAll(): Promise<Schedule[]> {
    try {
      console.log('🔍 Service: Buscando todas as reservas...');
      
      // Por enquanto, como não temos endpoint GET /schedule, vamos simular
      // Em uma implementação real, seria:
      // const response = await api.get<any>('/schedule');
      
      console.warn('⚠️ Service: Endpoint GET /schedule não implementado, retornando array vazio');
      return [];
      
      // Quando implementar no backend, descomente:
      /*
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
      */
    } catch (error) {
      console.error('❌ Service: Erro ao buscar reservas:', error);
      return [];
    }
  }

  /**
   * Buscar reservas por usuário
   */
  static async getByUser(userId: string): Promise<Schedule[]> {
    try {
      // Em uma implementação real, seria GET /schedule?userId=xxx
      console.log('🔍 Service: Buscando reservas do usuário:', userId);
      const allReservations = await this.getAll();
      return allReservations.filter(reservation => reservation.userId === userId);
    } catch (error) {
      console.error('❌ Service: Erro ao buscar reservas do usuário:', error);
      return [];
    }
  }

  /**
   * Buscar reservas por quadra
   */
  static async getByCourt(courtId: string): Promise<Schedule[]> {
    try {
      console.log('🔍 Service: Buscando reservas da quadra:', courtId);
      const allReservations = await this.getAll();
      return allReservations.filter(reservation => reservation.courtId === courtId);
    } catch (error) {
      console.error('❌ Service: Erro ao buscar reservas da quadra:', error);
      return [];
    }
  }

  /**
   * Buscar reservas por status
   */
  static async getByStatus(status: string): Promise<Schedule[]> {
    try {
      const allReservations = await this.getAll();
      return allReservations.filter(reservation => reservation.status === status);
    } catch (error) {
      console.error('❌ Service: Erro ao buscar reservas por status:', error);
      return [];
    }
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
    try {
      const courtReservations = await this.getByCourt(courtId);
      
      return courtReservations.some(reservation => {
        if (excludeId && reservation.id === excludeId) {
          return false; // Ignore própria reserva ao editar
        }
        
        if (reservation.status === 'cancelled' || reservation.status === 'cancelado') {
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
    } catch (error) {
      console.error('❌ Service: Erro ao verificar conflito:', error);
      return false; // Em caso de erro, não bloquear
    }
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
}