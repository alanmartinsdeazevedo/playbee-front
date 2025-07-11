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
  Avatar,
  Chip,
  Stack,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useReservation, useReservations } from '@/hooks/useReservations';
import { useCourts } from '@/hooks/useCourts';
import { useUsers } from '@/hooks/useUsers';
import { AuthService } from '@/lib/auth';
import { ReservationsService } from '@/services/reservations.service';
import type { User } from '@/types/auth';

export const DesktopReservationDetailsView = () => {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  // Hooks para buscar dados reais
  const { reservation, isLoading: isLoadingReservation, error: loadError, refreshReservation } = useReservation(reservationId);
  const { deleteReservation, updateReservation, cancelReservation } = useReservations();
  const { courts } = useCourts();
  const { users } = useUsers();

  // Estados locais
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Buscar informações da quadra e usuário baseado na reserva
  const court = reservation ? courts.find(c => c.id === reservation.courtId) : null;
  const user = reservation ? users.find(u => u.id === reservation.userId) : null;

  // Verificar permissões
  useEffect(() => {
    const authUser = AuthService.getUser();
    setCurrentUser(authUser);
  }, []);

  const canEdit = () => {
    if (!reservation || !currentUser) return false;
    
    // Verificar se pode editar baseado na regra de negócio (não iniciou)
    const canEditByTime = ReservationsService.canEditReservation(reservation);
    if (!canEditByTime) return false;
    
    // Admin pode editar qualquer reserva (que não iniciou)
    if (currentUser.role === 'ADMIN') return true;
    
    // Usuário pode editar apenas suas próprias reservas (que não iniciaram)
    return reservation.userId === currentUser.id;
  };

  const canDelete = () => {
    if (!reservation || !currentUser) return false;
    
    // Apenas admins podem excluir reservas
    return currentUser.role === 'ADMIN';
  };

  const canCancel = () => {
    if (!reservation || !currentUser) return false;
    
    // Verificar se pode cancelar baseado na regra de negócio (não iniciou e não cancelado)
    const canCancelByRule = ReservationsService.canCancelReservation(reservation);
    if (!canCancelByRule) return false;
    
    // Só pode cancelar se for dono da reserva ou admin
    const isOwnerOrAdmin = currentUser.role === 'ADMIN' || reservation.userId === currentUser.id;
    return isOwnerOrAdmin;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    router.push(`/desktop/reservations/${reservationId}/edit`);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteReservation(reservationId);
      if (success) {
        router.push('/desktop/reservations?deleted=true');
      }
    } catch (err) {
      console.error('Erro ao excluir reserva:', err);
    } finally {
      setIsDeleting(false);
    }
    handleMenuClose();
  };

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    setIsCancelling(true);
    try {
      const cancelledReservation = await cancelReservation(reservationId);
      if (cancelledReservation) {
        refreshReservation(); // Atualizar dados na tela
      }
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
    } finally {
      setIsCancelling(false);
    }
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = () => {
    if (!reservation) return 0;
    const start = new Date(reservation.dataHoraInicio);
    const end = new Date(reservation.dataHoraFim);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
      case 'agendado':
        return 'primary';
      case 'concluido':
        return 'success';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
      case 'agendado':
        return <ScheduleIcon />;
      case 'concluido':
        return <CheckCircleIcon />;
      case 'cancelado':
        return <CancelIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'agendado':
        return 'Agendado';
      case 'confirmado':
        return 'Confirmado';
      case 'concluido':
        return 'Concluído';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
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

  if (isLoadingReservation) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (loadError || !reservation) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {loadError || 'Reserva não encontrada'}
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

  const duration = calculateDuration();

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outlined"
          >
            Voltar
          </Button>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Detalhes da Reserva
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ID: {reservation.id}
            </Typography>
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={!canEdit()}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            endIcon={<MoreVertIcon />}
            onClick={handleMenuOpen}
          >
            Ações
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* Main Details */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* Reservation Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  Informações da Reserva
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Data da Reserva
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatDate(reservation.dataHoraInicio)}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Horário
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatTime(reservation.dataHoraInicio)} às {formatTime(reservation.dataHoraFim)}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Duração
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {duration} {duration === 1 ? 'hora' : 'horas'}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Box mt={1}>
                      <Chip 
                        icon={getStatusIcon(reservation.status)}
                        label={getStatusText(reservation.status)}
                        color={getStatusColor(reservation.status) as any}
                        variant="filled"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Court Info */}
            {court && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsIcon color="primary" />
                    Informações da Quadra
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Typography variant="h4">
                      {getSportEmoji(court.tipo)}
                    </Typography>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {court.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {court.tipo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon fontSize="small" />
                        {court.localizacao}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* User Info */}
            {user && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Informações do Usuário
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {user.nome.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {user.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ações Rápidas
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    disabled={!canEdit()}
                    fullWidth
                  >
                    Editar Reserva
                  </Button>
                  {canCancel() && (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={isCancelling}
                      fullWidth
                    >
                      {isCancelling ? 'Cancelando...' : 'Cancelar Reserva'}
                    </Button>
                  )}
                  {canDelete() && (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleDelete}
                      disabled={isDeleting}
                      fullWidth
                    >
                      {isDeleting ? 'Excluindo...' : 'Excluir'}
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Reservation Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Linha do Tempo
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Criada em
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatDate(reservation.createdAt || reservation.dataHoraInicio)}
                    </Typography>
                  </Box>
                  {reservation.updatedAt && reservation.updatedAt !== reservation.createdAt && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Última atualização
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(reservation.updatedAt)}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={handleEdit} disabled={!canEdit()}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar Reserva</ListItemText>
        </MenuItem>
        
        {canCancel() && (
          <MenuItem onClick={handleCancel} disabled={isCancelling}>
            <ListItemIcon>
              <CancelIcon fontSize="small" color="warning" />
            </ListItemIcon>
            <ListItemText>Cancelar Reserva</ListItemText>
          </MenuItem>
        )}
        
        {canDelete() && (
          <MenuItem onClick={handleDelete} disabled={isDeleting} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Excluir Reserva</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Container>
  );
};