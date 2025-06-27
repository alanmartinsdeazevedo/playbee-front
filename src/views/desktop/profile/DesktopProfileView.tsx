// src/views/desktop/profile/DesktopProfileView.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  TextField,
  Alert,
  IconButton,
  Chip,
  Paper,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Language as LanguageIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/auth';
import { UserService } from '@/services/user.service';
import type { User } from '@/types/auth';

export const DesktopProfileView = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    emailAlerts: true,
  });
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });

  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = AuthService.getUser();
      if (!currentUser) {
        router.push('/desktop/login');
        return;
      }
      
      console.log('🔍 Profile: Usuário carregado:', currentUser);
      
      setUser(currentUser);
      setFormData({
        nome: currentUser.nome || '',
        email: currentUser.email || '',
        telefone: currentUser.telefone || '',
      });
    } catch (err) {
      console.error('❌ Profile: Erro ao carregar usuário:', err);
      setError('Erro ao carregar dados do usuário');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        nome: user.nome,
        email: user.email,
        telefone: user.telefone || '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Validações básicas
      if (!formData.nome.trim()) {
        setError('Nome é obrigatório');
        return;
      }

      if (!formData.email.trim()) {
        setError('Email é obrigatório');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Email deve ser válido');
        return;
      }

      console.log('🔍 Profile: Atualizando usuário:', user.id, formData);

      const updateData = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        telefone: formData.telefone.trim() || undefined,
      };

      console.log('🔍 Profile: Dados para envio:', updateData);

      const updatedUser = await UserService.update(user.id, updateData);
      
      console.log('✅ Profile: Usuário atualizado:', updatedUser);
      
      setUser(updatedUser);
      AuthService.updateUser(updatedUser);
      setIsEditing(false);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('❌ Profile: Erro ao atualizar:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSettingChange = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const handleRefreshProfile = async () => {
    try {
      setIsLoading(true);
      const refreshedUser = await UserService.getProfile();
      setUser(refreshedUser);
      AuthService.updateUser(refreshedUser);
      setSuccess('Dados atualizados!');
    } catch (err) {
      setError('Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleText = (role: string) => {
    return role === 'ADMIN' ? 'Administrador' : 'Usuário';
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'primary' : 'default';
  };

  if (!user) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Typography>Carregando...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Meu Perfil
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas informações pessoais e configurações
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
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
                icon={user.role === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </Typography>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshProfile}
                disabled={isLoading}
                sx={{ mt: 2 }}
              >
                Atualizar Dados
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estatísticas
              </Typography>
              
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Total de Reservas
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    -
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Horas Jogadas
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    -
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label="Ativo" 
                    color="success" 
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    Informações Pessoais
                  </Typography>
                  
                  {!isEditing ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={handleEdit}
                    >
                      Editar
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={isLoading}
                      >
                        Salvar
                      </Button>
                    </Stack>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={formData.nome}
                      onChange={handleInputChange('nome')}
                      disabled={!isEditing || isLoading}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      disabled={!isEditing || isLoading}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Telefone"
                      value={formData.telefone}
                      onChange={handleInputChange('telefone')}
                      disabled={!isEditing || isLoading}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Função"
                      value={getRoleText(user.role)}
                      disabled
                      InputProps={{
                        startAdornment: <SecurityIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configurações
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Notificações"
                      secondary="Receber notificações sobre reservas"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications}
                          onChange={handleSettingChange('notifications')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                  
                  <Divider />
                  
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="Alertas por Email"
                      secondary="Receber lembretes por email"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.emailAlerts}
                          onChange={handleSettingChange('emailAlerts')}
                        />
                      }
                      label=""
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Segurança
                </Typography>
                
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                    disabled
                  >
                    Alterar Senha
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<SecurityIcon />}
                    fullWidth
                    sx={{ justifyContent: 'flex-start' }}
                    disabled
                  >
                    Configurações de Privacidade
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};