export interface Court {
  id: string;
  name: string;
  description?: string;
  sport: SportType;
  location: string;
  price: number;
  rating: number;
  available: boolean;
  features: string[];
  images: string[];
  capacity: number;
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type SportType = 'futebol' | 'basquete' | 'tenis' | 'volei' | 'outros';

// Criar quadra
export interface CreateCourtRequest {
  name: string;
  description?: string;
  sport: SportType;
  location: string;
  price: number;
  features: string[];
  capacity: number;
  workingHours: {
    start: string;
    end: string;
  };
}

// Atualizar quadra
export interface UpdateCourtRequest {
  name?: string;
  description?: string;
  sport?: SportType;
  location?: string;
  price?: number;
  features?: string[];
  capacity?: number;
  workingHours?: {
    start: string;
    end: string;
  };
  available?: boolean;
}