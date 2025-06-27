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
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCourts } from '@/hooks/useCourts';
import { useUsers } from '@/hooks/useUsers';
import { ReservationsService } from '@/services/reservations.service';
import { AuthService } from '@/lib/auth';
import type { Schedule } from '@/types/reservation';
import type { User } from '@/types/auth';

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
  const { courts } = useCourts();
  const { users } = useUsers();
  
  const [reservations, setReservations] = useState<Schedule[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ReservationDisplay[]>([]);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = Próximas por padrão
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const isAdmin = currentUser?.role === 'ADMIN';
  
  // Atualizar as abas para começar com "Próximas" por padrão
  const tabs = isAdmin 
    ? ['Próximas', 'Concluídas', 'Canceladas', 'Todas', 'Histórico']
    : ['Próximas', 'Concluídas', 'Canceladas', 'Histórico'];

  useEffect(() => {
    const user = AuthService.getUser();
    if (!user) {
      router.push('/desktop/login');
      return;
    }
    setCurrentUser(user);
    loadReservations();
  }, [router]);

  const loadReservations = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const data = await ReservationsService.getAll();
      
      let userReservations = data;
      if (!isAdmin && currentUser) {
        userReservations = data.filter(r => r.userId === currentUser.id);
      }
      
      setReservations(userReservations);
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
      setError('Erro ao carregar reservas');
    } finally {
      setIsLoading(false);
    }
  };

  const transformReservations = (reservations: Schedule[]): ReservationDisplay[] => {
    return reservations.map(reservation => {
      const court = courts.find(c => c.id === reservation.courtId);
      const user = users.find(u => u.id === reservation.userId);
      
      const start = new Date(reservation.dataHoraInicio);
      const end = new Date(reservation.dataHoraFim);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

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

  useEffect(() => {
    let filtered = transformReservations(reservations);

    // Filtro por aba - CORRIGIDO para começar com próximas
    switch (selectedTab) {
      case 0: // Próximas (agora é a primeira aba)
        filtered = filtered.filter(r => {
          const now = new Date();
          const startTime = new Date(r.dataHoraInicio);
          return startTime >= now && !['cancelado', 'cancelled'].includes(r.status.toLowerCase());
        });
        break;
      case 1: // Concluídas
        filtered = filtered.filter(r => {
          const now = new Date();
          const endTime = new Date(r.dataHoraFim);
          return endTime < now || ['concluido', 'completed'].includes(r.status.toLowerCase());
        });
        break;
      case 2: // Canceladas
        filtered = filtered.filter(r => ['cancelado', 'cancelled'].includes(r.status.toLowerCase()));
        break;
      case 3: // Todas (apenas para admin)
        // Admin pode ver todas, usuário comum não tem essa aba
        break;
      case 4: // Histórico (todas as passadas - última aba)
        filtered = filtered.filter(r => {
          const now = new Date();
          const endTime = new Date(r.dataHoraFim);
          return endTime < now;
        });
        break;
      default:
        // Fallback para próximas
        filtered = filtered.filter(r => {
          const now = new Date();
          const startTime = new Date(r.dataHoraInicio);
          return startTime >= now && !['cancelado', 'cancelled'].includes(r.status.toLowerCase());
        });
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

    // Filtro por usuário (só para admin)
    if (selectedUser && isAdmin) {
      filtered = filtered.filter(r => r.userId === selectedUser);
    }

    // Ordenar por data
    if (selectedTab === 0) {
      // Próximas: ordenar por data crescente (próximas primeiro)
      filtered.sort((a, b) => new Date(a.dataHoraInicio).getTime() - new Date(b.dataHoraInicio).getTime());
    } else {
      // Outras abas: ordenar por data decrescente (mais recentes primeiro)
      filtered.sort((a, b) => new Date(b.dataHoraInicio).getTime() - new Date(a.dataHoraInicio).getTime());
    }

    setFilteredReservations(filtered);
  }, [reservations, courts, users, selectedTab, searchTerm, selectedCourt, selectedUser, isAdmin]);

  useEffect(() => {
    const created = searchParams.get('created');
    const updated = searchParams.get('updated');
    const deleted = searchParams.get('deleted');
    
    if (created || updated || deleted) {
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
    setError('');
    loadReservations();
  };

  const handleDeleteReservation = async (reservation: ReservationDisplay) => {
    if (!confirm(`Tem certeza que deseja excluir a reserva da quadra "${reservation.courtName}"?`)) {
      return;
    }

    try {
      await ReservationsService.delete(reservation.id);
      console.log('✅ Reserva excluída com sucesso');
      await loadReservations();
    } catch (err) {
      console.error('❌ Erro ao excluir reserva:', err);
      setError('Erro ao excluir reserva');
    }
    
    handleMenuClose();
  };

  const upcomingCount = reservations.filter(r => {
    const now = new Date();
    const startTime = new Date(r.dataHoraInicio);
    return startTime >= now && !['cancelado', 'cancelled'].includes(r.status.toLowerCase());
  }).length;

  const completedCount = reservations.filter(r => {
    const now = new Date();
    const endTime = new Date(r.dataHoraFim);
    return endTime < now || ['concluido', 'completed'].includes(r.status.toLowerCase());
  }).length;

  const cancelledCount = reservations.filter(r => 
    ['cancelado', 'cancelled'].includes(r.status.toLowerCase())
  ).length;

  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box mb={4}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} height={24} />
        </Box>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {isAdmin ? 'Todas as Reservas' : 'Minhas Reservas'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin 
            ? 'Gerencie todas as reservas do sistema'
            : 'Visualize e gerencie suas reservas'
          }
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Tentar Novamente
          </Button>
        }>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Tabs 
            value={selectedTab} 
            onChange={(_, newValue) => setSelectedTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={tab}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>{tab}</Typography>
                    {index === 0 && upcomingCount > 0 && (
                      <Chip label={upcomingCount} size="small" color="primary" />
                    )}
                    {index === 1 && completedCount > 0 && (
                      <Chip label={completedCount} size="small" color="success" />
                    )}
                    {index === 2 && cancelledCount > 0 && (
                      <Chip label={cancelledCount} size="small" color="error" />
                    )}
                  </Stack>
                }
                sx={{ textTransform: 'none' }}
              />
            ))}
          </Tabs>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
            <TextField
              placeholder="Buscar por quadra, usuário, esporte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
            />
            
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Quadra</InputLabel>
              <Select
                value={selectedCourt}
                label="Quadra"
                onChange={(e) => setSelectedCourt(e.target.value)}
              >
                <MenuItem value="">
                  <em>Todas as quadras</em>
                </MenuItem>
                {courts.map((court) => (
                  <MenuItem key={court.id} value={court.id}>
                    {court.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {isAdmin && (
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Usuário</InputLabel>
                <Select
                  value={selectedUser}
                  label="Usuário"
                  onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Todos os usuários</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ textTransform: 'none' }}
            >
              Atualizar
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/desktop/reservations/new')}
              sx={{ textTransform: 'none' }}
            >
              Nova Reserva
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {filteredReservations.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Quadra</TableCell>
                <TableCell>Data e Horário</TableCell>
                <TableCell>Duração</TableCell>
                {isAdmin && <TableCell>Usuário</TableCell>}
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {reservation.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {reservation.courtName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                          {reservation.courtLocation}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {formatDate(reservation.dataHoraInicio)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(reservation.dataHoraInicio)} - {formatTime(reservation.dataHoraFim)}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={`${reservation.duration}h`}
                      size="small"
                      icon={<AccessTimeIcon />}
                      variant="outlined"
                    />
                  </TableCell>
                  
                  {isAdmin && (
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {reservation.userName?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2">
                          {reservation.userName}
                        </Typography>
                      </Stack>
                    </TableCell>
                  )}
                  
                  <TableCell>
                    <Chip 
                      label={getStatusText(reservation.status)}
                      color={getStatusColor(reservation.status) as any}
                      size="small"
                    />
                  </TableCell>
                  
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Ver detalhes">
                        <IconButton 
                          size="small" 
                          onClick={() => router.push(`/desktop/reservations/${reservation.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {(isAdmin || reservation.userId === currentUser?.id) &&
                       !['cancelado', 'cancelled', 'concluido', 'completed'].includes(reservation.status) && (
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
            {selectedTab === 0 
              ? 'Não há reservas futuras agendadas'
              : selectedTab === 1 
              ? 'Nenhuma reserva foi concluída ainda'
              : selectedTab === 2
              ? 'Nenhuma reserva foi cancelada'
              : searchTerm || selectedCourt || selectedUser
              ? 'Tente ajustar os filtros ou criar uma nova reserva'
              : isAdmin 
              ? 'Nenhuma reserva encontrada no sistema'
              : 'Você ainda não tem reservas. Comece criando a primeira!'
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
        
        {selectedReservation && 
         (isAdmin || selectedReservation.userId === currentUser?.id) &&
         !['cancelado', 'cancelled', 'concluido', 'completed'].includes(selectedReservation.status) && (
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
        
        {selectedReservation && (isAdmin || selectedReservation.userId === currentUser?.id) && (
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
        )}
      </Menu>
    </Container>
  );
};