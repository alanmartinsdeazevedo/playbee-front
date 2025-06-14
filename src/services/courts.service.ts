import { api } from '@/lib/api';
import type { 
  Court, 
  CreateCourtRequest, 
  UpdateCourtRequest, 
  CourtResponse, 
  CourtsListResponse 
} from '@/types/court';

export class CourtsService {
  /**
   * Criar uma nova quadra
   */
  static async create(data: CreateCourtRequest): Promise<Court> {
    const response = await api.post<CourtResponse>('/court', data);
    return response.court;
  }

  /**
   * Listar todas as quadras
   */
  static async getAll(): Promise<Court[]> {
    try {
      const response = await api.get<CourtsListResponse>('/court');
      
      // Verificar se a resposta tem a estrutura esperada
      if (response && typeof response === 'object') {
        // Se retornar { courts: [...] }
        if ('courts' in response && Array.isArray(response.courts)) {
          return response.courts;
        }
        // Se retornar array diretamente
        if (Array.isArray(response)) {
          return response;
        }
        // Se retornar objeto vazio ou formato inesperado
        console.warn('Resposta da API em formato inesperado:', response);
        return [];
      }
      
      console.warn('Resposta vazia da API');
      return [];
    } catch (error) {
      console.error('Erro detalhado ao buscar quadras:', error);
      
      // Se for erro 500, dar uma mensagem mais específica
      if (error instanceof Error && error.message.includes('500')) {
        throw new Error('Erro interno do servidor. Verifique o backend.');
      }
      
      throw error;
    }
  }

  /**
   * Buscar uma quadra por ID
   */
  static async getById(id: string): Promise<Court> {
    try {
      console.log('🔍 Service: Buscando quadra por ID:', id);
      
      // O backend retorna { court: Court } baseado no get-court-by-id-controller.ts
      const response = await api.get<{ court: Court }>(`/court/${id}`);
      
      console.log('✅ Service: Quadra encontrada:', response.court);
      return response.court;
      
    } catch (error) {
      console.error('❌ Service: Erro ao buscar quadra por ID:', error);
      
      // Verificar tipos específicos de erro
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Quadra não encontrada');
        }
        
        if (error.message.includes('500')) {
          throw new Error('Erro interno do servidor ao buscar quadra');
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conexão ao buscar quadra');
        }
      }
      
      throw error;
    }
  }

  /**
   * Atualizar uma quadra
   */
  static async update(id: string, data: UpdateCourtRequest): Promise<Court> {
    const response = await api.put<CourtResponse>(`/court/${id}`, data);
    return response.court;
  }

  /**
   * Deletar uma quadra
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('🔍 Service: Deletando quadra com ID:', id);
      
      const response = await api.delete(`/court/${id}`);
      
      console.log('✅ Service: Quadra deletada, resposta:', response);
    } catch (error) {
      console.error('❌ Service: Erro ao deletar quadra:', error);
      
      // Verificar se é erro de não encontrado
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Quadra não encontrada');
      }
      
      // Verificar se é erro de integridade
      if (error instanceof Error && error.message.includes('reservas associadas')) {
        throw new Error('Não é possível excluir quadra com reservas associadas');
      }
      
      throw error;
    }
  }

  /**
   * Buscar quadras por tipo
   */
  static async getByType(tipo: string): Promise<Court[]> {
    const courts = await this.getAll();
    return courts.filter(court => 
      court.tipo.toLowerCase().includes(tipo.toLowerCase())
    );
  }

  /**
   * Buscar quadras por localização
   */
  static async getByLocation(localizacao: string): Promise<Court[]> {
    const courts = await this.getAll();
    return courts.filter(court => 
      court.localizacao.toLowerCase().includes(localizacao.toLowerCase())
    );
  }

  /**
   * Buscar quadras com filtros
   */
  static async search(filters: {
    nome?: string;
    tipo?: string;
    localizacao?: string;
  }): Promise<Court[]> {
    const courts = await this.getAll();
    
    return courts.filter(court => {
      const matchesNome = !filters.nome || 
        court.nome.toLowerCase().includes(filters.nome.toLowerCase());
      
      const matchesTipo = !filters.tipo || 
        court.tipo.toLowerCase().includes(filters.tipo.toLowerCase());
      
      const matchesLocalizacao = !filters.localizacao || 
        court.localizacao.toLowerCase().includes(filters.localizacao.toLowerCase());
      
      return matchesNome && matchesTipo && matchesLocalizacao;
    });
  }

  /**
   * Validar dados antes de criar/atualizar
   */
  static validateCourtData(data: CreateCourtRequest | UpdateCourtRequest): string[] {
    const errors: string[] = [];

    if ('nome' in data && data.nome !== undefined) {
      if (!data.nome || data.nome.trim().length < 3) {
        errors.push('Nome deve ter pelo menos 3 caracteres');
      }
    }

    if ('tipo' in data && data.tipo !== undefined) {
      if (!data.tipo || data.tipo.trim().length < 3) {
        errors.push('Tipo deve ter pelo menos 3 caracteres');
      }
    }

    if ('localizacao' in data && data.localizacao !== undefined) {
      if (!data.localizacao || data.localizacao.trim().length < 3) {
        errors.push('Localização deve ter pelo menos 3 caracteres');
      }
    }

    return errors;
  }
}