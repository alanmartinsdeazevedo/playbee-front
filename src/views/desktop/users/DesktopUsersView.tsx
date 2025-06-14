'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Button,
  Avatar,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import type { User } from '@/types/auth';

export const DesktopUsersView = () => {
  const { users, isLoading, error, refreshUsers, deleteUser, clearError } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  // Filtrar usuários quando mudarem os filtros
  useEffect(() => {
    let filtered = users;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleRefresh = () => {
    clearError();
    refreshUsers();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.nome}"?`)) {
      return;
    }

    try {
      const success = await deleteUser(user.id);
      
      if (success) {
        console.log('✅ Usuário excluído com sucesso');
      }
    } catch (err) {
      console.error('❌ Erro ao excluir usuário:', err);
    }
    
    handleMenuClose();
  };

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'error';
      case 'USER':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleText = (role: string) => {
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'Administrador';
      case 'USER':
        return 'Usuário';
      default:
        return role;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'Data inválida';
    }
  };

  const totalUsers = filteredUsers.length;
  const adminUsers = filteredUsers.filter(u => u.role.toUpperCase() === 'ADMIN').length;
  const regularUsers = filteredUsers.filter(u => u.role.toUpperCase() === 'USER').length;

  // Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="xl">
        <Box mb={4}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        
        <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Skeleton variant="rounded" width={400} height={40} />
          </Stack>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {['Usuário', 'E-mail', 'Telefone', 'Função', 'Cadastro', 'Ações'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton variant="text" width={100} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((item) => (
                <TableRow key={item}>
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton variant="text" width={120} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gerenciar Usuários
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visualize e gerencie todos os usuários do sistema
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalUsers} usuários • {adminUsers} admins • {regularUsers} usuários
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Atualizar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => router.push('/desktop/users/new')}
          >
            Novo Usuário
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={4}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {totalUsers}
              </Typography>
              <Typography color="text.secondary">
                Total de Usuários
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <AdminIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {adminUsers}
              </Typography>
              <Typography color="text.secondary">
                Administradores
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {regularUsers}
              </Typography>
              <Typography color="text.secondary">
                Usuários Comuns
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          {/* Search */}
          <TextField
            placeholder="Buscar por nome, e-mail, telefone ou função..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 400 }}
            size="small"
          />
        </Stack>
      </Paper>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuário</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Data de Cadastro</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow 
                  key={user.id}
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                        {user.nome.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {user.nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.telefone || 'Não informado'}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={getRoleText(user.role)}
                      size="small"
                      color={getRoleColor(user.role) as any}
                      variant="filled"
                      icon={user.role.toUpperCase() === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.createdAt)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Tooltip title="Ver detalhes">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => router.push(`/desktop/users/${user.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          color="default"
                          onClick={() => router.push(`/desktop/users/${user.id}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Mais opções">
                        <IconButton 
                          size="small"
                          onClick={(e) => handleMenuClick(e, user)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum usuário encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {searchTerm 
              ? 'Tente ajustar os filtros ou criar um novo usuário'
              : 'Comece criando o primeiro usuário do sistema'
            }
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => router.push('/desktop/users/new')}
              sx={{ textTransform: 'none' }}
            >
              Criar Novo Usuário
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ textTransform: 'none' }}
            >
              Tentar Novamente
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { minWidth: 200 }
        }}
      >
        <MenuItem onClick={() => {
          if (selectedUser) {
            router.push(`/desktop/users/${selectedUser.id}`);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Ver Detalhes</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          if (selectedUser) {
            router.push(`/desktop/users/${selectedUser.id}/edit`);
          }
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar Usuário</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => {
            if (selectedUser) {
              handleDeleteUser(selectedUser);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir Usuário</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};