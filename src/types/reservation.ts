// src/types/reservation.ts

export interface Schedule {
  id: string;
  dataHoraInicio: string; // ISO date string
  dataHoraFim: string; // ISO date string
  status: string;
  userId: string;
  courtId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateScheduleRequest {
  dataHoraInicio: Date;
  dataHoraFim: Date;
  status: string;
  userId: string;
  courtId: string;
}

export interface UpdateScheduleRequest {
  dataHoraInicio?: string;
  dataHoraFim?: string;
  status?: string;
  userId?: string;
  courtId?: string;
}

export interface ScheduleResponse {
  schedule: Schedule;
}

// Tipos para o frontend (com dados extras)
export interface ReservationDisplay extends Schedule {
  courtName?: string;
  courtLocation?: string;
  sport?: string;
  userName?: string;
  userEmail?: string;
  duration?: number;
  icon?: string;
}

export type ReservationStatus = 'upcoming' | 'completed' | 'cancelled';

export interface ReservationFilter {
  status?: ReservationStatus;
  courtId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}