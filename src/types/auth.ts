export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface CreateUserRequest {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  role: string;
}

export interface UpdateUserRequest {
  nome?: string;
  email?: string;
  senha?: string;
  telefone?: string;
  role?: string;
}