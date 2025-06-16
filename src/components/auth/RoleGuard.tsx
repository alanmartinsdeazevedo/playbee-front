'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Alert, Button, Typography } from '@mui/material';
import { AuthService } from '@/lib/auth';
import type { User } from '@/types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
  fallback?: React.ReactNode;
  redirectTo?: string;
  showAlert?: boolean;
}

export const RoleGuard = ({ 
  children, 
  requiredRole = 'USER',
  fallback,
  redirectTo,
  showAlert = true,
}: RoleGuardProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = () => {
      try {
        const currentUser = AuthService.getUser();
        
        if (!currentUser) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        setUser(currentUser);

        // Verificar se tem acesso baseado no role
        const hasRole = AuthService.hasRole(requiredRole);
        setHasAccess(hasRole);

        // Redirecionar se necessário
        if (!hasRole && redirectTo) {
          router.push(redirectTo);
          return;
        }

      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requiredRole, redirectTo, router]);

  if (isLoading) {
    return null; // Ou um loading spinner
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAlert) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          <Typography variant="h6" gutterBottom>
            Acesso Negado
          </Typography>
          <Typography variant="body2" gutterBottom>
            Você precisa fazer login para acessar esta página.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => router.push('/desktop/login')}
            sx={{ mt: 1 }}
          >
            Fazer Login
          </Button>
        </Alert>
      );
    }

    return null;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showAlert) {
      return (
        <Alert severity="warning" sx={{ m: 2 }}>
          <Typography variant="h6" gutterBottom>
            Acesso Restrito
          </Typography>
          <Typography variant="body2" gutterBottom>
            Você não tem permissão para acessar esta funcionalidade.
            {requiredRole === 'ADMIN' && ' Apenas administradores podem acessar esta área.'}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={() => router.back()}
              sx={{ mr: 1 }}
            >
              Voltar
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => router.push('/desktop/dashboard')}
            >
              Ir para Dashboard
            </Button>
          </Box>
        </Alert>
      );
    }

    return null;
  }

  return <>{children}</>;
};

// Hook para verificar permissões
export const useRole = (requiredRole: 'USER' | 'ADMIN' = 'USER') => {
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getUser();
    setUser(currentUser);
    setHasAccess(AuthService.hasRole(requiredRole));
    setIsLoading(false);
  }, [requiredRole]);

  return {
    user,
    hasAccess,
    isLoading,
    isAdmin: user?.role === 'ADMIN',
    canManageUsers: AuthService.canManageUsers(),
    canManageAllReservations: AuthService.canManageAllReservations(),
    canAccessAdminFeatures: AuthService.canAccessAdminFeatures(),
  };
};