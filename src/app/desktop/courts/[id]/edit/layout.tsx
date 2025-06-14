'use client';

import { useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Durante SSR ou antes da hidratação, mostrar loading
  if (!isClient) {
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

  // Após hidratação, mostrar o layout normal
  return <DashboardLayout>{children}</DashboardLayout>;
}