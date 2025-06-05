"use server";

import { apiClient } from "@/lib/api";
import type { Court } from "@/types/court";

export const getCourts = async (): Promise<{ courts?: Court[]; error?: string }> => {
  try {
    const courts = await apiClient.get<Court[]>("/courts");
    return { courts };
  } catch (error) {
    console.error("Error fetching courts:", error);
    return { error: "Erro ao buscar quadras" };
  }
};

export const getCourtById = async (id: string): Promise<{ court?: Court; error?: string }> => {
  try {
    const court = await apiClient.get<Court>(`/courts/${id}`);
    return { court };
  } catch (error) {
    console.error("Error fetching court:", error);
    return { error: "Erro ao buscar quadra" };
  }
};

export const getAvailableCourts = async (
  date: string,
  startTime: string,
  endTime: string
): Promise<{ courts?: Court[]; error?: string }> => {
  try {
    const courts = await apiClient.get<Court[]>(
      `/courts/available?date=${date}&startTime=${startTime}&endTime=${endTime}`
    );
    return { courts };
  } catch (error) {
    console.error("Error fetching available courts:", error);
    return { error: "Erro ao buscar quadras disponíveis" };
  }
};