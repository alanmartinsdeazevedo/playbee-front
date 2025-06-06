'use client'

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SportsIcon from '@mui/icons-material/Sports';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { AuthService } from "@/lib/auth";
import { LoginSchema } from "@/lib/validations";
import PWAInstallButton from "@/components/PWAInstallButton";

type LoginForm = z.infer<typeof LoginSchema>;

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const onSubmit = async (values: LoginForm) => {
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const user = await AuthService.login(values.email, values.senha);
      
      setSuccess(`Bem-vindo, ${user.nome}!`);
      
      // Redirecionar após sucesso
      setTimeout(() => {
        router.push("/dashboard");
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
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo e Título */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <SportsIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              PlayBee
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sistema de Reserva de Quadras Esportivas
            </Typography>
          </Box>

          {/* Botão de Instalação PWA */}
          <PWAInstallButton />

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

          {/* Formulário de Login */}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TextField
              autoFocus
              fullWidth
              label='E-mail'
              type="email"
              {...form.register("email")}
              error={!!form.formState.errors.email}
              helperText={form.formState.errors.email?.message}
              sx={{ mb: 3 }}
              disabled={isLoading}
            />
            
            <TextField
              fullWidth
              label='Senha'
              type={isPasswordShown ? 'text' : 'password'}
              {...form.register("senha")}
              error={!!form.formState.errors.senha}
              helperText={form.formState.errors.senha?.message}
              sx={{ mb: 3 }}
              disabled={isLoading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      edge='end'
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
              variant='contained' 
              type='submit' 
              disabled={isLoading}
              size="large"
              sx={{ mb: 2 }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Não tem uma conta?{' '}
                <Button 
                  variant="text" 
                  onClick={() => router.push('/register')}
                  sx={{ textTransform: 'none' }}
                  disabled={isLoading}
                >
                  Cadastre-se
                </Button>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;