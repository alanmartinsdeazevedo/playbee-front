'use client';

import { useState } from 'react';
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
  Fab,
  Stack,
} from '@mui/material';
import {
  Sports as SportsIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Court {
  id: number;
  name: string;
  sport: string;
  location: string;
  price: number;
  rating: number;
  available: boolean;
  image: string;
  features: string[];
}

export const MobileCourtsView = () => {
  const [selectedSport, setSelectedSport] = useState(0);
  const router = useRouter();

  const sports = ['Todos', 'Futebol', 'Basquete', 'Tênis', 'Vôlei'];
  
  const courts: Court[] = [
    {
      id: 1,
      name: 'Quadra Central',
      sport: 'Futebol',
      location: 'Centro',
      price: 80,
      rating: 4.8,
      available: true,
      image: '🏟️',
      features: ['Gramado', 'Iluminação', 'Vestiário']
    },
    {
      id: 2,
      name: 'Arena Basketball',
      sport: 'Basquete',
      location: 'Zona Norte',
      price: 60,
      rating: 4.5,
      available: true,
      image: '🏀',
      features: ['Cobertura', 'Arquibancada', 'Som']
    },
    {
      id: 3,
      name: 'Court Tennis Pro',
      sport: 'Tênis',
      location: 'Zona Sul',
      price: 100,
      rating: 4.9,
      available: false,
      image: '🎾',
      features: ['Saibro', 'Iluminação LED', 'Vestiário']
    },
    {
      id: 4,
      name: 'Vôlei Beach',
      sport: 'Vôlei',
      location: 'Praia',
      price: 70,
      rating: 4.6,
      available: true,
      image: '🏐',
      features: ['Areia', 'Rede profissional', 'Ducha']
    },
  ];

  const filteredCourts = selectedSport === 0 
    ? courts 
    : courts.filter(court => court.sport === sports[selectedSport]);

  const handleReserveCourt = (court: Court) => {
    if (court.available) {
      router.push(`/mobile/reservations/new?courtId=${court.id}`);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Quadras Disponíveis
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Encontre a quadra perfeita para seu esporte
        </Typography>
      </Box>

      {/* Sport Filter Tabs */}
      <Paper elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={selectedSport}
          onChange={(_, newValue) => setSelectedSport(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 1 }}
        >
          {sports.map((sport, index) => (
            <Tab 
              key={sport} 
              label={sport} 
              sx={{ textTransform: 'none', minWidth: 'auto' }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Courts List - Usando Stack ao invés de Grid */}
      <Stack spacing={2}>
        {filteredCourts.map((court) => (
          <Card 
            key={court.id}
            sx={{ 
              borderRadius: 2,
              opacity: court.available ? 1 : 0.6,
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box display="flex" gap={2}>
                {/* Court Image/Icon */}
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    fontSize: '2rem',
                    bgcolor: court.available ? 'primary.main' : 'grey.400'
                  }}
                >
                  {court.image}
                </Avatar>

                {/* Court Info */}
                <Box flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {court.name}
                    </Typography>
                    <Chip 
                      label={court.available ? 'Disponível' : 'Ocupada'}
                      size="small"
                      color={court.available ? 'success' : 'error'}
                      variant="filled"
                    />
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {court.location}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5} ml={1}>
                      <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {court.rating}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Features */}
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {court.features.slice(0, 2).map((feature) => (
                      <Chip 
                        key={feature}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    ))}
                    {court.features.length > 2 && (
                      <Chip 
                        label={`+${court.features.length - 2}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>

                  {/* Price and Action */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      R$ {court.price}/h
                    </Typography>
                    <Button
                      variant={court.available ? "contained" : "outlined"}
                      size="small"
                      disabled={!court.available}
                      onClick={() => handleReserveCourt(court)}
                      sx={{ textTransform: 'none' }}
                    >
                      {court.available ? 'Reservar' : 'Indisponível'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Floating Action Button for Filters */}
      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        size="medium"
      >
        <FilterIcon />
      </Fab>
    </Container>
  );
};