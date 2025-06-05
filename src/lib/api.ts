import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiRequestConfig extends RequestInit {
  headers?: Record<string, string>;
  timeout?: number;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, defaultTimeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
  }

  private getAuthToken(): string | null {
    try {
      if (typeof window === 'undefined') {
        const cookieStore = cookies();
        return cookieStore.get('auth-token')?.value || null;
      }
      
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => 
        cookie.trim().startsWith('auth-token=')
      );
      
      if (authCookie) {
        return authCookie.split('=')[1];
      }
      
      return null;
    } catch (error) {
      console.warn('Erro ao obter token de autenticação:', error);
      return null;
    }
  }

  private prepareHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private createTimeoutController(timeout: number): AbortController {
    const controller = new AbortController();
    
    setTimeout(() => {
      controller.abort();
    }, timeout);

    return controller;
  }

  // Método principal para fazer requisições
  async request<T>(
    endpoint: string, 
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = config.timeout || this.defaultTimeout;
    const controller = this.createTimeoutController(timeout);

    const requestConfig: RequestInit = {
      ...config,
      headers: this.prepareHeaders(config.headers),
      signal: controller.signal,
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, requestConfig);
      
      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('API Response Data:', data);
        return data;
      }

      const text = await response.text();
      return (text ? { message: text } : {}) as T;

    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Timeout: A requisição demorou mais que ${timeout}ms`);
        }
        
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Erro de conexão: Verifique sua internet ou se o servidor está funcionando');
        }
      }

      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Tratar erros de resposta
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorDetails: any = null;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData;
      } else {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      console.warn('Erro ao fazer parse da resposta de erro:', parseError);
    }

    // Erro customizado
    const apiError = new Error(errorMessage) as Error & ApiError;
    apiError.status = response.status;
    apiError.details = errorDetails;

    // Mapeamento de status para mensagens de erro
    switch (response.status) {
      case 400:
        apiError.message = 'Dados inválidos enviados para o servidor';
        break;
      case 401:
        apiError.message = 'Não autorizado: Faça login novamente';
        break;
      case 403:
        apiError.message = 'Acesso negado: Você não tem permissão para esta ação';
        break;
      case 404:
        apiError.message = 'Recurso não encontrado';
        break;
      case 409:
        apiError.message = 'Conflito: O recurso já existe ou está em uso';
        break;
      case 422:
        apiError.message = 'Dados inválidos: Verifique os campos enviados';
        break;
      case 429:
        apiError.message = 'Muitas tentativas: Tente novamente em alguns minutos';
        break;
      case 500:
        apiError.message = 'Erro interno do servidor: Tente novamente mais tarde';
        break;
      case 502:
      case 503:
      case 504:
        apiError.message = 'Servidor indisponível: Tente novamente mais tarde';
        break;
    }

    throw apiError;
  }

  // Métodos de requisição
  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, config?: Omit<ApiRequestConfig, 'method'>): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Upload de arquivos
  async uploadFile<T>(
    endpoint: string, 
    file: File, 
    additionalData?: Record<string, any>,
    config?: Omit<ApiRequestConfig, 'method' | 'body' | 'headers'>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    // Dados extras
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    // Para uploads, não definir Content-Type
    const headers = this.prepareHeaders();
    delete headers['Content-Type'];

    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: formData,
      headers,
    });
  }

  // Requisições com query parameters
  async getWithParams<T>(
    endpoint: string, 
    params: Record<string, any>,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<T> {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryString.append(key, String(value));
      }
    });

    const url = queryString.toString() ? `${endpoint}?${queryString.toString()}` : endpoint;
    return this.get<T>(url, config);
  }

  // Requisições paginadas
  async getPaginated<T>(
    endpoint: string,
    page: number = 1,
    limit: number = 10,
    additionalParams?: Record<string, any>,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const params = {
      page,
      limit,
      ...additionalParams,
    };

    return this.getWithParams(endpoint, params, config);
  }

  setBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Método para verificar saúde da API
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.get('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('API não está respondendo');
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export const handleApiError = (error: any): string => {
  if (error instanceof Error) {
    // Erro customizado
    if ('status' in error) {
      return error.message;
    }
    
    if (error.message.includes('Failed to fetch')) {
      return 'Erro de conexão. Verifique sua internet.';
    }
    
    if (error.message.includes('Timeout')) {
      return 'A requisição demorou muito para responder.';
    }
    
    return error.message;
  }
  
  return 'Erro desconhecido occurred';
};

export type { ApiRequestConfig, ApiError };

export const useApiClient = () => {
  return {
    apiClient,
    handleApiError,
  };
};

export default apiClient;