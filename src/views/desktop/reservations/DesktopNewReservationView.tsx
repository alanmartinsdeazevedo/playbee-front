// src\app\desktop\reservations\[id]\edit\page.tsx
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
  TextField,
  MenuItem,
  Paper,
  Stack,
  Avatar,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useCourts } from '@/hooks/useCourts';
import { useUsers } from '@/hooks/useUsers';
import { useReservations, useReservation } from '@/hooks/useReservations';
import type { CreateScheduleRequest, UpdateScheduleRequest } from '@/types/reservation';

interface ReservationForm {
  courtId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  notes: string;
}

interface Props {
  mode?: 'create' | 'edit';
}

export const DesktopNewReservationView = ({ mode = 'create' }: Props = {}) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const preSelectedCourtId = searchParams.get('courtId');
  const reservationId = mode === 'edit' ? (params.id as string) : null;

  const { courts } = useCourts();
  const { users } = useUsers();
  const { createReservation, updateReservation, error: crudError, clearError } = useReservations();
  const { reservation, isLoading: isLoadingReservation, error: loadError } = useReservation(reservationId || '');

  const [form, setForm] = useState<ReservationForm>({
    courtId: preSelectedCourtId || '',
    userId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 0,
    status: 'agendado',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<ReservationForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const isEditMode = mode === 'edit';
  const isLoading = isEditMode ? isLoadingReservation : false;

  const statusOptions = [
    { value: 'agendado', label: 'Agendado', color: 'primary' },
    { value: 'confirmado', label: 'Confirmado', color: 'success' },
    { value: 'cancelado', label: 'Cancelado', color: 'error' },
    { value: 'concluido', label: 'Concluído', color: 'info' },
  ];

  const availableCourts = courts.filter(court => {
    return Math.random() > 0.2;
  });

  const selectedCourt = courts.find(court => court.id === form.courtId);
  const selectedUser = users.find(user => user.id === form.userId);
  const selectedStatus = statusOptions.find(status => status.value === form.status);

  // Função para verificar se a reserva pode ser editada baseada no tempo
  const canEditByTime = () => {
    if (!isEditMode || !reservation) return true;
    
    const now = new Date();
    const reservationStart = new Date(reservation.dataHoraInicio);
    const reservationEnd = new Date(reservation.dataHoraFim);
    
    // Não pode editar se o horário atual está durante ou depois da reserva
    if (now >= reservationStart) {
      return false;
    }
    
    // Não pode editar se o status é "concluido" ou "cancelado"
    const status = reservation.status.toLowerCase();
    if (status === 'concluido' || status === 'cancelado') {
      return false;
    }
    
    return true;
  };

  // Carregar dados da reserva no formulário (modo edição)
  useEffect(() => {
    if (isEditMode && reservation && !isDataLoaded) {
      const startDate = new Date(reservation.dataHoraInicio);
      const endDate = new Date(reservation.dataHoraFim);

      setForm({
        courtId: reservation.courtId, // Garantir que a quadra seja preenchida
        userId: reservation.userId,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        duration: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
        status: reservation.status,
        notes: '',
      });
      
      setIsDataLoaded(true);
    }
  }, [isEditMode, reservation, isDataLoaded]);

  // Calcular duração quando horários mudam
  useEffect(() => {
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}`);
      const end = new Date(`2000-01-01T${form.endTime}`);
      
      if (end > start) {
        const diffMs = end.getTime() - start.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        setForm(prev => ({ ...prev, duration: Math.round(hours * 2) / 2 }));
      } else {
        setForm(prev => ({ ...prev, duration: 0 }));
      }
    }
  }, [form.startTime, form.endTime]);

  const handleInputChange = (field: keyof ReservationForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    if (crudError) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ReservationForm> = {};

    if (!form.courtId) newErrors.courtId = 'Selecione uma quadra';
    if (!form.userId) newErrors.userId = 'Selecione um usuário';
    if (!form.date) newErrors.date = 'Selecione uma data';
    if (!form.startTime) newErrors.startTime = 'Selecione o horário de início';
    if (!form.endTime) newErrors.endTime = 'Selecione o horário de fim';
    if (isEditMode && !form.status) newErrors.status = 'Selecione um status';

    // Validação de tempo para reservas em geral
    if (form.date) {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Resetar horas para comparar apenas a data
      
      if (selectedDate < today) {
        newErrors.date = 'Data não pode ser no passado';
      }
    }

    // Validação específica para modo edição - verificar se pode editar baseado no tempo
    if (isEditMode && !canEditByTime()) {
      newErrors.date = 'Não é possível editar reserva durante ou após o horário agendado';
    }

    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}`);
      const end = new Date(`2000-01-01T${form.endTime}`);
      
      if (end <= start) {
        newErrors.endTime = 'Horário de fim deve ser posterior ao início';
      }
      
      if (form.duration > 8) {
        newErrors.endTime = 'Duração máxima é de 8 horas';
      }
      
      if (form.duration < 0.5) {
        newErrors.endTime = 'Duração mínima é de 30 minutos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${form.date}T${form.startTime}`);
      const endDateTime = new Date(`${form.date}T${form.endTime}`);

      if (isEditMode && reservationId) {
        const updateData: UpdateScheduleRequest = {
          dataHoraInicio: startDateTime.toISOString(),
          dataHoraFim: endDateTime.toISOString(),
          status: form.status,
          userId: form.userId,
          courtId: form.courtId,
        };

        const success = await updateReservation(reservationId, updateData);
        
        if (success) {
          router.push(`/desktop/reservations/${reservationId}?updated=true`);
        }
      } else {
        const reservationData: CreateScheduleRequest = {
          dataHoraInicio: startDateTime,
          dataHoraFim: endDateTime,
          status: 'agendado',
          userId: form.userId,
          courtId: form.courtId,
        };

        const newReservation = await createReservation(reservationData);
        
        if (newReservation) {
          router.push('/desktop/reservations?created=true');
        }
      }
    } catch (error) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} reserva:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditMode && reservation) {
      const startDate = new Date(reservation.dataHoraInicio);
      const endDate = new Date(reservation.dataHoraFim);

      setForm({
        courtId: reservation.courtId,
        userId: reservation.userId,
        date: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
        duration: (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
        status: reservation.status,
        notes: '',
      });
    } else {
      setForm({
        courtId: preSelectedCourtId || '',
        userId: '',
        date: '',
        startTime: '',
        endTime: '',
        duration: 0,
        status: 'agendado',
        notes: '',
      });
    }
    setErrors({});
    clearError();
  };

  const timeOptions = [];
  for (let hour = 7; hour <= 22; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 22 && minute === 30) break;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const getSportEmoji = (tipo: string): string => {
    const lowerTipo = tipo.toLowerCase();
    if (lowerTipo.includes('futebol') || lowerTipo.includes('futsal')) return '⚽';
    if (lowerTipo.includes('basquete') || lowerTipo.includes('basketball')) return '🏀';
    if (lowerTipo.includes('tênis') || lowerTipo.includes('tennis')) return '🎾';
    if (lowerTipo.includes('vôlei') || lowerTipo.includes('volei') || lowerTipo.includes('volleyball')) return '🏐';
    return '🏟️';
  };

  // Verificar se é muito tarde para editar
  const isEditingBlocked = isEditMode && !canEditByTime();

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Button variant="outlined" disabled>
            <ArrowBackIcon />
          </Button>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {isEditMode ? 'Editar Reserva' : 'Nova Reserva'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Carregando dados da reserva...
            </Typography>
          </Box>
        </Box>
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (loadError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {loadError}
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
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditMode ? 'Editar Reserva' : 'Nova Reserva'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode ? 'Modifique os dados da reserva existente' : 'Agende o uso de uma quadra esportiva'}
          </Typography>
        </Box>
      </Box>

      {/* Alerta de bloqueio de edição */}
      {isEditingBlocked && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<WarningIcon />}>
          <strong>Edição bloqueada:</strong> Esta reserva não pode ser editada porque o horário agendado já começou ou a reserva foi concluída/cancelada.
        </Alert>
      )}

      {/* Error Display */}
      {(crudError || loadError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {crudError || loadError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {/* Court Selection */}
                <Box>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <SportsIcon color="primary" />
                    Quadra Esportiva
                  </Typography>
                  <FormControl fullWidth error={!!errors.courtId} disabled={isEditingBlocked}>
                    <InputLabel>Selecione a quadra</InputLabel>
                    <Select
                      value={form.courtId}
                      label="Selecione a quadra"
                      onChange={(e) => handleInputChange('courtId', e.target.value)}
                    >
                      {availableCourts.map((court) => (
                        <MenuItem key={court.id} value={court.id}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Typography variant="h6">
                              {getSportEmoji(court.tipo)}
                            </Typography>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {court.nome}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {court.tipo} • {court.localizacao}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.courtId && <FormHelperText>{errors.courtId}</FormHelperText>}
                  </FormControl>
                </Box>

                {/* User Selection */}
                <Box>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <PersonIcon color="primary" />
                    Usuário
                  </Typography>
                  <FormControl fullWidth error={!!errors.userId} disabled={isEditingBlocked}>
                    <InputLabel>Selecione o usuário</InputLabel>
                    <Select
                      value={form.userId}
                      label="Selecione o usuário"
                      onChange={(e) => handleInputChange('userId', e.target.value)}
                    >
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                              {user.nome.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight="bold">
                                {user.nome}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                  </FormControl>
                </Box>

                {/* Date and Time */}
                <Box>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <CalendarIcon color="primary" />
                    Data e Horário
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        type="date"
                        label="Data"
                        value={form.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        error={!!errors.date}
                        helperText={errors.date}
                        inputProps={{ min: today }}
                        disabled={isEditingBlocked}
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth error={!!errors.startTime} disabled={isEditingBlocked}>
                        <InputLabel>Início</InputLabel>
                        <Select
                          value={form.startTime}
                          label="Início"
                          onChange={(e) => handleInputChange('startTime', e.target.value)}
                        >
                          {timeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.startTime && <FormHelperText>{errors.startTime}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl fullWidth error={!!errors.endTime} disabled={isEditingBlocked}>
                        <InputLabel>Fim</InputLabel>
                        <Select
                          value={form.endTime}
                          label="Fim"
                          onChange={(e) => handleInputChange('endTime', e.target.value)}
                        >
                          {timeOptions.map((time) => (
                            <MenuItem key={time} value={time}>
                              {time}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.endTime && <FormHelperText>{errors.endTime}</FormHelperText>}
                      </FormControl>
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 2 }}>
                      <TextField
                        fullWidth
                        label="Duração"
                        value={form.duration > 0 ? `${form.duration}h` : ''}
                        disabled
                        helperText="Calculado automaticamente"
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Status (only in edit mode) */}
                {isEditMode && (
                  <Box>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon color="primary" />
                      Status da Reserva
                    </Typography>
                    <FormControl fullWidth error={!!errors.status} disabled={isEditingBlocked}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={form.status}
                        label="Status"
                        onChange={(e) => handleInputChange('status', e.target.value)}
                      >
                        {statusOptions.map((status) => (
                          <MenuItem key={status.value} value={status.value}>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Chip 
                                label={status.label} 
                                color={status.color as any}
                                size="small"
                              />
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>
                  </Box>
                )}

                {/* Notes */}
                <Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Observações (opcional)"
                    value={form.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Adicione observações sobre a reserva..."
                    disabled={isEditingBlocked}
                  />
                </Box>

                {/* Actions */}
                <Divider />
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={isSubmitting || isEditingBlocked}
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isEditingBlocked}
                  >
                    {isSubmitting 
                      ? (isEditMode ? 'Atualizando...' : 'Criando...') 
                      : (isEditMode ? 'Atualizar Reserva' : 'Criar Reserva')
                    }
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Selected Court Preview */}
            {selectedCourt && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quadra Selecionada
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Typography variant="h4">
                      {getSportEmoji(selectedCourt.tipo)}
                    </Typography>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedCourt.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourt.tipo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        📍 {selectedCourt.localizacao}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Selected User Preview */}
            {selectedUser && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Usuário Selecionado
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                      {selectedUser.nome.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedUser.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedUser.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Reservation Summary */}
            {form.date && form.startTime && form.endTime && form.duration > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AccessTimeIcon color="primary" />
                    Resumo da Reserva
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Data
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {new Date(form.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Horário
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {form.startTime} às {form.endTime}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Duração
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {form.duration} {form.duration === 1 ? 'hora' : 'horas'}
                      </Typography>
                    </Box>
                    {isEditMode && selectedStatus && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip 
                          label={selectedStatus.label} 
                          color={selectedStatus.color as any}
                          size="small"
                        />
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};