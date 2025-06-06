'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Alert,
  Container,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Sports as SportsIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthService } from '@/lib/auth';
import { LoginSchema } from '@/lib/validations';
import PWAInstallButton from '@/components/PWAInstallButton';

type LoginForm = z.infer<typeof LoginSchema>;

const MobileLogin = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (values: LoginForm) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = await AuthService.login(values.email, values.senha);
      
      setSuccess(`Bem-vindo, ${user.nome}!`);
      
      setTimeout(() => {
        router.push('/mobile/dashboard');
      }, 1500);
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => setIsPasswordShown(show => !show);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        pt: 4,
        pb: 4,
      }}
    >
      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4, pt: 4 }}>
          <SportsIcon sx={{ fontSize: 64, color: 'white', mb: 2 }} />
          <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            PlayBee
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Reserve sua quadra
          </Typography>
        </Box>

        {/* PWA Install */}
        <Box sx={{ mb: 3 }}>
          <PWAInstallButton />
        </Box>

        {/* Login Card */}
        <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Alertas */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TextField
                autoFocus
                fullWidth
                label="E-mail"
                type="email"
                {...form.register('email')}
                error={!!form.formState.errors.email}
                helperText={form.formState.errors.email?.message}
                sx={{ mb: 3 }}
                disabled={isLoading}
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="Senha"
                type={isPasswordShown ? 'text' : 'password'}
                {...form.register('senha')}
                error={!!form.formState.errors.senha}
                helperText={form.formState.errors.senha?.message}
                sx={{ mb: 4 }}
                disabled={isLoading}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={handleClickShowPassword}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={isLoading}
                      >
                        {isPasswordShown ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button 
                fullWidth 
                variant="contained" 
                type="submit" 
                disabled={isLoading}
                size="large"
                sx={{ 
                  mb: 3, 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Não tem uma conta?{' '}
                  <Button 
                    variant="text" 
                    onClick={() => router.push('/mobile/register')}
                    sx={{ textTransform: 'none', fontWeight: 'bold' }}
                    disabled={isLoading}
                  >
                    Cadastre-se
                  </Button>
                </Typography>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 'auto', pt: 4, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            PlayBee v1.0 - Sistema de Reserva de Quadras
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default MobileLogin;