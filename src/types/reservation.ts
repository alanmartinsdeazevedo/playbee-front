import type { User } from "./auth";
import type { Court } from "./court";

export interface Reservation {
  id: string;
  userId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalPrice: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  user?: User;
  court?: Court;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

//Criar Reserva
export interface CreateReservationRequest {
  courtId: string;
  date: string;
  startTime: string;
  duration: number;
  notes?: string;
}

// Atualizar Reserva
export interface UpdateReservationRequest {
  date?: string;
  startTime?: string;
  duration?: number;
  notes?: string;
  status?: ReservationStatus;
}