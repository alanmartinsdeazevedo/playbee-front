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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/services/user.service';
import type { User } from '@/types/auth';

interface DashboardStats {
  totalUsers: number;
  totalCourts: number;
  todayReservations: number;
  nextReservation: string;
}

export const DashboardView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourts: 12,
    todayReservations: 8,
    nextReservation: '14:00'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Verificar se está autenticado
      const currentUser = AuthService.getUser();
      if (!currentUser) {
        router.push('/desktop/login');
        return;
      }
      setUser(currentUser);

      // Carregar dados do dashboard com fallback seguro
      try {
        const users = await UserService.getAll();
        setStats(prev => ({
          ...prev,
          totalUsers: Array.isArray(users) ? users.length : 0
        }));
      } catch (userError) {
        console.warn('Erro ao carregar usuários:', userError);
        // Manter valores padrão em caso de erro
      }

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
  };

  const handleRefresh = () => {
    loadDashboardData();
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

  const dashboardCards = [
    {
      title: 'Usuários Cadastrados',
      value: (stats.totalUsers || 0).toString(),
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Quadras Disponíveis',
      value: (stats.totalCourts || 0).toString(),
      icon: <SportsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Reservas Hoje',
      value: (stats.todayReservations || 0).toString(),
      icon: <CalendarIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
    {
      title: 'Próxima Reserva',
      value: stats.nextReservation || '--:--',
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
  ];

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
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bem-vindo de volta, {user?.nome || 'Usuário'}! 👋
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </Typography>
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
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
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
              Acesse rapidamente as principais funcionalidades
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                startIcon={<SportsIcon />}
                onClick={() => router.push('/desktop/courts')}
                fullWidth
                size="large"
              >
                Ver Quadras Disponíveis
              </Button>
              <Button
                variant="outlined"
                startIcon={<CalendarIcon />}
                onClick={() => router.push('/desktop/reservations')}
                fullWidth
                size="large"
              >
                Gerenciar Reservas
              </Button>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => router.push('/desktop/users')}
                fullWidth
                size="large"
              >
                Usuários do Sistema
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Status do Sistema
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Informações sobre o funcionamento da aplicação
            </Typography>
            <Stack spacing={2}>
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
                    Usuários Cadastrados
                  </Typography>
                  <Chip label={stats.totalUsers || 0} color="primary" size="small" />
                </Box>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    PWA Status
                  </Typography>
                  <Chip label="Ativo" color="info" size="small" />
                </Box>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">
                    Versão
                  </Typography>
                  <Chip label="Desktop v1.0" variant="outlined" size="small" />
                </Box>
              </Paper>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
};