'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import {
  Sports as SportsIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/services/user.service';
import type { User } from '@/types/auth';

export const DashboardView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Verificar se está autenticado
        const currentUser = AuthService.getUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        // Carregar dados do dashboard
        const users = await UserService.getAll();
        setTotalUsers(users.length);

      } catch (err) {
        setError('Erro ao carregar dados do dashboard');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
  };

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const stats = [
    {
      title: 'Usuários Cadastrados',
      value: totalUsers.toString(),
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Quadras Disponíveis',
      value: '12',
      icon: <SportsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Reservas Hoje',
      value: '8',
      icon: <CalendarIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
    {
      title: 'Próxima Reserva',
      value: '14:00',
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
            Bem-vindo, {user?.nome}!
          </Typography>
        </Box>
        <Button variant="outlined" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid 
            key={index}
            size={{ xs: 12, sm: 6, md: 3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<SportsIcon />}
                  onClick={() => router.push('/dashboard/courts')}
                  fullWidth
                >
                  Ver Quadras Disponíveis
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={() => router.push('/dashboard/reservations')}
                  fullWidth
                >
                  Minhas Reservas
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações do Sistema
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  • Backend Fastify rodando na porta 3333
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • {totalUsers} usuários cadastrados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • PWA instalável disponível
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Sistema de reservas ativo
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};