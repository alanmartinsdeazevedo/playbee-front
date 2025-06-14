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
  Paper,
  Stack,
  Alert,
  CircularProgress,
  Skeleton,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useUsers } from '@/hooks/useUsers';
import type { User } from '@/types/auth';

export const DesktopUserDetailsView = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  
  const { user, isLoading, error, refreshUser } = useUser(userId);
  const { deleteUser } = useUsers();
  
  const [isDeleting, setIsDeleting] = useState(false);

  // Mock statistics - em uma implementação real, viriam da API
  const userStats = {
    totalReservations: 24,
    totalHoursPlayed: 36,
    favoritesSport: 'Futebol',
    totalSpent: 1920,
    memberSince: user?.createdAt || new Date().toISOString(),
    averageRating: 4.7,
    completedReservations: 22,
    cancelledReservations: 2,
  };

  // Mock recent reservations
  const recentReservations = [
    {
      id: 1,
      courtName: 'Quadra Central',
      sport: 'Futebol',
      date: '2025-06-15',
      time: '14:00',
      duration: 2,
      status: 'upcoming',
      icon: '⚽'
    },
    {
      id: 2,
      courtName: 'Arena Basketball',
      sport: 'Basquete',
      date: '2025-06-10',
      time: '16:30',
      duration: 1.5,
      status: 'completed',
      icon: '🏀'
    },
    {
      id: 3,
      courtName: 'Court Tennis Pro',
      sport: 'Tênis',
      date: '2025-06-08',
      time: '10:00',
      duration: 1,
      status: 'completed',
      icon: '🎾'
    },
  ];

  const handleRefresh = () => {
    refreshUser();
  };

  const handleEdit = () => {
    router.push(`/desktop/users/${userId}/edit`);
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.nome}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteUser(userId);
      if (success) {
        router.push('/desktop/users?deleted=true');
      }
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const formatMemberSince = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getRoleColor = (role: string) => {
    return role.toUpperCase() === 'ADMIN' ? 'error' : 'primary';
  };

  const getRoleText = (role: string) => {
    return role.toUpperCase() === 'ADMIN' ? 'Administrador' : 'Usuário';
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

  // Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="text" width={300} height={40} />
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs:12, md:4 }}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
                <Skeleton variant="text" width={200} height={32} sx={{ mx: 'auto' }} />
                <Skeleton variant="text" width={150} height={24} sx={{ mx: 'auto' }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs:12, md:8 }}>
            <Stack spacing={3}>
              {[1, 2, 3].map((item) => (
                <Card key={item}>
                  <CardContent>
                    <Skeleton variant="text" width={200} height={28} />
                    <Skeleton variant="rectangular" width="100%" height={100} sx={{ mt: 2 }} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outlined"
          >
            Voltar
          </Button>
        </Box>
        
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // No user found
  if (!user) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            variant="outlined"
          >
            Voltar
          </Button>
        </Box>
        
        <Alert severity="warning">
          Usuário não encontrado
        </Alert>
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
              Detalhes do Usuário
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Visualize informações completas e estatísticas
            </Typography>
          </Box>
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
            variant="outlined" 
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Editar
          </Button>
          <Button 
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* User Profile Card */}
        <Grid size={{ xs:12, md:4 }}>
          <Card sx={{ height: 'fit-content' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                  mx: 'auto',
                  mb: 3
                }}
              >
                {user.nome.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {user.nome}
              </Typography>
              
              <Chip 
                label={getRoleText(user.role)}
                color={getRoleColor(user.role) as any}
                icon={user.role.toUpperCase() === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Contact Info */}
              <Stack spacing={2} alignItems="flex-start">
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <EmailIcon color="action" />
                  <Box textAlign="left">
                    <Typography variant="caption" color="text.secondary" display="block">
                      E-mail
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <PhoneIcon color="action" />
                  <Box textAlign="left">
                    <Typography variant="caption" color="text.secondary" display="block">
                      Telefone
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {user.telefone || 'Não informado'}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <CalendarIcon color="action" />
                  <Box textAlign="left">
                    <Typography variant="caption" color="text.secondary" display="block">
                      Membro desde
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatMemberSince(userStats.memberSince)}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <StarIcon color="action" />
                  <Box textAlign="left">
                    <Typography variant="caption" color="text.secondary" display="block">
                      Avaliação Média
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {userStats.averageRating}/5.0 ⭐
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics and Details */}
        <Grid size={{ xs:12, md:8 }}>
          <Stack spacing={4}>
            {/* Statistics Cards */}
            <Grid container spacing={3}>
              <Grid size={{ xs:12, sm:6, md:3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                      <ScheduleIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {userStats.totalReservations}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de Reservas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs:12, sm:6, md:3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                      <AccessTimeIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {userStats.totalHoursPlayed}h
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Horas Jogadas
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs:12, sm:6, md:3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                      <SportsIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      {userStats.favoritesSport}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esporte Favorito
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs:12, sm:6, md:3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                      R$ {userStats.totalSpent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Gasto
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Activity Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Resumo de Atividades
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size={{ xs:12, sm:4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main" fontWeight="bold">
                        {userStats.completedReservations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reservas Concluídas
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs:12, sm:4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {userStats.totalReservations - userStats.completedReservations - userStats.cancelledReservations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reservas Agendadas
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs:12, sm:4 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main" fontWeight="bold">
                        {userStats.cancelledReservations}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Reservas Canceladas
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Recent Reservations */}
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Reservas Recentes
                  </Typography>
                  <Button 
                    variant="text" 
                    size="small"
                    onClick={() => router.push('/desktop/reservations')}
                  >
                    Ver Todas
                  </Button>
                </Box>
                
                <List sx={{ p: 0 }}>
                  {recentReservations.map((reservation, index) => (
                    <Box key={reservation.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar 
                            sx={{ 
                              bgcolor: `${getStatusColor(reservation.status)}.main`,
                              width: 40,
                              height: 40,
                              fontSize: '1.2rem'
                            }}
                          >
                            {reservation.icon}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight="medium">
                                {reservation.courtName}
                              </Typography>
                              <Chip 
                                label={reservation.status === 'upcoming' ? 'Agendado' : 
                                       reservation.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                size="small"
                                color={getStatusColor(reservation.status) as any}
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {new Date(reservation.date).toLocaleDateString('pt-BR')} às {reservation.time} • {reservation.duration}h de {reservation.sport}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentReservations.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>

                {recentReservations.length === 0 && (
                  <Box textAlign="center" py={4}>
                    <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Nenhuma reserva encontrada
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Informações da Conta
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size={{ xs:12, sm:6 }}>
                    <Typography variant="caption" color="text.secondary">
                      ID do Usuário
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.id}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs:12, sm:6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Data de Criação
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.createdAt ? formatDate(user.createdAt) : 'Não informado'}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs:12, sm:6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Última Atualização
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {user.updatedAt ? formatDate(user.updatedAt) : 'Não informado'}
                    </Typography>
                  </Grid>
                  
                  <Grid size={{ xs:12, sm:6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Status da Conta
                    </Typography>
                    <Chip 
                      label="Ativa"
                      size="small"
                      color="success"
                      variant="filled"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};