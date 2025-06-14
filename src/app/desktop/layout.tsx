'use client';

import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { usePathname } from 'next/navigation';

const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const publicRoutes = ['/desktop/login', '/desktop/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}