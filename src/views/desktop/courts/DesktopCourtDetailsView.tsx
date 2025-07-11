'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Button,
  Paper,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Sports as SportsIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useCourts } from '@/hooks/useCourts';
import { AuthService } from '@/lib/auth';
import { ReservationsService } from '@/services/reservations.service';
import type { Schedule } from '@/types/reservation';
import type { User } from '@/types/auth';

export const DesktopCourtDetailsView = () => {
  const router = useRouter();
  const params = useParams();
  const courtId = params.id as string;
  
  const { courts, isLoading: courtsLoading, error: courtsError } = useCourts();
  const [reservations, setReservations] = useState<Schedule[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const court = courts.find(c => c.id === courtId);
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    const user = AuthService.getUser();
    if (!user) {
      router.push('/desktop/login');
      return;
    }
    setCurrentUser(user);
  }, [router]);

  useEffect(() => {
    if (court) {
      loadCourtReservations();
    }
  }, [court]);

  const loadCourtReservations = async () => {
    try {
      setIsLoadingReservations(true);
      const data = await ReservationsService.getByCourt(courtId);
      setReservations(data);
    } catch (err) {
      console.error('Erro ao carregar reservas da quadra:', err);
    } finally {
      setIsLoadingReservations(false);
    }
  };

  const getSportEmoji = (tipo: string): string => {
    const lowerTipo = tipo.toLowerCase();
    if (lowerTipo.includes('futebol') || lowerTipo.includes('futsal')) return '⚽';
    if (lowerTipo.includes('basquete') || lowerTipo.includes('basketball')) return '🏀';
    if (lowerTipo.includes('tênis') || lowerTipo.includes('tennis')) return '🎾';
    if (lowerTipo.includes('vôlei') || lowerTipo.includes('volei') || lowerTipo.includes('volleyball')) return '🏐';
    return '🏟️';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'primary';
      case 'confirmado':
        return 'success';
      case 'cancelado':
        return 'error';
      case 'concluido':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'Agendado';
      case 'confirmado':
        return 'Confirmado';
      case 'cancelado':
        return 'Cancelado';
      case 'concluido':
        return 'Concluído';
      default:
        return status;
    }
  };

  if (courtsLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (courtsError || !court) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {courtsError || 'Quadra não encontrada'}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
        >
          Voltar
        </Button>
        <Box flex={1}>
          <Typography variant="h4" component="h1" gutterBottom>
            {court.nome}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detalhes da quadra esportiva
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => router.push(`/desktop/courts/${courtId}/edit`)}
          >
            Editar Quadra
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Informações da Quadra */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Typography variant="h2">
                  {getSportEmoji(court.tipo)}
                </Typography>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {court.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {court.tipo}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon color="action" />
                  <Typography variant="body2">
                    {court.localizacao}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <SportsIcon color="action" />
                  <Typography variant="body2">
                    {court.tipo}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <InfoIcon color="action" />
                  <Typography variant="body2">
                    ID: {court.id}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push(`/desktop/reservations/new?courtId=${courtId}`)}
                fullWidth
              >
                Nova Reserva
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Reservas da Quadra */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                <CalendarIcon color="primary" />
                Reservas Recentes
              </Typography>

              {isLoadingReservations ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : reservations.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Data</TableCell>
                        <TableCell>Horário</TableCell>
                        <TableCell>Usuário</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reservations.slice(0, 10).map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell>
                            {new Date(reservation.dataHoraInicio).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {new Date(reservation.dataHoraInicio).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })} - {new Date(reservation.dataHoraFim).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {reservation.userId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={getStatusLabel(reservation.status)} 
                              color={getStatusColor(reservation.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="small"
                              onClick={() => router.push(`/desktop/reservations/${reservation.id}`)}
                            >
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                  <CalendarIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Nenhuma reserva encontrada
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Esta quadra ainda não possui reservas
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push(`/desktop/reservations/new?courtId=${courtId}`)}
                  >
                    Criar primeira reserva
                  </Button>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};