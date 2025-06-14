'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Button,
  TextField,
  MenuItem,
  Stack,
  Avatar,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  AppBar,
  Toolbar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Sports as SportsIcon,
  Save as SaveIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
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

export const MobileNewReservationView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedCourtId = searchParams.get('courtId');

  const [activeStep, setActiveStep] = useState(0);
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

  const steps = ['Quadra', 'Usuário', 'Data & Hora', 'Confirmar'];

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
  ];

  const availableCourts = courts.filter(court => court.available);
  const selectedCourt = courts.find(court => court.id.toString() === form.courtId);
  const selectedUser = users.find(user => user.id.toString() === form.userId);

  // Calculate duration when start/end time changes
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
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<ReservationForm> = {};

    switch (step) {
      case 0: // Court
        if (!form.courtId) newErrors.courtId = 'Selecione uma quadra';
        break;
      case 1: // User
        if (!form.userId) newErrors.userId = 'Selecione um usuário';
        break;
      case 2: // Date & Time
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
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Nova reserva:', {
        ...form,
        status: 'upcoming',
        createdAt: new Date().toISOString(),
      });

      router.push('/mobile/reservations?created=true');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time options
  const timeOptions: string[] = [];
  for (let hour = 7; hour <= 22; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 22 && minute === 30) break;
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Court Selection
        return (
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Escolha a Quadra
            </Typography>
            {availableCourts.map((court) => (
              <Card 
                key={court.id}
                sx={{ 
                  cursor: 'pointer',
                  border: form.courtId === court.id.toString() ? 2 : 1,
                  borderColor: form.courtId === court.id.toString() ? 'primary.main' : 'divider',
                  bgcolor: form.courtId === court.id.toString() ? 'primary.50' : 'background.paper'
                }}
                onClick={() => handleInputChange('courtId', court.id.toString())}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                      {court.image}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {court.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {court.sport} • {court.location}
                      </Typography>
                    </Box>
                    <Chip label="Disponível" color="success" size="small" />
                  </Box>
                </CardContent>
              </Card>
            ))}
            {errors.courtId && (
              <Alert severity="error">{errors.courtId}</Alert>
            )}
          </Stack>
        );

      case 1: // User Selection
        return (
          <Stack spacing={2}>
            <Typography variant="h6" gutterBottom>
              Selecione o Usuário
            </Typography>
            {users.map((user) => (
              <Card 
                key={user.id}
                sx={{ 
                  cursor: 'pointer',
                  border: form.userId === user.id.toString() ? 2 : 1,
                  borderColor: form.userId === user.id.toString() ? 'primary.main' : 'divider',
                  bgcolor: form.userId === user.id.toString() ? 'primary.50' : 'background.paper'
                }}
                onClick={() => handleInputChange('userId', user.id.toString())}
              >
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            {errors.userId && (
              <Alert severity="error">{errors.userId}</Alert>
            )}
          </Stack>
        );

      case 2: // Date & Time
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Data e Horário
            </Typography>
            
            <TextField
              label="Data"
              type="date"
              value={form.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: today }}
              error={!!errors.date}
              helperText={errors.date}
              fullWidth
            />

            <FormControl fullWidth error={!!errors.startTime}>
              <InputLabel>Horário de Início</InputLabel>
              <Select
                value={form.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                label="Horário de Início"
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
              <InputLabel>Horário de Fim</InputLabel>
              <Select
                value={form.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                label="Horário de Fim"
              >
                {timeOptions.map((time) => (
                  <MenuItem key={time} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
              {errors.endTime && <FormHelperText>{errors.endTime}</FormHelperText>}
            </FormControl>

            {form.duration > 0 && (
              <Alert severity="info">
                <Typography variant="body2">
                  Duração: <strong>{form.duration}h</strong>
                </Typography>
              </Alert>
            )}

            <TextField
              label="Observações (Opcional)"
              multiline
              rows={2}
              value={form.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Adicione observações..."
              fullWidth
            />
          </Stack>
        );

      case 3: // Confirmation
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Confirmar Reserva
            </Typography>
            
            {/* Summary Cards */}
            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  QUADRA
                </Typography>
                {selectedCourt && (
                  <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <Avatar sx={{ bgcolor: 'primary.main', fontSize: '1.2rem', width: 40, height: 40 }}>
                      {selectedCourt.image}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {selectedCourt.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCourt.sport} • {selectedCourt.location}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  USUÁRIO
                </Typography>
                {selectedUser && (
                  <Box mt={1}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  DATA E HORÁRIO
                </Typography>
                <Box mt={1}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {form.date ? new Date(form.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'Não selecionada'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {form.startTime && form.endTime 
                      ? `${form.startTime} às ${form.endTime} (${form.duration}h)`
                      : 'Horário não definido'
                    }
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {form.notes && (
              <Card variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    OBSERVAÇÕES
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {form.notes}
                  </Typography>
                </CardContent>
              </Card>
            )}

            <Alert severity="success">
              <Typography variant="body2">
                <strong>Tudo pronto!</strong> Sua reserva será criada com status "Agendada".
              </Typography>
            </Alert>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <AppBar position="sticky" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Nova Reserva
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 2 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mb: 8 }}>
          {renderStepContent(activeStep)}
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          p: 2,
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<BackIcon />}
            fullWidth
          >
            Voltar
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              startIcon={<SaveIcon />}
              fullWidth
              size="large"
            >
              {isSubmitting ? 'Criando...' : 'Criar Reserva'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NextIcon />}
              fullWidth
              size="large"
            >
              Próximo
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};