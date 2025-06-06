export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
}