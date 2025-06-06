import type { User } from "./auth";
import type { Court } from "./court";

export interface Schedule {
  id: string;
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  user_id: string;
  court_id: string;
  user?: User;
  court?: Court;
}

export interface CreateScheduleRequest {
  dataHoraInicio: string;
  dataHoraFim: string;
  status: string;
  user_id: string;
  court_id: string;
}

export interface UpdateScheduleRequest {
  dataHoraInicio?: string;
  dataHoraFim?: string;
  status?: string;
  user_id?: string;
  court_id?: string;
}

export type Reservation = Schedule;
export type CreateReservationRequest = CreateScheduleRequest;
export type UpdateReservationRequest = UpdateScheduleRequest;