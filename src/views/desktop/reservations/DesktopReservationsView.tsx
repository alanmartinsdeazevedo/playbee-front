'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Tabs,
  Tab,
  Avatar,
  Chip,
  IconButton,
  Button,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useReservations } from '@/hooks/useReservations';
import { useCourts } from '@/hooks/useCourts';
import { useUsers } from '@/hooks/useUsers';
import { ReservationsService } from '@/services/reservations.service';
import type { Schedule } from '@/types/reservation';

// Interface expandida para exibição
interface ReservationDisplay extends Schedule {
  courtName?: string;
  courtLocation?: string;
  sport?: string;
  userName?: string;
  userEmail?: string;
  duration?: number;
  icon?: string;
}

export const DesktopReservationsView = () => {
  const { reservations, isLoading, error, refreshReservations, deleteReservation, clearError } = useReservations();
  const { courts } = useCourts();
  const { users } = useUsers();
  
  const [filteredReservations, setFilteredReservations] = useState<ReservationDisplay[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDisplay | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = ['Todas', 'Próximas', 'Concluídas', 'Canceladas'];

  // Transformar dados das reservas para incluir informações adicionais
  const transformReservations = (apiReservations: Schedule[]): ReservationDisplay[] => {
    return apiReservations.map(reservation => {
      const court = courts.find(c => c.id === reservation.courtId);
      const user = users.find(u => u.id === reservation.userId);
      
      const duration = ReservationsService.calculateDuration(
        new Date(reservation.dataHoraInicio),
        new Date(reservation.dataHoraFim)
      );

      const getSportEmoji = (tipo?: string): string => {
        if (!tipo) return '🏟️';
        const lowerTipo = tipo.toLowerCase();
        if (lowerTipo.includes('futebol') || lowerTipo.includes('futsal')) return '⚽';
        if (lowerTipo.includes('basquete') || lowerTipo.includes('basketball')) return '🏀';
        if (lowerTipo.includes('tênis') || lowerTipo.includes('tennis')) return '🎾';
        if (lowerTipo.includes('vôlei') || lowerTipo.includes('volei') || lowerTipo.includes('volleyball')) return '🏐';
        return '🏟️';
      };

      return {
        ...reservation,
        courtName: court?.nome || 'Quadra não encontrada',
        courtLocation: court?.localizacao || 'Localização não informada',
        sport: court?.tipo || 'Esporte não informado',
        userName: user?.nome || 'Usuário não encontrado',
        userEmail: user?.email || 'Email não informado',
        duration,
        icon: getSportEmoji(court?.tipo),
      };
    });
  };

  // Filtrar reservas quando mudarem os filtros
  useEffect(() => {
    let filtered = transformReservations(reservations);

    // Filtro por aba
    switch (selectedTab) {
      case 1: // Próximas
        filtered = filtered.filter(r => {
          const now = new Date();
          const startTime = new Date(r.dataHoraInicio);
          return startTime >= now && r.status !== 'cancelado' && r.status !== 'cancelled';
        });
        break;
      case 2: // Concluídas
        filtered = filtered.filter(r => {
          const now = new Date();
          const endTime = new Date(r.dataHoraFim);
          return endTime < now || r.status === 'concluido' || r.status === 'completed';
        });
        break;
      case 3: // Canceladas
        filtered = filtered.filter(r => r.status === 'cancelado' || r.status === 'cancelled');
        break;
      default: // Todas
        break;
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.courtName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por quadra
    if (selectedCourt) {
      filtered = filtered.filter(r => r.courtId === selectedCourt);
    }

    // Filtro por usuário
    if (selectedUser) {
      filtered = filtered.filter(r => r.userId === selectedUser);
    }

    // Ordenar por data (mais recentes primeiro)
    filtered.sort((a, b) => new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime());

    setFilteredReservations(filtered);
  }, [reservations, courts, users, selectedTab, searchTerm, selectedCourt, selectedUser]);

  // Mostrar mensagem de sucesso se veio de criação/edição
  useEffect(() => {
    const created = searchParams.get('created');
    const updated = searchParams.get('updated');
    const deleted = searchParams.get('deleted');
    
    if (created || updated || deleted) {
      // Aqui você poderia mostrar uma notificação de sucesso
      console.log('Ação realizada:', { created, updated, deleted });
    }
  }, [searchParams]);

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
        year: 'numeric',
        weekday: 'short'
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('cancelado') || lowerStatus.includes('cancelled')) return 'error';
    if (lowerStatus.includes('concluido') || lowerStatus.includes('completed')) return 'success';
    return 'primary';
  };

  const getStatusText = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('cancelado') || lowerStatus.includes('cancelled')) return 'Cancelado';
    if (lowerStatus.includes('concluido') || lowerStatus.includes('completed')) return 'Concluído';
    if (lowerStatus.includes('confirmado') || lowerStatus.includes('confirmed')) return 'Confirmado';
    return 'Agendado';
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, reservation: ReservationDisplay) => {
    setAnchorEl(event.currentTarget);
    setSelectedReservation(reservation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReservation(null);
  };

  const handleRefresh = () => {
    clearError();
    refreshReservations();
  };

  const handleDeleteReservation = async (reservation: ReservationDisplay) => {
    if (!confirm(`Tem certeza que deseja excluir a reserva da quadra "${reservation.courtName}"?`)) {
      return;
    }

    try {
      const success = await deleteReservation(reservation.id);
      
      if (success) {
        console.log('✅ Reserva excluída com sucesso');
      }
    } catch (err) {
      console.error('❌ Erro ao excluir reserva:', err);
    }
    
    handleMenuClose();
  };

  const upcomingCount = filteredReservations.filter(r => {
    const now = new Date();
    const startTime = new Date(r.dataHoraInicio);
    return startTime >= now && !['cancelado', 'cancelled'].includes(r.status);
  }).length;

  const completedCount = filteredReservations.filter(r => {
    const now = new Date();
    const endTime = new Date(r.dataHoraFim);
    return endTime < now || ['concluido', 'completed'].includes(r.status);
  }).length;

  const cancelledCount = filteredReservations.filter(r => 
    ['cancelado', 'cancelled'].includes(r.status)
  ).length;

  // Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box mb={4}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        
        <Stack direction="row" spacing={3} mb={4}>
          {[1, 2, 3].map((item) => (
            <Card key={item} sx={{ flex: 1 }}>
              <CardContent>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={80} height={32} sx={{ mt: 1 }} />
                <Skeleton variant="text" width={120} height={20} />
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Stack direction="row" spacing={3}>
            <Skeleton variant="rectangular" width={200} height={40} />
            <Skeleton variant="rectangular" width={300} height={40} />
          </Stack>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {['Quadra', 'Usuário', 'Data & Hora', 'Duração', 'Status', 'Ações'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((item) => (
                <TableRow key={item}>
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton variant="text" width={120} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

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
            Reservas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie todas as reservas do sistema
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {upcomingCount} próximas • {completedCount} concluídas • {cancelledCount} canceladas
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
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/desktop/reservations/new')}
          >
            Nova Reserva
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <ScheduleIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {upcomingCount}
              </Typography>
              <Typography color="text.secondary">
                Próximas Reservas
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {completedCount}
              </Typography>
              <Typography color="text.secondary">
                Concluídas
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <CancelIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {cancelledCount}
              </Typography>
              <Typography color="text.secondary">
                Canceladas
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
        <Box p={2}>
          {/* Tabs */}
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Tabs
              value={selectedTab}
              onChange={(_, newValue) => setSelectedTab(newValue)}
              sx={{
                '& .MuiTab-root': { textTransform: 'none' }
              }}
            >
              {tabs.map((tab, index) => (
                <Tab key={tab} label={tab} />
              ))}
            </Tabs>
          </Box>

          {/* Search and Filters */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Buscar reservas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
              size="small"
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Quadra</InputLabel>
              <Select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                label="Filtrar por Quadra"
              >
                <MenuItem value="">Todas as Quadras</MenuItem>
                {courts.map((court) => (
                  <MenuItem key={court.id} value={court.id}>
                    {court.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Usuário</InputLabel>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                label="Filtrar por Usuário"
              >
                <MenuItem value="">Todos os Usuários</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Paper>

      {/* Reservations Table */}
      {filteredReservations.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quadra</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>Data & Hora</TableCell>
                <TableCell>Duração</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow 
                  key={reservation.id}
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 40, height: 40, fontSize: '1.2rem' }}>
                        {reservation.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {reservation.courtName}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <SportsIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {reservation.sport}
                          </Typography>
                          <LocationIcon sx={{ fontSize: 14, color: 'text.secondary', ml: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {reservation.courtLocation}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {reservation.userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {reservation.userEmail}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(reservation.dataHoraInicio)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(reservation.dataHoraInicio)} às {formatTime(reservation.dataHoraFim)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {reservation.duration?.toFixed(1)}h
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={getStatusText(reservation.status)}
                      size="small"
                      color={getStatusColor(reservation.status) as any}
                      variant="filled"
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Ver detalhes">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => router.push(`/desktop/reservations/${reservation.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {!['cancelado', 'cancelled', 'concluido', 'completed'].includes(reservation.status) && (
                        <Tooltip title="Editar">
                          <IconButton 
                            size="small" 
                            color="default"
                            onClick={() => router.push(`/desktop/reservations/${reservation.id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <Tooltip title="Mais opções">
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuClick(e, reservation)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma reserva encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {selectedTab === 1 
              ? 'Não há reservas agendadas'
              : selectedTab === 2 
              ? 'Nenhuma reserva foi concluída ainda'
              : selectedTab === 3
              ? 'Nenhuma reserva foi cancelada'
              : searchTerm || selectedCourt || selectedUser
              ? 'Tente ajustar os filtros ou criar uma nova reserva'
              : 'Comece criando a primeira reserva'
            }
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/desktop/reservations/new')}
            sx={{ textTransform: 'none' }}
          >
            Criar Nova Reserva
          </Button>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => {
          if (selectedReservation) {
            router.push(`/desktop/reservations/${selectedReservation.id}`);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Detalhes</ListItemText>
        </MenuItem>
        
        {selectedReservation && !['cancelado', 'cancelled', 'concluido', 'completed'].includes(selectedReservation.status) && (
          <MenuItem onClick={() => {
            if (selectedReservation) {
              router.push(`/desktop/reservations/${selectedReservation.id}/edit`);
            }
            handleMenuClose();
          }}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar Reserva</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={() => {
            if (selectedReservation) {
              handleDeleteReservation(selectedReservation);
            }
          }}
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