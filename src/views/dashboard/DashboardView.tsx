'use client';

import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import {
  Sports as SportsIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export const DashboardView = () => {
  const router = useRouter();

  const stats = [
    {
      title: 'Quadras Disponíveis',
      value: '12',
      icon: <SportsIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Reservas Hoje',
      value: '8',
      icon: <CalendarIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Taxa de Ocupação',
      value: '75%',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
    {
      title: 'Próxima Reserva',
      value: '14:00',
      icon: <AccessTimeIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Bem-vindo ao sistema de reservas PlayBee
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ações Rápidas
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<SportsIcon />}
                  onClick={() => router.push('/dashboard/courts')}
                  fullWidth
                >
                  Ver Quadras Disponíveis
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CalendarIcon />}
                  onClick={() => router.push('/dashboard/reservations')}
                  fullWidth
                >
                  Minhas Reservas
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumo de Hoje
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Quadras mais reservadas: Futebol Society
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Horário de pico: 18:00 - 20:00
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Próxima disponibilidade: 16:00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};