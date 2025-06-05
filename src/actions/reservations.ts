"use server";

import type * as z from "zod";
import { apiClient } from "@/lib/api";
import { ReservationSchema } from "@/lib/validations";
import type { Reservation } from "@/types/reservation";

export const createReservation = async (
  values: z.infer<typeof ReservationSchema>
): Promise<{ success?: string; error?: string; reservation?: Reservation }> => {
  const validatedFields = ReservationSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Dados inválidos!" };
  }

  try {
    const reservation = await apiClient.post<Reservation>("/reservations", validatedFields.data);
    return { success: "Reserva criada com sucesso!", reservation };
  } catch (error) {
    console.error("Error creating reservation:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("409")) {
        return { error: "Horário não disponível!" };
      }
      if (error.message.includes("400")) {
        return { error: "Dados da reserva inválidos!" };
      }
    }
    
    return { error: "Erro ao criar reserva" };
  }
};

export const getUserReservations = async (
  userId: string
): Promise<{ reservations?: Reservation[]; error?: string }> => {
  try {
    const reservations = await apiClient.get<Reservation[]>(`/reservations/user/${userId}`);
    return { reservations };
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    return { error: "Erro ao buscar reservas" };
  }
};

export const cancelReservation = async (
  reservationId: string
): Promise<{ success?: string; error?: string }> => {
  try {
    await apiClient.delete(`/reservations/${reservationId}`);
    return { success: "Reserva cancelada com sucesso!" };
  } catch (error) {
    console.error("Error canceling reservation:", error);
    return { error: "Erro ao cancelar reserva" };
  }
};

export const getReservationsByDate = async (
  date: string
): Promise<{ reservations?: Reservation[]; error?: string }> => {
  try {
    const reservations = await apiClient.get<Reservation[]>(`/reservations/date/${date}`);
    return { reservations };
  } catch (error) {
    console.error("Error fetching reservations by date:", error);
    return { error: "Erro ao buscar reservas por data" };
  }
};