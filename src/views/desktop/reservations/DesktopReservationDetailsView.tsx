'use client';

import { useState } from 'react';
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
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';

// Mock data - em produção viria dos hooks
const mockReservation = {
  id: '1',
  dataHoraInicio: '2025-06-15T14:00:00.000Z',
  dataHoraFim: '2025-06-15T16:00:00.000Z',
  status: 'agendado',
  userId: '1',
  courtId: '1',
  createdAt: '2025-06-13T10:00:00.000Z',
  updatedAt: '2025-06-13T10:00:00.000Z',
};

const mockCourt = {
  id: '1',
  nome: 'Quadra Central',
  tipo: 'Futebol',
  localizacao: 'Centro',
};

const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
};

export const DesktopReservationDetailsView = () => {
  const router = useRouter();
  const params = useParams();
  const reservationId = params.id as string;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Em produção, usar hooks reais
  const reservation = mockReservation;
  const court = mockCourt;
  const user = mockUser;
  const error = '';

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
      // TODO: Implementar exclusão usando useReservations
      console.log('Excluindo reserva:', reservationId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular API
      router.push('/desktop/reservations?deleted=true');
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

    try {
      // TODO: Implementar cancelamento usando useReservations
      console.log('Cancelando reserva:', reservationId);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular API
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
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

  const getSportEmoji = (tipo: string): string => {
    const lowerTipo = tipo.toLowerCase();
    if (lowerTipo.includes('futebol') || lowerTipo.includes('futsal')) return '⚽';
    if (lowerTipo.includes('basquete') || lowerTipo.includes('basketball')) return '🏀';
    if (lowerTipo.includes('tênis') || lowerTipo.includes('tennis')) return '🎾';
    if (lowerTipo.includes('vôlei') || lowerTipo.includes('volei') || lowerTipo.includes('volleyball')) return '🏐';
    return '🏟️';
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !reservation) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Reserva não encontrada'}
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
  const canEdit = reservation.status.toLowerCase() === 'agendado' || reservation.status.toLowerCase() === 'confirmado';

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
            disabled={!canEdit}
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
        <Grid size= {{ xs:12, md:8 }}>
          <Stack spacing={3}>
            {/* Status Card */}
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: `${getStatusColor(reservation.status)}.main`,
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {getStatusIcon(reservation.status)}
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Reserva {reservation.status}
                </Typography>
                <Chip 
                  label={reservation.status}
                  color={getStatusColor(reservation.status) as any}
                  size="medium"
                  sx={{ fontSize: '1rem', py: 2 }}
                />
              </CardContent>
            </Card>

            {/* Court Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportsIcon color="primary" />
                  Informações da Quadra
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                    {getSportEmoji(court.tipo)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {court.nome}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <SportsIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {court.tipo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">•</Typography>
                      <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {court.localizacao}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Date & Time Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  Data e Horário
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size= {{ xs:12, sm:6 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <CalendarIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {formatDate(reservation.dataHoraInicio)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data da Reserva
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid size= {{ xs:12, sm:6 }}>
                    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                      <AccessTimeIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {formatTime(reservation.dataHoraInicio)} - {formatTime(reservation.dataHoraFim)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duração: {duration}h
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Informações do Usuário
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mt={2}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid size= {{ xs:12, md:4 }}>
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
                    disabled={!canEdit}
                    fullWidth
                  >
                    Editar Reserva
                  </Button>
                  {canEdit && (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      fullWidth
                    >
                      Cancelar Reserva
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    fullWidth
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir Reserva'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações de Pagamento
                </Typography>
                <Stack spacing={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Valor por hora:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      R$ 80,00
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Duração:
                    </Typography>
                    <Typography variant="body2">
                      {duration}h
                    </Typography>
                  </Box>
                  <Divider />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6" color="primary.main">
                      Total:
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      R$ {(duration * 80).toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Técnicas
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Criada em
                    </Typography>
                    <Typography variant="body2">
                      {new Date(reservation.createdAt).toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Última atualização
                    </Typography>
                    <Typography variant="body2">
                      {new Date(reservation.updatedAt).toLocaleString('pt-BR')}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status atual
                    </Typography>
                    <Typography variant="body2">
                      {reservation.status}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Help */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Precisa de ajuda?</strong> Entre em contato com o suporte se tiver dúvidas sobre sua reserva.
              </Typography>
            </Alert>
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
        <MenuItem onClick={handleEdit} disabled={!canEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar Reserva</ListItemText>
        </MenuItem>
        
        {canEdit && (
          <MenuItem onClick={handleCancel}>
            <ListItemIcon>
              <CancelIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cancelar Reserva</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir Reserva</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};