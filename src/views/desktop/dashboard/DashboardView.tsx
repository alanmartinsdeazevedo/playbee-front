'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Container,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  Sports as SportsIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  DateRange as WeekIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { useDashboard } from '@/hooks/useDashboard';

export const DashboardView = () => {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  
  const { 
    user, 
    stats, 
    isLoading, 
    error, 
    refreshData, 
    clearError, 
    isAdmin 
  } = useDashboard();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  const handleRefresh = () => {
    refreshData();
  };

  // Aguardar montagem para evitar hidratação
  if (!isMounted) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Carregando dashboard...
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Configurar cards baseado no papel do usuário
  const getDashboardCards = () => {
    if (isAdmin) {
      return [
        {
          title: 'Usuários Cadastrados',
          value: (stats.totalUsers || 0).toString(),
          icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
          color: 'primary.main',
          path: '/desktop/users',
        },
        {
          title: 'Quadras Disponíveis',
          value: (stats.totalCourts || 0).toString(),
          icon: <SportsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
          color: 'success.main',
          path: '/desktop/courts',
        },
        {
          title: 'Total de Reservas',
          value: (stats.totalReservations || 0).toString(),
          icon: <CalendarIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
          color: 'warning.main',
          path: '/desktop/reservations',
        },
        {
          title: 'Próximas Reservas',
          value: (stats.upcomingReservations || 0).toString(),
          icon: <ScheduleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
          color: 'info.main',
          path: '/desktop/reservations',
        },
      ];
    } else {
      return [
        {
          title: 'Minhas Reservas',
          value: (stats.myReservations || 0).toString(),
          icon: <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
          color: 'primary.main',
          path: '/desktop/reservations',
        },
        {
          title: 'Próximas Reservas',
          value: (stats.upcomingReservations || 0).toString(),
          icon: <ScheduleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
          color: 'success.main',
          path: '/desktop/reservations',
        },
        {
          title: 'Reservas Hoje',
          value: (stats.todayReservations || 0).toString(),
          icon: <TodayIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
          color: 'warning.main',
          path: '/desktop/reservations',
        },
        {
          title: 'Próxima Reserva',
          value: stats.nextReservation || '--:--',
          icon: <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main' }} />,
          color: 'info.main',
          path: '/desktop/reservations',
        },
      ];
    }
  };

  const dashboardCards = getDashboardCards();

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isAdmin ? 'Dashboard Administrativo' : 'Meu Dashboard'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bem-vindo de volta, {user?.nome || 'Usuário'}! 👋
          </Typography>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Chip 
              label={isAdmin ? 'Administrador' : 'Usuário'} 
              color={isAdmin ? 'error' : 'primary'} 
              size="small" 
            />
            <Typography variant="caption" color="text.secondary">
              Última atualização: {new Date().toLocaleTimeString('pt-BR')}
            </Typography>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Atualizar
          </Button>
          <Button 
            variant="outlined" 
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3}
          sx={{
            '& > *': {
              flex: { sm: 1 },
            }
          }}
        >
          {dashboardCards.map((card, index) => (
            <Card 
              key={index} 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => router.push(card.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" fontWeight="bold">
                      {card.value}
                    </Typography>
                  </Box>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Action Cards */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={3}
        sx={{
          '& > *': {
            flex: { md: 1 },
          }
        }}
      >
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Ações Rápidas
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isAdmin 
                ? 'Acesse rapidamente as principais funcionalidades administrativas'
                : 'Acesse rapidamente suas funcionalidades'
              }
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<SportsIcon />}
                onClick={() => router.push('/desktop/courts')}
                fullWidth
                size="large"
              >
                {isAdmin ? 'Gerenciar Quadras' : 'Ver Quadras Disponíveis'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={() => router.push('/desktop/reservations')}
                fullWidth
                size="large"
              >
                {isAdmin ? 'Gerenciar Reservas' : 'Minhas Reservas'}
              </Button>
              {isAdmin ? (
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => router.push('/desktop/users')}
                  fullWidth
                  size="large"
                >
                  Gerenciar Usuários
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={() => router.push('/desktop/reservations/new')}
                  fullWidth
                  size="large"
                >
                  Fazer Nova Reserva
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {isAdmin ? 'Status do Sistema' : 'Resumo da Conta'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {isAdmin 
                ? 'Informações sobre o funcionamento da aplicação'
                : 'Informações sobre sua atividade'
              }
            </Typography>
            <Stack spacing={2}>
              {isAdmin ? (
                <>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Backend API
                      </Typography>
                      <Chip label="Online" color="success" size="small" />
                    </Box>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Usuários Ativos
                      </Typography>
                      <Chip label={stats.totalUsers || 0} color="primary" size="small" />
                    </Box>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Quadras Cadastradas
                      </Typography>
                      <Chip label={stats.totalCourts || 0} color="info" size="small" />
                    </Box>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Total de Reservas
                      </Typography>
                      <Chip label={stats.totalReservations || 0} color="warning" size="small" />
                    </Box>
                  </Paper>
                </>
              ) : (
                <>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Reservas Agendadas
                      </Typography>
                      <Chip label={stats.upcomingReservations || 0} color="primary" size="small" />
                    </Box>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Reservas Hoje
                      </Typography>
                      <Chip label={stats.todayReservations || 0} color="warning" size="small" />
                    </Box>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Reservas Esta Semana
                      </Typography>
                      <Chip label={stats.thisWeekReservations || 0} color="info" size="small" />
                    </Box>
                  </Paper>
                  
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">
                        Próxima Reserva
                      </Typography>
                      <Chip 
                        label={stats.nextReservation || 'Nenhuma'} 
                        color={stats.nextReservation ? "success" : "default"} 
                        size="small" 
                      />
                    </Box>
                  </Paper>
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};