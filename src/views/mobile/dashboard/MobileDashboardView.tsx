'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  Sports as SportsIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  PlayArrow as PlayArrowIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/services/user.service';
import type { User } from '@/types/auth';

export const MobileDashboardView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const currentUser = AuthService.getUser();
        if (!currentUser) {
          router.push('/mobile/login');
          return;
        }
        setUser(currentUser);

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

  const upcomingReservations = [
    { time: '14:00', court: 'Quadra 1', sport: 'Futebol', date: 'Hoje' },
    { time: '16:30', court: 'Quadra 3', sport: 'Basquete', date: 'Amanhã' },
  ];

  const quickStats = [
    { label: 'Reservas este mês', value: '8', color: 'primary' },
    { label: 'Horas jogadas', value: '24h', color: 'success' },
    { label: 'Próxima reserva', value: '14:00', color: 'warning' },
  ];

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Welcome Section */}
      <Paper 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 3,
          borderRadius: 3,
          mb: 3,
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar 
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 56, 
              height: 56 
            }}
          >
            {user?.nome?.charAt(0) || 'U'}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h6" fontWeight="bold">
              Olá, {user?.nome?.split(' ')[0]}! 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Pronto para jogar hoje?
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats - Usando Stack horizontal */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {quickStats.map((stat, index) => (
          <Card key={index} sx={{ flex: 1, textAlign: 'center', py: 2 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="h6" color={`${stat.color}.main`} fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Quick Actions */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Ações Rápidas
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<SportsIcon />}
              onClick={() => router.push('/mobile/courts')}
              sx={{ 
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Ver Quadras
            </Button>
            <Button
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => router.push('/mobile/reservations')}
              sx={{ 
                flex: 1,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Reservar
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Upcoming Reservations */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Próximas Reservas
            </Typography>
            <Chip 
              label={upcomingReservations.length} 
              size="small" 
              color="primary"
            />
          </Box>
          
          {upcomingReservations.length > 0 ? (
            <List sx={{ p: 0 }}>
              {upcomingReservations.map((reservation, index) => (
                <Box key={index}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          width: 40, 
                          height: 40 
                        }}
                      >
                        <AccessTimeIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {reservation.court}
                          </Typography>
                          <Chip 
                            label={reservation.date} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {reservation.time} • {reservation.sport}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < upcomingReservations.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={3}>
              <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Nenhuma reserva agendada
              </Typography>
              <Button 
                variant="text" 
                onClick={() => router.push('/mobile/courts')}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                Fazer uma reserva
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};