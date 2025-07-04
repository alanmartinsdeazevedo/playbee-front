'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Chip,
  Button,
  Avatar,
  Tab,
  Tabs,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  CardActions,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Sports as SportsIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useCourts } from '@/hooks/useCourts';
import { useReservations } from '@/hooks/useReservations';
import { AuthService } from '@/lib/auth';
import type { Court } from '@/types/court';

// Interface para exibição com dados extras
interface CourtDisplay extends Court {
  rating?: number;
  available?: boolean;
  image?: string;
  features?: string[];
  description?: string;
}

export const DesktopCourtsView = () => {
  const { courts, isLoading, error, refreshCourts, deleteCourt, clearError } = useCourts();
  const { reservations } = useReservations();
  const [filteredCourts, setFilteredCourts] = useState<CourtDisplay[]>([]);
  const [selectedSport, setSelectedSport] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Verificar se o usuário é admin
  const user = AuthService.getUser();
  const isAdmin = user?.role === 'ADMIN';

  const sports = ['Todos', 'Futebol', 'Basquete', 'Tênis', 'Vôlei'];

  // Funções auxiliares para dados simulados
  const getSportEmoji = (tipo: string): string => {
    const lowerTipo = tipo.toLowerCase();
    if (lowerTipo.includes('futebol') || lowerTipo.includes('futsal')) return '⚽';
    if (lowerTipo.includes('basquete') || lowerTipo.includes('basketball')) return '🏀';
    if (lowerTipo.includes('tênis') || lowerTipo.includes('tennis')) return '🎾';
    if (lowerTipo.includes('vôlei') || lowerTipo.includes('volei') || lowerTipo.includes('volleyball')) return '🏐';
    return '🏟️';
  };

  const generateFeatures = (tipo: string): string[] => {
    const baseFeatures = ['Vestiário', 'Iluminação'];
    const lowerTipo = tipo.toLowerCase();
    
    if (lowerTipo.includes('futebol')) {
      return [...baseFeatures, 'Gramado', 'Estacionamento'];
    }
    if (lowerTipo.includes('basquete')) {
      return [...baseFeatures, 'Cobertura', 'Placar'];
    }
    if (lowerTipo.includes('tênis')) {
      return [...baseFeatures, 'Saibro', 'Rede profissional'];
    }
    if (lowerTipo.includes('vôlei')) {
      return [...baseFeatures, 'Areia', 'Rede profissional'];
    }
    return baseFeatures;
  };

  const generateCourtDescription = (nome: string, tipo: string): string => {
    return `${nome} é uma quadra de ${tipo} com excelente infraestrutura para prática esportiva.`;
  };

  // Função para verificar se uma quadra está disponível agora
  const isCourtAvailable = (courtId: string): boolean => {
    const now = new Date();
    
    // Buscar reservas ativas para esta quadra
    const activeReservations = reservations.filter(reservation => {
      // Filtrar apenas reservas desta quadra
      if (reservation.courtId !== courtId) return false;
      
      // Filtrar apenas reservas não canceladas
      if (reservation.status === 'cancelado' || reservation.status === 'cancelled') return false;
      
      // Verificar se a reserva está acontecendo agora
      const startTime = new Date(reservation.dataHoraInicio);
      const endTime = new Date(reservation.dataHoraFim);
      
      return now >= startTime && now <= endTime;
    });
    
    // Se não há reservas ativas, a quadra está disponível
    return activeReservations.length === 0;
  };

  // Função para gerar hash consistente baseado no ID
  const generateConsistentHash = (id: string): number => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      const char = id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Transformar dados da API para interface de exibição usando useMemo para consistência
  const transformedCourts = useMemo(() => {
    return courts.map(court => {
      const hash = generateConsistentHash(court.id);
      
      return {
        ...court,
        rating: 4.0 + (hash % 10) / 10, // Rating entre 4.0 e 4.9 baseado no hash
        available: isCourtAvailable(court.id), // ✅ REAL: baseado nas reservas do backend
        image: getSportEmoji(court.tipo),
        features: generateFeatures(court.tipo),
        description: generateCourtDescription(court.nome, court.tipo),
      };
    });
  }, [courts, reservations]); // ✅ Recalcula quando courts OU reservations mudarem

  // Filtrar quadras quando mudarem os filtros
  useEffect(() => {
    let filtered = transformedCourts;

    // Filtro por esporte
    if (selectedSport > 0) {
      const sportName = sports[selectedSport];
      filtered = filtered.filter(court => 
        court.tipo.toLowerCase().includes(sportName.toLowerCase())
      );
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(court =>
        court.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCourts(filtered);
  }, [transformedCourts, selectedSport, searchTerm]);

  const handleReserveCourt = (court: CourtDisplay) => {
    if (court.available) {
      router.push(`/desktop/reservations/new?courtId=${court.id}`);
    }
  };

  const handleRefresh = () => {
    clearError();
    refreshCourts();
  };

  const handleDeleteCourt = async (court: CourtDisplay) => {
    if (!confirm(`Tem certeza que deseja excluir a quadra "${court.nome}"?`)) {
      return;
    }

    console.log('🔍 Componente: Iniciando exclusão da quadra:', court);

    try {
      const success = await deleteCourt(court.id);
      
      if (success) {
        console.log('✅ Componente: Quadra excluída com sucesso');
        // Poderemos adicionar uma notificação de sucesso aqui
      } else {
        console.error('❌ Componente: Falha ao excluir quadra (success = false)');
      }
    } catch (err) {
      console.error('❌ Componente: Erro inesperado ao excluir quadra:', err);
    }
  };

  const availableCourts = filteredCourts.filter(c => c.available).length;
  const totalCourts = filteredCourts.length;

  // Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box mb={4}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Skeleton variant="rounded" width={300} height={40} />
            <Skeleton variant="rounded" width={400} height={40} />
          </Stack>
        </Paper>

        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={item}>
              <Card sx={{ height: 400 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <Skeleton variant="circular" width={56} height={56} />
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={60} />
                    <Skeleton variant="text" width="40%" height={32} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
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
            Quadras Esportivas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie e visualize todas as quadras disponíveis
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {availableCourts} de {totalCourts} quadras disponíveis
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
          {isAdmin && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => router.push('/desktop/courts/new')}
            >
              Nova Quadra
            </Button>
          )}
        </Stack>
      </Box>

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
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          {/* Search */}
          <TextField
            placeholder="Buscar por nome, tipo ou localização..."
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

          {/* Sport Filter */}
          <Tabs
            value={selectedSport}
            onChange={(_, newValue) => setSelectedSport(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': { 
                textTransform: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mr: 1,
                minHeight: 36,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderColor: 'primary.main',
                }
              }
            }}
          >
            {sports.map((sport, index) => (
              <Tab key={sport} label={sport} />
            ))}
          </Tabs>

          <IconButton color="primary">
            <FilterIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* Courts Grid */}
      <Grid container spacing={3}>
        {filteredCourts.map((court) => (
          <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={court.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                opacity: court.available ? 1 : 0.7,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent sx={{ flex: 1, p: 3 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" gap={2}>
                    <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        fontSize: '1.8rem',
                        bgcolor: court.available ? 'primary.main' : 'grey.400'
                      }}
                    >
                      {court.image}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {court.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {court.tipo}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip 
                    label={court.available ? 'Disponível' : 'Ocupada'}
                    size="small"
                    color={court.available ? 'success' : 'error'}
                    variant="filled"
                  />
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                  {court.description}
                </Typography>

                {/* Location and Rating */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {court.localizacao}
                    </Typography>
                  </Box>
                  {court.rating && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {court.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Features */}
                <Box mb={3}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Recursos:
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {court.features?.slice(0, 3).map((feature) => (
                      <Chip 
                        key={feature}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    ))}
                    {court.features && court.features.length > 3 && (
                      <Chip 
                        label={`+${court.features.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 24 }}
                      />
                    )}
                  </Stack>
                </Box>

                {/* Availability Status */}
                <Box textAlign="center" mb={2}>
                  <Typography variant="h6" color={court.available ? 'success.main' : 'error.main'} fontWeight="bold">
                    {court.available ? 'Disponível' : 'Indisponível'}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Stack direction="row" spacing={1} width="100%">
                  <Button
                    variant={court.available ? "contained" : "outlined"}
                    disabled={!court.available}
                    onClick={() => handleReserveCourt(court)}
                    fullWidth
                    sx={{ textTransform: 'none' }}
                  >
                    {court.available ? 'Reservar' : 'Indisponível'}
                  </Button>
                  
                  <Tooltip title="Ver detalhes">
                    <IconButton 
                      color="primary"
                      onClick={() => router.push(`/desktop/courts/${court.id}`)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  
                  {isAdmin && (
                    <>
                      <Tooltip title="Editar quadra">
                        <IconButton 
                          color="default"
                          onClick={() => router.push(`/desktop/courts/${court.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Excluir quadra">
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteCourt(court)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredCourts.length === 0 && !isLoading && (
        <Stack spacing={4}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <SportsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma quadra encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {searchTerm || selectedSport > 0 
                ? 'Tente ajustar os filtros ou criar uma nova quadra'
                : 'Comece criando sua primeira quadra'
              }
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => router.push('/desktop/courts/new')}
                sx={{ textTransform: 'none' }}
              >
                Criar Nova Quadra
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ textTransform: 'none' }}
              >
                Tentar Novamente
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Container>
  );
};