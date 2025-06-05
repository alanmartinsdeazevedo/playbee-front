'use client'

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
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

import type * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { login } from "@/actions/auth";
import { LoginSchema } from "@/lib/validations";
import PWAInstallButton from "@/components/PWAInstallButton";

const Login = () => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const response = await login(values, callbackUrl);

        if (response?.error) {
          setError(response.error);
        }

        if (response?.success) {
          setSuccess(response.success);
          
          // Redirecionar após login bem-sucedido
          setTimeout(() => {
            router.push(callbackUrl || "/dashboard");
          }, 1500);
        }

        if (response?.twoFactor) {
          setShowTwoFactor(true);
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Algo deu errado. Por favor, tente novamente.");
      }
    });
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

          {/* Formulário de Two Factor */}
          {showTwoFactor ? (
            <form
              noValidate
              autoComplete='off'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <Typography variant="body2" sx={{ mb: 2 }}>
                Insira o código de verificação de dois fatores enviado para seu e-mail
              </Typography>
              <TextField
                autoFocus
                fullWidth
                label='Código de verificação'
                {...form.register("code")}
                error={!!form.formState.errors.code}
                helperText={form.formState.errors.code?.message}
                sx={{ mb: 3 }}
              />
              <Button 
                fullWidth 
                variant='contained' 
                type='submit' 
                disabled={isPending}
                size="large"
              >
                {isPending ? 'Verificando...' : 'Verificar'}
              </Button>
            </form>
          ) : (
            /* Formulário de Login */
            <form
              noValidate
              autoComplete='off'
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <TextField
                autoFocus
                fullWidth
                label='E-mail'
                type="email"
                {...form.register("email")}
                error={!!form.formState.errors.email}
                helperText={form.formState.errors.email?.message}
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label='Senha'
                type={isPasswordShown ? 'text' : 'password'}
                {...form.register("password")}
                error={!!form.formState.errors.password}
                helperText={form.formState.errors.password?.message}
                sx={{ mb: 3 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={(e) => e.preventDefault()}
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
                disabled={isPending}
                size="large"
                sx={{ mb: 2 }}
              >
                {isPending ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Não tem uma conta?{' '}
                  <Button 
                    variant="text" 
                    onClick={() => router.push('/register')}
                    sx={{ textTransform: 'none' }}
                  >
                    Cadastre-se
                  </Button>
                </Typography>
              </Box>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;