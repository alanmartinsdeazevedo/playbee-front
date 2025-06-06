import { api } from '@/lib/api';
import type { Court, CreateCourtRequest, UpdateCourtRequest } from '@/types/court';

export class CourtService {
  
  /**
   * Buscar todas as quadras
   */
  static async getAll(): Promise<Court[]> {
    try {
      const courts = await api.get<Court[]>('/courts');
      return courts;
    } catch (error) {
      console.error('Erro ao buscar quadras:', error);
      throw new Error('Erro ao buscar quadras');
    }
  }

  /**
   * Buscar quadra por ID
   */
  static async getById(id: string): Promise<Court> {
    try {
      const court = await api.get<Court>(`/courts/${id}`);
      return court;
    } catch (error) {
      console.error('Erro ao buscar quadra:', error);
      throw new Error('Erro ao buscar quadra');
    }
  }

  /**
   * Buscar quadras disponíveis para um horário específico
   */
  static async getAvailable(
    date: string,
    startTime: string,
    endTime: string
  ): Promise<Court[]> {
    try {
      const courts = await api.get<Court[]>(
        `/courts/available?date=${date}&startTime=${startTime}&endTime=${endTime}`
      );
      return courts;
    } catch (error) {
      console.error('Erro ao buscar quadras disponíveis:', error);
      throw new Error('Erro ao buscar quadras disponíveis');
    }
  }

  /**
   * Criar nova quadra
   */
  static async create(courtData: CreateCourtRequest): Promise<Court> {
    try {
      const newCourt = await api.post<Court>('/courts', courtData);
      return newCourt;
    } catch (error) {
      console.error('Erro ao criar quadra:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('409')) {
          throw new Error('Quadra já existe com esse nome');
        }
        if (error.message.includes('400')) {
          throw new Error('Dados da quadra inválidos');
        }
      }
      
      throw new Error('Erro ao criar quadra');
    }
  }

  /**
   * Atualizar quadra
   */
  static async update(id: string, courtData: UpdateCourtRequest): Promise<Court> {
    try {
      const updatedCourt = await api.put<Court>(`/courts/${id}`, courtData);
      return updatedCourt;
    } catch (error) {
      console.error('Erro ao atualizar quadra:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Quadra não encontrada');
        }
        if (error.message.includes('400')) {
          throw new Error('Dados da quadra inválidos');
        }
      }
      
      throw new Error('Erro ao atualizar quadra');
    }
  }

  /**
   * Deletar quadra
   */
  static async delete(id: string): Promise<void> {
    try {
      await api.delete(`/courts/${id}`);
    } catch (error) {
      console.error('Erro ao deletar quadra:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Quadra não encontrada');
        }
        if (error.message.includes('409')) {
          throw new Error('Não é possível deletar quadra com reservas ativas');
        }
      }
      
      throw new Error('Erro ao deletar quadra');
    }
  }

  /**
   * Buscar quadras por tipo
   */
  static async getByType(tipo: string): Promise<Court[]> {
    try {
      const courts = await api.get<Court[]>(`/courts/type/${tipo}`);
      return courts;
    } catch (error) {
      console.error('Erro ao buscar quadras por tipo:', error);
      throw new Error('Erro ao buscar quadras por tipo');
    }
  }

  /**
   * Buscar quadras por localização
   */
  static async getByLocation(localizacao: string): Promise<Court[]> {
    try {
      const courts = await api.get<Court[]>(`/courts/location/${encodeURIComponent(localizacao)}`);
      return courts;
    } catch (error) {
      console.error('Erro ao buscar quadras por localização:', error);
      throw new Error('Erro ao buscar quadras por localização');
    }
  }

  /**
   * Verificar disponibilidade de uma quadra específica
   */
  static async checkAvailability(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const response = await api.get<{ available: boolean }>(
        `/courts/${courtId}/availability?date=${date}&startTime=${startTime}&endTime=${endTime}`
      );
      return response.available;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade da quadra:', error);
      throw new Error('Erro ao verificar disponibilidade da quadra');
    }
  }
}