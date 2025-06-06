export interface Court {
  id: string;
  nome: string;
  tipo: string;
  localizacao: string;
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