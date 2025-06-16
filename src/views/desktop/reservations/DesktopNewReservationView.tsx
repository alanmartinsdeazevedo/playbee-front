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

  useEffect(() => {
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
    }
  }, [isEditMode, reservation]);

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

    if (form.date && new Date(form.date) < new Date()) {
      newErrors.date = 'Data não pode ser no passado';
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
          </Box>
        </Box>
        <CircularProgress />
      </Container>
    );
  }

  if (isEditMode && loadError) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Erro ao carregar dados da reserva: {loadError}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="outlined"
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditMode ? 'Editar Reserva' : 'Nova Reserva'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode 
              ? 'Atualize as informações da reserva'
              : 'Agende o uso de uma quadra esportiva'
            }
          </Typography>
        </Box>
      </Box>

      {crudError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
        >
          {crudError}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs:12, md:8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditMode ? <EditIcon color="primary" /> : <ScheduleIcon color="primary" />}
                {isEditMode ? 'Editar Dados da Reserva' : 'Dados da Reserva'}
              </Typography>

              <Stack spacing={3} sx={{ mt: 3 }}>
                <FormControl fullWidth error={!!errors.courtId}>
                  <InputLabel>Quadra *</InputLabel>
                  <Select
                    value={form.courtId}
                    onChange={(e) => handleInputChange('courtId', e.target.value)}
                    label="Quadra *"
                  >
                    {availableCourts.map((court) => (
                      <MenuItem key={court.id} value={court.id}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <span style={{ fontSize: '1.2rem' }}>{getSportEmoji(court.tipo)}</span>
                          <Box>
                            <Typography variant="body1">{court.nome}</Typography>
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

                <FormControl fullWidth error={!!errors.userId}>
                  <InputLabel>Usuário *</InputLabel>
                  <Select
                    value={form.userId}
                    onChange={(e) => handleInputChange('userId', e.target.value)}
                    label="Usuário *"
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {user.nome.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body1">{user.nome}</Typography>
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

                <TextField
                  label="Data *"
                  type="date"
                  value={form.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: today }}
                  error={!!errors.date}
                  helperText={errors.date}
                  fullWidth
                />

                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth error={!!errors.startTime}>
                    <InputLabel>Horário de Início *</InputLabel>
                    <Select
                      value={form.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      label="Horário de Início *"
                    >
                      {timeOptions.map((time) => (
                        <MenuItem key={time} value={time}>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.startTime && <FormHelperText>{errors.startTime}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth error={!!errors.endTime}>
                    <InputLabel>Horário de Fim *</InputLabel>
                    <Select
                      value={form.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      label="Horário de Fim *"
                    >
                      {timeOptions.map((time) => (
                        <MenuItem key={time} value={time}>
                          {time}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.endTime && <FormHelperText>{errors.endTime}</FormHelperText>}
                  </FormControl>
                </Stack>

                {isEditMode && (
                  <FormControl fullWidth error={!!errors.status}>
                    <InputLabel>Status *</InputLabel>
                    <Select
                      value={form.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Status *"
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
                )}

                {form.duration > 0 && (
                  <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon />
                    <Typography>
                      Duração: <strong>{form.duration}h</strong>
                      {form.duration > 4 && ' (Reserva longa - verifique disponibilidade)'}
                    </Typography>
                  </Alert>
                )}

                <TextField
                  label="Observações"
                  multiline
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Adicione observações sobre a reserva (opcional)"
                  fullWidth
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    {isEditMode ? 'Resetar' : 'Limpar'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isEditMode ? <SaveIcon /> : <AddIcon />}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="large"
                  >
                    {isSubmitting 
                      ? (isEditMode ? 'Salvando...' : 'Criando...') 
                      : (isEditMode ? 'Salvar Alterações' : 'Criar Reserva')
                    }
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs:12, md:4 }}>
          <Stack spacing={3}>
            {selectedCourt && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsIcon color="primary" />
                    Quadra Selecionada
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                      {getSportEmoji(selectedCourt.tipo)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedCourt.nome}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourt.tipo} • {selectedCourt.localizacao}
                      </Typography>
                      <Chip label="Disponível" color="success" size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {selectedUser && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="primary" />
                    Usuário Selecionado
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {selectedUser.nome.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
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

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  {isEditMode ? 'Dados Atuais' : 'Resumo da Reserva'}
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Data
                    </Typography>
                    <Typography variant="body1">
                      {form.date ? new Date(form.date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : 'Não selecionada'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Horário
                    </Typography>
                    <Typography variant="body1">
                      {form.startTime && form.endTime 
                        ? `${form.startTime} às ${form.endTime}`
                        : 'Não selecionado'
                      }
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Duração
                    </Typography>
                    <Typography variant="body1">
                      {form.duration > 0 ? `${form.duration} horas` : 'Não definida'}
                    </Typography>
                  </Box>

                  {isEditMode && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Box mt={0.5}>
                        {selectedStatus ? (
                          <Chip 
                            label={selectedStatus.label}
                            color={selectedStatus.color as any}
                            size="small"
                          />
                        ) : (
                          <Typography variant="body1">Não selecionado</Typography>
                        )}
                      </Box>
                    </Box>
                  )}

                  {!isEditMode && (
                    <>
                      <Divider />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Chip 
                          label="Agendada" 
                          color="primary" 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {isEditMode && reservation && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Dados Originais
                  </Typography>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Data Original
                      </Typography>
                      <Typography variant="body2">
                        {new Date(reservation.dataHoraInicio).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Horário Original
                      </Typography>
                      <Typography variant="body2">
                        {new Date(reservation.dataHoraInicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(reservation.dataHoraFim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status Original
                      </Typography>
                      <Typography variant="body2">
                        {reservation.status}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Alert severity={isEditMode ? "warning" : "info"}>
              <Typography variant="body2">
                <strong>{isEditMode ? 'Atenção:' : 'Lembre-se:'}</strong>{' '}
                {isEditMode 
                  ? 'As alterações afetarão a reserva permanentemente. Verifique todos os dados antes de salvar.'
                  : 'As quadras são gratuitas e podem ser canceladas até 2 horas antes do horário agendado.'
                }
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};