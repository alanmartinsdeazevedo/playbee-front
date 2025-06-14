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
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: number;
  courtName: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  icon: string;
  userName: string;
  userEmail: string;
  courtLocation: string;
}

export const DesktopReservationsView = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const reservations: Reservation[] = [
    {
      id: 1,
      courtName: 'Quadra Central',
      sport: 'Futebol',
      date: '2025-06-15',
      time: '14:00',
      duration: 2,
      status: 'upcoming',
      icon: '⚽',
      userName: 'João Silva',
      userEmail: 'joao@email.com',
      courtLocation: 'Centro'
    },
    {
      id: 2,
      courtName: 'Arena Basketball',
      sport: 'Basquete',
      date: '2025-06-16',
      time: '16:30',
      duration: 1.5,
      status: 'upcoming',
      icon: '🏀',
      userName: 'Maria Santos',
      userEmail: 'maria@email.com',
      courtLocation: 'Zona Norte'
    },
    {
      id: 3,
      courtName: 'Court Tennis Pro',
      sport: 'Tênis',
      date: '2025-06-10',
      time: '10:00',
      duration: 1,
      status: 'completed',
      icon: '🎾',
      userName: 'Pedro Costa',
      userEmail: 'pedro@email.com',
      courtLocation: 'Zona Sul'
    },
    {
      id: 4,
      courtName: 'Vôlei Beach',
      sport: 'Vôlei',
      date: '2025-06-12',
      time: '18:00',
      duration: 1,
      status: 'cancelled',
      icon: '🏐',
      userName: 'Ana Lima',
      userEmail: 'ana@email.com',
      courtLocation: 'Praia'
    },
    {
      id: 5,
      courtName: 'Futsal Indoor',
      sport: 'Futebol',
      date: '2025-06-17',
      time: '20:00',
      duration: 2,
      status: 'upcoming',
      icon: '⚽',
      userName: 'Carlos Mendes',
      userEmail: 'carlos@email.com',
      courtLocation: 'Centro'
    },
  ];

  const tabs = ['Todas', 'Próximas', 'Concluídas', 'Canceladas'];

  const getFilteredReservations = () => {
    let filtered = reservations;
    
    // Filter by tab
    switch (selectedTab) {
      case 1:
        filtered = reservations.filter(r => r.status === 'upcoming');
        break;
      case 2:
        filtered = reservations.filter(r => r.status === 'completed');
        break;
      case 3:
        filtered = reservations.filter(r => r.status === 'cancelled');
        break;
      default:
        filtered = reservations;
    }

    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.sport.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
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
        year: 'numeric',
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

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, reservation: Reservation) => {
    setAnchorEl(event.currentTarget);
    setSelectedReservation(reservation);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReservation(null);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const filteredReservations = getFilteredReservations();
  const upcomingCount = reservations.filter(r => r.status === 'upcoming').length;
  const completedCount = reservations.filter(r => r.status === 'completed').length;
  const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

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

      {/* Filters */}
      <Paper elevation={1} sx={{ mb: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
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
            sx={{ minWidth: 250 }}
            size="small"
          />
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
                        <Typography variant="caption" color="text.secondary">
                          {reservation.sport} • {reservation.courtLocation}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {reservation.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reservation.userEmail}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(reservation.date)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {reservation.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {reservation.duration}h
                    </Typography>
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
                      
                      {reservation.status === 'upcoming' && (
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
              : 'Tente ajustar os filtros ou criar uma nova reserva'
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
        
        {selectedReservation?.status === 'upcoming' && (
          <>
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
            
            <MenuItem onClick={() => {
              // TODO: Implementar cancelamento
              handleMenuClose();
            }}>
              <ListItemIcon>
                <CancelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Cancelar Reserva</ListItemText>
            </MenuItem>
          </>
        )}
        
        <MenuItem 
          onClick={() => {
            // TODO: Implementar exclusão
            handleMenuClose();
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