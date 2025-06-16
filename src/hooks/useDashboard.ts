// src/hooks/useDashboard.ts

import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/services/user.service';
import { CourtsService } from '@/services/courts.service';
import { ReservationsService } from '@/services/reservations.service';
import type { User } from '@/types/auth';
import type { Court } from '@/types/court';
import type { Schedule } from '@/types/reservation';

interface DashboardStats {
  // Dados gerais
  totalCourts: number;
  myReservations: number;
  upcomingReservations: number;
  completedReservations: number;
  nextReservation?: string;
  
  // Dados apenas para admin
  totalUsers?: number;
  totalReservations?: number;
  
  // Dados calculados
  todayReservations: number;
  thisWeekReservations: number;
}

interface UseDashboardResult {
  user: User | null;
  stats: DashboardStats;
  isLoading: boolean;
  error: string;
  refreshData: () => Promise<void>;
  clearError: () => void;
  isAdmin: boolean;
}

export const useDashboard = (): UseDashboardResult => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCourts: 0,
    myReservations: 0,
    upcomingReservations: 0,
    completedReservations: 0,
    todayReservations: 0,
    thisWeekReservations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const isAdmin = user?.role === 'ADMIN';

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Verificar autenticação
      const currentUser = AuthService.getUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      setUser(currentUser);

      const isUserAdmin = currentUser.role === 'ADMIN';

      // Carregar dados das quadras
      let courts: Court[] = [];
      try {
        courts = await CourtsService.getAll();
      } catch (err) {
        console.warn('Erro ao carregar quadras:', err);
      }

      // Carregar dados das reservas
      let allReservations: Schedule[] = [];
      let userReservations: Schedule[] = [];
      
      try {
        if (isUserAdmin) {
          // Admin: buscar todas as reservas
          allReservations = await ReservationsService.getAll();
          userReservations = allReservations.filter(r => r.userId === currentUser.id);
        } else {
          // Usuário comum: buscar apenas suas reservas
          userReservations = await ReservationsService.getByUser(currentUser.id);
        }
      } catch (err) {
        console.warn('Erro ao carregar reservas:', err);
      }

      // Carregar total de usuários (apenas para admin)
      let totalUsers = 0;
      if (isUserAdmin) {
        try {
          const users = await UserService.getAll();
          totalUsers = Array.isArray(users) ? users.length : 0;
        } catch (err) {
          console.warn('Erro ao carregar usuários:', err);
        }
      }

      // Calcular estatísticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // Filtrar reservas ativas (não canceladas)
      const activeUserReservations = userReservations.filter(r => 
        !['cancelado', 'cancelled'].includes(r.status.toLowerCase())
      );

      // Próximas reservas
      const upcomingReservations = activeUserReservations.filter(r => {
        const startTime = new Date(r.dataHoraInicio);
        return startTime >= now;
      }).length;

      // Reservas concluídas
      const completedReservations = activeUserReservations.filter(r => {
        const endTime = new Date(r.dataHoraFim);
        return endTime < now || ['concluido', 'completed'].includes(r.status.toLowerCase());
      }).length;

      // Reservas de hoje
      const todayReservations = activeUserReservations.filter(r => {
        const reservationDate = new Date(r.dataHoraInicio);
        return reservationDate >= today && reservationDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length;

      // Reservas desta semana
      const thisWeekReservations = activeUserReservations.filter(r => {
        const reservationDate = new Date(r.dataHoraInicio);
        return reservationDate >= weekStart && reservationDate <= weekEnd;
      }).length;

      // Próxima reserva
      const nextReservations = activeUserReservations
        .filter(r => {
          const startTime = new Date(r.dataHoraInicio);
          return startTime >= now;
        })
        .sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime());

      const nextReservation = nextReservations.length > 0 
        ? new Date(nextReservations[0].dataHoraInicio).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        : undefined;

      // Montar estatísticas
      const newStats: DashboardStats = {
        totalCourts: courts.length,
        myReservations: userReservations.length,
        upcomingReservations,
        completedReservations,
        nextReservation,
        todayReservations,
        thisWeekReservations,
        ...(isUserAdmin && { 
          totalUsers,
          totalReservations: allReservations.length 
        }),
      };

      setStats(newStats);

    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    user,
    stats,
    isLoading,
    error,
    refreshData,
    clearError,
    isAdmin,
  };
};