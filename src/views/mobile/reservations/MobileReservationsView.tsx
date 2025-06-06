'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Button,
  Divider,
  Paper,
  Alert,
  Fab,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: number;
  courtName: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  icon: string;
}

export const MobileReservationsView = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const router = useRouter();

  const reservations: Reservation[] = [
    {
      id: 1,
      courtName: 'Quadra Central',
      sport: 'Futebol',
      date: '2025-06-07',
      time: '14:00',
      duration: 2,
      price: 160,
      status: 'upcoming',
      icon: '⚽'
    },
    {
      id: 2,
      courtName: 'Arena Basketball',
      sport: 'Basquete',
      date: '2025-06-08',
      time: '16:30',
      duration: 1.5,
      price: 90,
      status: 'upcoming',
      icon: '🏀'
    },
    {
      id: 3,
      courtName: 'Court Tennis Pro',
      sport: 'Tênis',
      date: '2025-06-05',
      time: '10:00',
      duration: 1,
      price: 100,
      status: 'completed',
      icon: '🎾'
    },
  ];

  const tabs = ['Próximas', 'Histórico', 'Canceladas'];

  const getFilteredReservations = () => {
    switch (selectedTab) {
      case 0:
        return reservations.filter(r => r.status === 'upcoming');
      case 1:
        return reservations.filter(r => r.status === 'completed');
      case 2:
        return reservations.filter(r => r.status === 'cancelled');
      default:
        return [];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        weekday: 'short'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Agendado';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return '';
    }
  };

  const filteredReservations = getFilteredReservations();

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Minhas Reservas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie seus agendamentos
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <Tab 
              key={tab} 
              label={tab} 
              sx={{ textTransform: 'none' }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Reservations List */}
      {filteredReservations.length > 0 ? (
        <List sx={{ p: 0 }}>
          {filteredReservations.map((reservation, index) => (
            <Box key={reservation.id}>
              <Card sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" gap={2}>
                    <Avatar 
                      sx={{ 
                        width: 50, 
                        height: 50,
                        bgcolor: `${getStatusColor(reservation.status)}.main`,
                        fontSize: '1.5rem'
                      }}
                    >
                      {reservation.icon}
                    </Avatar>

                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {reservation.courtName}
                        </Typography>
                        <Chip 
                          label={getStatusText(reservation.status)}
                          size="small"
                          color={getStatusColor(reservation.status) as any}
                          variant="filled"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {reservation.sport}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(reservation.date)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {reservation.time} ({reservation.duration}h)
                          </Typography>
                        </Box>
                      </Box>

                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          R$ {reservation.price}
                        </Typography>
                        
                        {reservation.status === 'upcoming' && (
                          <Box display="flex" gap={1}>
                            <IconButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </List>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma reserva encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {selectedTab === 0 
              ? 'Você não tem reservas agendadas'
              : selectedTab === 1 
              ? 'Nenhuma reserva foi concluída ainda'
              : 'Nenhuma reserva foi cancelada'
            }
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/mobile/courts')}
            sx={{ textTransform: 'none' }}
          >
            Fazer uma Reserva
          </Button>
        </Paper>
      )}

      {/* Floating Action Button */}
      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => router.push('/mobile/courts')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};