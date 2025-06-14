'use client';

import { Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardLayout>{children}</DashboardLayout>
    </Suspense>
  );
}