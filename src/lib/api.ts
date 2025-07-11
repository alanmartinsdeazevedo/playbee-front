import { AuthService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class SimpleApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    // Usar diretamente o AuthService para consistência
    if (typeof window === 'undefined') return null;
    
    console.log('🔍 Debug: SimpleApiClient - obtendo token via AuthService...');
    const token = AuthService.getToken();
    console.log('🔍 Debug: SimpleApiClient - token obtido:', token ? 'SIM' : 'NÃO');
    
    return token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const token = this.getAuthToken();
    const optionsHeaders = options.headers as Record<string, string> | undefined;
    
    // Só adicionar Content-Type se houver body
    const headers: Record<string, string> = {
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(optionsHeaders || {}),
    };
    
    console.log('Debug: Headers sendo enviados:', headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }

      // Handle no content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${options.method || 'GET'} ${url}]:`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Optionally, throw an error if API_BASE_URL is not set
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}
export const api = new SimpleApiClient(API_BASE_URL);