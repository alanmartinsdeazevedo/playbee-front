// src/views/mobile/reservations/MobileNewReservationView.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
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
  CircularProgress,
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

const MobileNewReservationContent = () => {
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

  const mockCourts: Court[] = [
    { id: 1, name: 'Quadra de Tênis 1', sport: 'Tênis', location: 'Área A', available: true, image: '' },
    { id: 2, name: 'Quadra de Futebol', sport: 'Futebol', location: 'Área B', available: true, image: '' },
    { id: 3, name: 'Quadra de Basquete', sport: 'Basquete', location: 'Área C', available: false, image: '' },
  ];

  const mockUsers: User[] = [
    { id: 1, name: 'João Silva', email: 'joao@email.com' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com' },
    { id: 3, name: 'Pedro Oliveira', email: 'pedro@email.com' },
  ];

  const steps = ['Quadra', 'Usuário', 'Data e Horário', 'Confirmação'];

  useEffect(() => {
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}`);
      const end = new Date(`2000-01-01T${form.endTime}`);
      
      if (end > start) {
        const diffMs = end.getTime() - start.getTime();
        const hours = diffMs / (1000 * 60 * 60);
        setForm(prev => ({ ...prev, duration: Math.round(hours * 10) / 10 }));
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
      case 0:
        if (!form.courtId) newErrors.courtId = 'Selecione uma quadra';
        break;
      case 1:
        if (!form.userId) newErrors.userId = 'Selecione um usuário';
        break;
      case 2:
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
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/mobile/reservations');
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCourt = mockCourts.find(court => court.id.toString() === form.courtId);
  const selectedUser = mockUsers.find(user => user.id.toString() === form.userId);

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Selecione uma Quadra
            </Typography>
            <FormControl fullWidth error={!!errors.courtId}>
              <InputLabel>Quadra</InputLabel>
              <Select
                value={form.courtId}
                label="Quadra"
                onChange={(e) => handleInputChange('courtId', e.target.value)}
              >
                {mockCourts.map((court) => (
                  <MenuItem key={court.id} value={court.id.toString()} disabled={!court.available}>
                    <Box display="flex" alignItems="center" gap={2} width="100%">
                      <Avatar sx={{ bgcolor: court.available ? 'success.main' : 'grey.500' }}>
                        <SportsIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1">{court.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {court.sport} • {court.location}
                        </Typography>
                      </Box>
                      <Chip 
                        label={court.available ? 'Disponível' : 'Ocupada'} 
                        color={court.available ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.courtId && <FormHelperText>{errors.courtId}</FormHelperText>}
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Selecione o Usuário
            </Typography>
            <FormControl fullWidth error={!!errors.userId}>
              <InputLabel>Usuário</InputLabel>
              <Select
                value={form.userId}
                label="Usuário"
                onChange={(e) => handleInputChange('userId', e.target.value)}
              >
                {mockUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">{user.name}</Typography>
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
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Data e Horário
            </Typography>
            
            <TextField
              fullWidth
              type="date"
              label="Data"
              value={form.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={!!errors.date}
              helperText={errors.date}
            />

            <Stack direction="row" spacing={2}>
              <TextField
                sx={{ flex: 1 }}
                type="time"
                label="Horário de Início"
                value={form.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.startTime}
                helperText={errors.startTime}
              />
              <TextField
                sx={{ flex: 1 }}
                type="time"
                label="Horário de Fim"
                value={form.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.endTime}
                helperText={errors.endTime}
              />
            </Stack>

            {form.duration > 0 && (
              <Alert severity="info">
                Duração: {form.duration} hora{form.duration !== 1 ? 's' : ''}
              </Alert>
            )}

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Observações (opcional)"
              value={form.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Adicione observações sobre a reserva..."
            />
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Confirmar Reserva
            </Typography>
            
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <SportsIcon color="primary" />
                    <Box>
                      <Typography variant="subtitle1">{selectedCourt?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedCourt?.sport} • {selectedCourt?.location}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {selectedUser?.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{selectedUser?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedUser?.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <CalendarIcon color="action" />
                    <Typography>
                      {new Date(form.date).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <AccessTimeIcon color="action" />
                    <Typography>
                      {form.startTime} às {form.endTime} ({form.duration}h)
                    </Typography>
                  </Box>

                  {form.notes && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Observações:</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {form.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.back()}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Nova Reserva
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}

            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              {activeStep > 0 && (
                <Button 
                  startIcon={<BackIcon />}
                  onClick={handleBack}
                  variant="outlined"
                >
                  Voltar
                </Button>
              )}
              
              <Box sx={{ flexGrow: 1 }} />
              
              {activeStep < steps.length - 1 ? (
                <Button 
                  endIcon={<NextIcon />}
                  onClick={handleNext}
                  variant="contained"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Salvando...' : 'Confirmar'}
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export const MobileNewReservationView = () => {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    }>
      <MobileNewReservationContent />
    </Suspense>
  );
};