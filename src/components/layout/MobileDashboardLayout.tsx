'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import {
  Home as HomeIcon,
  Sports as SportsIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { AuthService } from '@/lib/auth';

interface MobileDashboardLayoutProps {
  children: React.ReactNode;
}

export const MobileDashboardLayout = ({ children }: MobileDashboardLayoutProps) => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Definir tab ativo baseado na rota
    if (pathname.includes('/dashboard') && pathname === '/mobile/dashboard') {
      setValue(0);
    } else if (pathname.includes('/courts')) {
      setValue(1);
    } else if (pathname.includes('/reservations')) {
      setValue(2);
    } else if (pathname.includes('/profile')) {
      setValue(3);
    }
  }, [pathname]);

  const handleNavigationChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    const routes = [
      '/mobile/dashboard',
      '/mobile/courts',
      '/mobile/reservations',
      '/mobile/profile',
    ];
    
    router.push(routes[newValue]);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    AuthService.logout();
    handleMenuClose();
  };

  return (
    <Box sx={{ 
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top App Bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PlayBee
          </Typography>
          <IconButton
            color="inherit"
            onClick={handleMenuOpen}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { router.push('/mobile/profile'); handleMenuClose(); }}>
              Perfil
            </MenuItem>
            <MenuItem onClick={() => { router.push('/mobile/settings'); handleMenuClose(); }}>
              Configurações
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              Sair
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Conteudo */}
      <Box 
        component="main" 
        sx={{ 
          flex: 1,
          overflow: 'auto',
          pb: 7, 
        }}
      >
        {children}
      </Box>

      {/* Menu Inferior */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
        <BottomNavigation
          value={value}
          onChange={handleNavigationChange}
          showLabels
        >
          <BottomNavigationAction
            label="Início"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Quadras"
            icon={<SportsIcon />}
          />
          <BottomNavigationAction
            label="Reservas"
            icon={<CalendarIcon />}
          />
          <BottomNavigationAction
            label="Perfil"
            icon={<PersonIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};