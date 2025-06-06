// src/views/mobile/profile/MobileProfileView.tsx (corrigido para Material-UI v6+)
'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  Switch,
  Alert,
  Paper,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import type { User } from '@/types/auth';

export const MobileProfileView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      router.push('/mobile/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = () => {
    AuthService.logout();
  };

  const profileStats = [
    { label: 'Reservas feitas', value: '24' },
    { label: 'Horas jogadas', value: '36h' },
    { label: 'Esporte favorito', value: 'Futebol' },
  ];

  const settingsItems = [
    {
      icon: <NotificationsIcon />,
      title: 'Notificações',
      subtitle: 'Receber alertas de reservas',
      action: (
        <Switch 
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
      )
    },
    {
      icon: <DarkModeIcon />,
      title: 'Modo Escuro',
      subtitle: 'Tema escuro da aplicação',
      action: (
        <Switch 
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
        />
      )
    },
    {
      icon: <SecurityIcon />,
      title: 'Segurança',
      subtitle: 'Alterar senha e configurações',
      action: <ChevronRightIcon />
    },
    {
      icon: <LanguageIcon />,
      title: 'Idioma',
      subtitle: 'Português (Brasil)',
      action: <ChevronRightIcon />
    },
    {
      icon: <HelpIcon />,
      title: 'Ajuda e Suporte',
      subtitle: 'FAQ e contato',
      action: <ChevronRightIcon />
    },
  ];

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      {/* Profile Header */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mx: 'auto',
              mb: 2
            }}
          >
            {user.nome?.charAt(0) || 'U'}
          </Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {user.nome}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {user.email}
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<EditIcon />}
            sx={{ mt: 2, textTransform: 'none' }}
          >
            Editar Perfil
          </Button>
        </CardContent>
      </Card>

      {/* Stats - Usando Stack horizontal */}
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        {profileStats.map((stat, index) => (
          <Card key={index} sx={{ flex: 1, textAlign: 'center', py: 2 }}>
            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
              <Typography variant="h6" color="primary.main" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Contact Info */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Informações de Contato
          </Typography>
          <List sx={{ p: 0 }}>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <EmailIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={user.email}
                secondary="E-mail principal"
              />
            </ListItem>
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <PhoneIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="(84) 99999-9999"
                secondary="Telefone"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Configurações
          </Typography>
          <List sx={{ p: 0 }}>
            {settingsItems.map((item, index) => (
              <Box key={index}>
                <ListItemButton sx={{ px: 0, borderRadius: 1 }}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    secondary={item.subtitle}
                  />
                  {item.action}
                </ListItemButton>
                {index < settingsItems.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <ListItemButton 
            onClick={handleLogout}
            sx={{ 
              px: 0, 
              borderRadius: 1,
              '&:hover': { 
                bgcolor: 'error.main',
                color: 'white',
                '& .MuiListItemIcon-root': { color: 'white' }
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Sair da Conta"
              primaryTypographyProps={{ color: 'error.main' }}
            />
          </ListItemButton>
        </CardContent>
      </Card>
    </Container>
  );
};