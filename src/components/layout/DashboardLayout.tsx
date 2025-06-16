// src/components/layout/DashboardLayout.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Sports as SportsIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { AuthService } from '@/lib/auth';
import type { User } from '@/types/auth';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Verificar autenticação e carregar usuário
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      router.push('/desktop/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const navItems: NavItem[] = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/desktop/dashboard' 
    },
    { 
      text: 'Quadras', 
      icon: <SportsIcon />, 
      path: '/desktop/courts',
      badge: '12'
    },
    { 
      text: 'Reservas', 
      icon: <CalendarIcon />, 
      path: '/desktop/reservations',
      badge: '3'
    },
    { 
      text: 'Usuários', 
      icon: <PeopleIcon />, 
      path: '/desktop/users' 
    },
    { 
      text: 'Configurações', 
      icon: <SettingsIcon />, 
      path: user ? `/desktop/users/${user.id}/edit` : '/desktop/settings' // ✅ CORREÇÃO: redireciona para editar perfil do usuário logado
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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

  const handleNavigation = (path: string) => {
    console.log('🔍 Navegando via menu lateral para:', path);
    console.log('🔍 Rota atual:', pathname);
    
    // Se já estamos na rota de destino, forçar reload
    if (pathname === path) {
      console.log('✅ Já estamos na rota de destino, forçando reload...');
      window.location.href = path;
    } else {
      router.push(path);
    }
    
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileClick = () => {
    // ✅ CORREÇÃO: redireciona para página de edição do usuário logado
    if (user) {
      console.log('🔍 Navegando para perfil do usuário:', user.id);
      console.log('🔍 Rota atual:', pathname);
      console.log('🔍 Rota destino:', `/desktop/users/${user.id}/edit`);
      
      const targetRoute = `/desktop/users/${user.id}/edit`;
      
      // Se já estamos na rota de destino, forçar reload
      if (pathname === targetRoute) {
        console.log('✅ Já estamos na rota de destino, forçando reload...');
        window.location.href = targetRoute;
      } else {
        router.push(targetRoute);
      }
    }
    handleMenuClose();
  };

  const handleSettingsClick = () => {
    // ✅ CORREÇÃO: redireciona para página de edição do usuário logado
    if (user) {
      console.log('🔍 Navegando para configurações do usuário:', user.id);
      console.log('🔍 Rota atual:', pathname);
      console.log('🔍 Rota destino:', `/desktop/users/${user.id}/edit`);
      
      const targetRoute = `/desktop/users/${user.id}/edit`;
      
      // Se já estamos na rota de destino, forçar reload
      if (pathname === targetRoute) {
        console.log('✅ Já estamos na rota de destino, forçando reload...');
        window.location.href = targetRoute;
      } else {
        router.push(targetRoute);
      }
    }
    handleMenuClose();
  };

  // Se não há usuário, não renderizar nada (AuthGuard vai redirecionar)
  if (!user) {
    return null;
  }

  const drawerContent = (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SportsIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" color="primary.main">
            PlayBee
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '15',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '25',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  color: pathname === item.path ? 'primary.main' : 'inherit',
                }}
              />
              {item.badge && (
                <Chip 
                  label={item.badge} 
                  size="small" 
                  sx={{ 
                    height: 20,
                    '& .MuiChip-label': { fontSize: '0.75rem' }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                mr: 1
              }}
            >
              {user.nome}
            </Typography>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'secondary.main',
                  width: 36,
                  height: 36,
                }}
              >
                {user.nome?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
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
        sx={{ mt: 1 }}
      >
        <MenuItem onClick={handleProfileClick}>
          <PersonIcon sx={{ mr: 1 }} />
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <SettingsIcon sx={{ mr: 1 }} />
          Configurações
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 1 }} />
          Sair
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'grey.50',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};