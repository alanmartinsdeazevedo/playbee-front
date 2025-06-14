'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { AuthService } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/desktop/login', '/desktop/register', '/mobile/login', '/mobile/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = AuthService.getUser();
        const token = AuthService.getToken();
        const authenticated = !!user && !!token;

        setIsAuthenticated(authenticated);

        if (!authenticated && !isPublicRoute) {
          const isMobile = pathname.startsWith('/mobile');
          const loginRoute = isMobile ? '/mobile/login' : '/desktop/login';
          router.push(loginRoute);
          return;
        }

        if (authenticated && isPublicRoute) {
          const isMobile = pathname.startsWith('/mobile');
          const dashboardRoute = isMobile ? '/mobile/dashboard' : '/desktop/dashboard';
          router.push(dashboardRoute);
          return;
        }

      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        
        if (!isPublicRoute) {
          const isMobile = pathname.startsWith('/mobile');
          const loginRoute = isMobile ? '/mobile/login' : '/desktop/login';
          router.push(loginRoute);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, isPublicRoute]);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
};