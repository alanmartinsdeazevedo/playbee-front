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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

interface Court {
  id: number;
  name: string;
  sport: string;
  location: string;
  available: boolean;
  image: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface ReservationForm {
  courtId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  notes: string;
}

export const DesktopNewReservationView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedCourtId = searchParams.get('courtId');

  const [form, setForm] = useState<ReservationForm>({
    courtId: preSelectedCourtId || '',
    userId: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 0,
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<ReservationForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const courts: Court[] = [
    {
      id: 1,
      name: 'Quadra Central',
      sport: 'Futebol',
      location: 'Centro',
      available: true,
      image: '🏟️'
    },
    {
      id: 2,
      name: 'Arena Basketball',
      sport: 'Basquete',
      location: 'Zona Norte',
      available: true,
      image: '🏀'
    },
    {
      id: 3,
      name: 'Court Tennis Pro',
      sport: 'Tênis',
      location: 'Zona Sul',
      available: false,
      image: '🎾'
    },
    {
      id: 4,
      name: 'Vôlei Beach',
      sport: 'Vôlei',
      location: 'Praia',
      available: true,
      image: '🏐'
    },
  ];

  const users: User[] = [
    { id: 1, name: 'João Silva', email: 'joao@email.com' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com' },
    { id: 3, name: 'Pedro Costa', email: 'pedro@email.com' },
    { id: 4, name: 'Ana Lima', email: 'ana@email.com' },
  ];

  const availableCourts = courts.filter(court => court.available);
  const selectedCourt = courts.find(court => court.id.toString() === form.courtId);

  // Calculate duration when start/end time changes
  useEffect(() => {
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}`);
      const end = new Date(`2000-01-01T${form.endTime}`);
      
      if (end > start) {
        const diffMs = end.getTime() - start.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        setForm(prev => ({ ...prev, duration: Math.round(hours * 2) / 2 })); // Round to nearest 0.5h
      } else {
        setForm(prev => ({ ...prev, duration: 0 }));
      }
    }
  }, [form.startTime, form.endTime]);

  const handleInputChange = (field: keyof ReservationForm, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ReservationForm> = {};

    if (!form.courtId) newErrors.courtId = 'Selecione uma quadra';
    if (!form.userId) newErrors.userId = 'Selecione um usuário';
    if (!form.date) newErrors.date = 'Selecione uma data';
    if (!form.startTime) newErrors.startTime = 'Selecione o horário de início';
    if (!form.endTime) newErrors.endTime = 'Selecione o horário de fim';

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Nova reserva:', {
        ...form,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      });

      // Redirect to reservations list
      router.push('/desktop/reservations?created=true');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time options (7:00 to 22:00, every 30 minutes)
  const timeOptions = [];
  for (let hour = 7; hour <= 22; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 22 && minute === 30) break; // Stop at 22:00
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Container maxWidth="lg">
      {/* Header */}
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
            Nova Reserva
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Agende o uso de uma quadra esportiva
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon color="primary" />
                Dados da Reserva
              </Typography>

              <Stack spacing={3} sx={{ mt: 3 }}>
                {/* Court Selection */}
                <FormControl fullWidth error={!!errors.courtId}>
                  <InputLabel>Quadra *</InputLabel>
                  <Select
                    value={form.courtId}
                    onChange={(e) => handleInputChange('courtId', e.target.value)}
                    label="Quadra *"
                  >
                    {availableCourts.map((court) => (
                      <MenuItem key={court.id} value={court.id.toString()}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <span style={{ fontSize: '1.2rem' }}>{court.image}</span>
                          <Box>
                            <Typography variant="body1">{court.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {court.sport} • {court.location}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.courtId && <FormHelperText>{errors.courtId}</FormHelperText>}
                </FormControl>

                {/* User Selection */}
                <FormControl fullWidth error={!!errors.userId}>
                  <InputLabel>Usuário *</InputLabel>
                  <Select
                    value={form.userId}
                    onChange={(e) => handleInputChange('userId', e.target.value)}
                    label="Usuário *"
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id.toString()}>
                        <Box>
                          <Typography variant="body1">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.userId && <FormHelperText>{errors.userId}</FormHelperText>}
                </FormControl>

                {/* Date */}
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

                {/* Time Range */}
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

                {/* Duration Display */}
                {form.duration > 0 && (
                  <Alert severity="info" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon />
                    <Typography>
                      Duração: <strong>{form.duration}h</strong>
                      {form.duration > 4 && ' (Reserva longa - verifique disponibilidade)'}
                    </Typography>
                  </Alert>
                )}

                {/* Notes */}
                <TextField
                  label="Observações"
                  multiline
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Adicione observações sobre a reserva (opcional)"
                  fullWidth
                />

                {/* Actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="large"
                  >
                    {isSubmitting ? 'Criando Reserva...' : 'Criar Reserva'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Selected Court Info */}
            {selectedCourt && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SportsIcon color="primary" />
                    Quadra Selecionada
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                      {selectedCourt.image}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedCourt.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourt.sport} • {selectedCourt.location}
                      </Typography>
                      <Chip label="Disponível" color="success" size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Reservation Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  Resumo da Reserva
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
                </Stack>
              </CardContent>
            </Card>

            {/* Info */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Lembre-se:</strong> As reservas são gratuitas e podem ser canceladas até 2 horas antes do horário agendado.
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};