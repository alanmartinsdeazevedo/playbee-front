'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Sports as SportsIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthService } from '@/lib/auth';

const RegisterSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
  telefone: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "Senhas não coincidem",
  path: ["confirmarSenha"],
});

type RegisterForm = z.infer<typeof RegisterSchema>;

export const DesktopRegisterView = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      telefone: '',
    },
  });

  const onSubmit = async (values: RegisterForm) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = await AuthService.register({
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        telefone: values.telefone || '',
        role: 'USER',
      });
      
      setSuccess(`Conta criada com sucesso! Bem-vindo, ${user.nome}!`);
      
      // Redirecionar após sucesso
      setTimeout(() => {
        router.push('/desktop/dashboard');
      }, 1500);
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/desktop/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <IconButton 
              onClick={handleBackToLogin}
              sx={{ position: 'absolute', top: 16, left: 16 }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <SportsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              Criar Conta
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Cadastre-se no PlayBee
            </Typography>
          </Box>

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

          {/* Formulário */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <TextField
                autoFocus
                fullWidth
                label="Nome Completo"
                {...form.register('nome')}
                error={!!form.formState.errors.nome}
                helperText={form.formState.errors.nome?.message}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="E-mail"
                type="email"
                {...form.register('email')}
                error={!!form.formState.errors.email}
                helperText={form.formState.errors.email?.message}
                disabled={isLoading}
              />

              <TextField
                fullWidth
                label="Telefone (opcional)"
                {...form.register('telefone')}
                error={!!form.formState.errors.telefone}
                helperText={form.formState.errors.telefone?.message}
                placeholder="(84) 99999-9999"
                disabled={isLoading}
              />
              
              <TextField
                fullWidth
                label="Senha"
                type={isPasswordShown ? 'text' : 'password'}
                {...form.register('senha')}
                error={!!form.formState.errors.senha}
                helperText={form.formState.errors.senha?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setIsPasswordShown(!isPasswordShown)}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={isLoading}
                      >
                        {isPasswordShown ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Senha"
                type={isConfirmPasswordShown ? 'text' : 'password'}
                {...form.register('confirmarSenha')}
                error={!!form.formState.errors.confirmarSenha}
                helperText={form.formState.errors.confirmarSenha?.message}
                disabled={isLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                        onMouseDown={(e) => e.preventDefault()}
                        disabled={isLoading}
                      >
                        {isConfirmPasswordShown ? <VisibilityOff /> : <Visibility />}
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
                sx={{ mt: 3 }}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Já tem uma conta?{' '}
              <Button 
                variant="text" 
                onClick={handleBackToLogin}
                sx={{ textTransform: 'none' }}
                disabled={isLoading}
              >
                Fazer Login
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};