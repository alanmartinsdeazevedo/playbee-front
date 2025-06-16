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
import { useCourts } from '@/hooks/useCourts';
import { useReservations } from '@/hooks/useReservations';
import { useUsers } from '@/hooks/useUsers';
import type { User } from '@/types/auth';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  badge?: string | number;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Hooks para buscar dados reais
  const { courts } = useCourts();
  const { reservations } = useReservations();
  const { users } = useUsers();

  useEffect(() => {
    // Verificar autenticação e carregar usuário
    const currentUser = AuthService.getUser();
    if (!currentUser) {
      router.push('/desktop/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  // Calcular estatísticas baseadas nos dados reais
  const getStatistics = () => {
    const now = new Date();
    
    if (!user) return { courtsCount: 0, reservationsCount: 0, upcomingCount: 0 };

    // Filtrar reservas baseado no papel do usuário
    let userReservations = reservations;
    if (user.role !== 'ADMIN') {
      // Usuário comum vê apenas suas próprias reservas
      userReservations = reservations.filter(r => r.userId === user.id);
    }

    // Contar reservas próximas (futuras e não canceladas)
    const upcomingReservations = userReservations.filter(r => {
      const startTime = new Date(r.dataHoraInicio);
      const status = r.status.toLowerCase();
      return startTime >= now && !['cancelado', 'cancelled'].includes(status);
    });

    return {
      courtsCount: courts.length,
      reservationsCount: userReservations.length,
      upcomingCount: upcomingReservations.length,
    };
  };

  const stats = getStatistics();

  // Definir itens de navegação com badges dinâmicos
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { 
        text: 'Dashboard', 
        icon: <DashboardIcon />, 
        path: '/desktop/dashboard' 
      },
      { 
        text: 'Quadras', 
        icon: <SportsIcon />, 
        path: '/desktop/courts',
        badge: stats.courtsCount > 0 ? stats.courtsCount : undefined
      },
      { 
        text: 'Reservas', 
        icon: <CalendarIcon />, 
        path: '/desktop/reservations',
        badge: stats.upcomingCount > 0 ? stats.upcomingCount : undefined
      },
    ];

    // Adicionar "Usuários" apenas para admins
    if (user?.role === 'ADMIN') {
      baseItems.push({
        text: 'Usuários', 
        icon: <PeopleIcon />, 
        path: '/desktop/users',
        badge: users.length > 0 ? users.length : undefined
      });
    }

    // Adicionar Configurações
    baseItems.push({
      text: 'Configurações', 
      icon: <SettingsIcon />, 
      path: user?.role === 'ADMIN' ? '/desktop/settings' : '/desktop/profile'
    });

    return baseItems;
  };

  const navItems = getNavItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    AuthService.logout();
    router.push('/desktop/login');
    handleMenuClose();
  };

  const handleProfile = () => {
    router.push('/desktop/profile');
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
                  color={pathname === item.path ? "primary" : "default"}
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
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'secondary.main',
                  fontSize: '0.875rem'
                }}
              >
                {user.nome.charAt(0)}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
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

      {/* User Menu */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user.nome}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.email}
          </Typography>
          <Box mt={0.5}>
            <Chip 
              label={user.role === 'ADMIN' ? 'Administrador' : 'Usuário'} 
              size="small" 
              color={user.role === 'ADMIN' ? 'primary' : 'default'}
            />
          </Box>
        </Box>
        
        <MenuItem onClick={handleProfile}>
          <PersonIcon sx={{ mr: 2 }} />
          Meu Perfil
        </MenuItem>
        
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2 }} />
          Sair
        </MenuItem>
      </Menu>
    </Box>
  );
};