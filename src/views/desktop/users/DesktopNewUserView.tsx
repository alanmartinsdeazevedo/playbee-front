'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  Grid,
  Button,
  TextField,
  MenuItem,
  Paper,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Skeleton,
  CircularProgress,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useUser, useUsers } from '@/hooks/useUsers';
import { AuthService } from '@/lib/auth';
import type { CreateUserRequest, UpdateUserRequest } from '@/hooks/useUsers';

interface UserForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  role: string;
}

interface Props {
  mode?: 'create' | 'edit';
}

export const DesktopNewUserView = ({ mode = 'create' }: Props = {}) => {
  const router = useRouter();
  const params = useParams();
  
  // Para modo edição, pegar ID dos params
  const userId = mode === 'edit' ? (params.id as string) : null;
  
  // Hooks
  const { createUser, updateUser, error: crudError, clearError } = useUsers();
  const { user, isLoading: isLoadingUser, error: loadError } = useUser(userId || '');
  
  const [form, setForm] = useState<UserForm>({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    role: 'USER',
  });

  const [errors, setErrors] = useState<Partial<UserForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEditMode = mode === 'edit';
  const isLoading = isEditMode ? isLoadingUser : false;

  // ✅ NOVO: Verificar se o usuário logado pode editar roles
  const currentUser = AuthService.getUser();
  const canEditRole = () => {
    if (!isEditMode) return true; // Modo criação: sempre pode definir role
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true; // Admin pode editar qualquer role
    if (currentUser.id === userId) return false; // Usuário não pode editar própria role
    return true; // Admin editando outro usuário
  };

  // ✅ NOVO: Verificar se está editando o próprio perfil
  const isEditingOwnProfile = isEditMode && currentUser && currentUser.id === userId;

  const roles = [
    { value: 'USER', label: 'Usuário', description: 'Acesso básico ao sistema' },
    { value: 'ADMIN', label: 'Administrador', description: 'Acesso completo ao sistema' },
  ];

  // Carregar dados do usuário no formulário (modo edição)
  useEffect(() => {
    console.log('🔍 Effect - Mode:', mode, 'User ID:', userId, 'User data:', user);
    
    if (isEditMode && user && !isDataLoaded) {
      console.log('✅ Carregando dados do usuário no formulário:', user);
      
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        senha: '',
        confirmarSenha: '',
        telefone: user.telefone || '',
        role: user.role || 'USER',
      });
      
      setIsDataLoaded(true);
      console.log('✅ Dados carregados no formulário');
    }
  }, [isEditMode, user, isDataLoaded]);

  const handleInputChange = (field: keyof UserForm, value: string) => {
    console.log('🔍 Input change:', field, '=', value);
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear API error
    if (crudError) {
      clearError();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<UserForm> = {};

    if (!form.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (form.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!form.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'E-mail deve ser válido';
    }

    // Validação de senha apenas no modo criação ou se preenchida no modo edição
    if (!isEditMode || form.senha) {
      if (!form.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (form.senha.length < 6) {
        newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (form.senha !== form.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
    }

    if (!form.role) {
      newErrors.role = 'Função é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode && userId) {
        // Modo edição
        const updateData: UpdateUserRequest = {
          nome: form.nome.trim(),
          email: form.email.trim(),
          telefone: form.telefone.trim() || undefined,
          // ✅ NOVO: Só incluir role se o usuário pode editá-la
          ...(canEditRole() && { role: form.role }),
        };

        console.log('🔍 Atualizando usuário:', userId, updateData);
        const success = await updateUser(userId, updateData);
        
        if (success) {
          console.log('✅ Usuário atualizado com sucesso');
          
          // ✅ NOVO: Se atualizou próprio perfil, atualizar dados locais
          if (isEditingOwnProfile) {
            const updatedUser = { 
              ...currentUser, 
              ...updateData,
              role: updateData.role as 'USER' | 'ADMIN' // ✅ Type assertion para corrigir o tipo
            };
            AuthService.setUser(updatedUser);
          }
          
          router.push('/desktop/users?updated=true');
        }
      } else {
        // Modo criação
        const userData: CreateUserRequest = {
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          telefone: form.telefone.trim() || undefined,
          role: form.role,
        };

        console.log('🔍 Criando novo usuário:', userData.email);
        const newUser = await createUser(userData);
        
        if (newUser) {
          console.log('✅ Usuário criado com sucesso');
          router.push('/desktop/users?created=true');
        }
      }
    } catch (err) {
      console.error(`❌ Erro ao ${isEditMode ? 'atualizar' : 'criar'} usuário:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditMode && user) {
      // Modo edição: voltar aos valores originais
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        senha: '',
        confirmarSenha: '',
        telefone: user.telefone || '',
        role: user.role || 'USER',
      });
    } else {
      // Modo criação: limpar formulário
      setForm({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        telefone: '',
        role: 'USER',
      });
    }
    setErrors({});
    clearError();
  };

  // Loading skeleton para modo edição
  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <Skeleton variant="rectangular" width={100} height={40} />
          <Box>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="text" width={300} height={20} />
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid size={{xs:12, md:8}}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Skeleton variant="text" width={250} height={28} />
                <Stack spacing={3} sx={{ mt: 3 }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} variant="rectangular" width="100%" height={56} />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Erro ao carregar usuário (modo edição)
  if (isEditMode && loadError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Erro ao carregar dados do usuário: {loadError}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          Voltar
        </Button>
      </Container>
    );
  }

  // Se está em modo edição mas ainda não carregou os dados, mostrar loading
  if (isEditMode && userId && !user && !loadError) {
    return (
      <Container maxWidth="md">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="50vh" gap={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Carregando dados do usuário...
          </Typography>
        </Box>
      </Container>
    );
  }

  const selectedRole = roles.find(r => r.value === form.role);

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          variant="outlined"
        >
          Voltar
        </Button>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            {isEditMode ? 'Editar Usuário' : 'Novo Usuário'}
          </Typography>
        </Box>
      </Box>

      {/* API Error */}
      {crudError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={clearError}
        >
          {crudError}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Form */}
        <Grid size={{ xs:12, md:8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditMode ? <EditIcon color="primary" /> : <PersonIcon color="primary" />}
                {isEditMode ? 'Editar Informações' : 'Informações do Usuário'}
              </Typography>

              <Stack spacing={3} sx={{ mt: 3 }}>
                {/* Nome */}
                <TextField
                  label="Nome Completo *"
                  value={form.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  error={!!errors.nome}
                  helperText={errors.nome || 'Ex: João Silva Santos'}
                  fullWidth
                  placeholder="Digite o nome completo"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Email */}
                <TextField
                  label="E-mail *"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!errors.email}
                  helperText={errors.email || 'Ex: joao@exemplo.com'}
                  fullWidth
                  placeholder="Digite o e-mail"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Telefone */}
                <TextField
                  label="Telefone"
                  value={form.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  error={!!errors.telefone}
                  helperText={errors.telefone || 'Ex: (84) 99999-9999 (opcional)'}
                  fullWidth
                  placeholder="Digite o telefone"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Função - ✅ NOVO: Condicional baseada em permissões */}
                {canEditRole() && (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Função *</InputLabel>
                    <Select
                      value={form.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      label="Função *"
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          <Box display="flex" alignItems="center" gap={2}>
                            {role.value === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                            <Box>
                              <Typography variant="body1">{role.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {role.description}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                  </FormControl>
                )}

                {/* Senhas */}
                {(!isEditMode || form.senha) && (
                  <>
                    <TextField
                      label={isEditMode ? "Nova Senha (deixe vazio para manter)" : "Senha *"}
                      type={showPassword ? 'text' : 'password'}
                      value={form.senha}
                      onChange={(e) => handleInputChange('senha', e.target.value)}
                      error={!!errors.senha}
                      helperText={errors.senha || 'Mínimo 6 caracteres'}
                      fullWidth
                      placeholder="Digite a senha"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      label={isEditMode ? "Confirmar Nova Senha" : "Confirmar Senha *"}
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmarSenha}
                      onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                      error={!!errors.confirmarSenha}
                      helperText={errors.confirmarSenha || 'Digite a senha novamente'}
                      fullWidth
                      placeholder="Confirme a senha"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}

                {/* Actions */}
                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    {isEditMode ? 'Resetar' : 'Limpar'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isEditMode ? <SaveIcon /> : <AddIcon />}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="large"
                  >
                    {isSubmitting 
                      ? (isEditMode ? 'Salvando...' : 'Criando...') 
                      : (isEditMode ? 'Salvar Alterações' : 'Criar Usuário')
                    }
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Sidebar */}
        <Grid size={{ xs:12, md:4 }}>
          <Stack spacing={3}>
            {/* Preview */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  {isEditMode ? 'Dados Atuais' : 'Preview'}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                    {form.nome.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {form.nome || 'Nome do usuário'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {form.email || 'email@exemplo.com'}
                    </Typography>
                  </Box>
                </Box>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Telefone
                    </Typography>
                    <Typography variant="body1">
                      {form.telefone || 'Não informado'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Função
                    </Typography>
                    <Box mt={0.5}>
                      <Chip 
                        label={selectedRole?.label || 'Usuário'}
                        size="small"
                        color={form.role === 'ADMIN' ? 'error' : 'primary'}
                        icon={form.role === 'ADMIN' ? <AdminIcon /> : <PersonIcon />}
                      />
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Dicas:</strong>
              </Typography>
              <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>Use um e-mail válido e único</li>
                <li>Senhas devem ter pelo menos 6 caracteres</li>
                <li>Administradores têm acesso total ao sistema</li>
                {isEditMode && <li>Deixe a senha vazia para manter a atual</li>}
                {isEditingOwnProfile && <li>Você não pode alterar sua própria função</li>}
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};