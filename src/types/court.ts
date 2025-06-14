// src/types/court.ts

export interface Court {
  id: string;
  nome: string;
  tipo: string;
  localizacao: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCourtRequest {
  nome: string;
  tipo: string;
  localizacao: string;
}

export interface UpdateCourtRequest {
  nome?: string;
  tipo?: string;
  localizacao?: string;
}

export interface CourtResponse {
  court: Court;
}

export interface CourtsListResponse {
  courts: Court[];
}

// Tipos para o frontend (com dados extras)
export interface CourtDisplay extends Court {
  rating?: number;
  available?: boolean;
  image?: string;
  features?: string[];
  description?: string;
}