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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Sports as SportsIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { useCourt, useCourts } from '@/hooks/useCourts';
import type { CreateCourtRequest, UpdateCourtRequest } from '@/types/court';

interface CourtForm {
  nome: string;
  tipo: string;
  localizacao: string;
}

interface Props {
  mode?: 'create' | 'edit';
}

export const DesktopNewCourtView = ({ mode = 'create' }: Props = {}) => {
  const router = useRouter();
  const params = useParams();
  
  // Para modo edição, pegar ID dos params
  const courtId = mode === 'edit' ? (params.id as string) : null;
  
  // Hooks
  const { createCourt, updateCourt, error: crudError, clearError } = useCourts();
  const { court, isLoading: isLoadingCourt, error: loadError } = useCourt(courtId || '');
  
  const [form, setForm] = useState<CourtForm>({
    nome: '',
    tipo: '',
    localizacao: '',
  });

  const [errors, setErrors] = useState<Partial<CourtForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const isEditMode = mode === 'edit';
  const isLoading = isEditMode ? isLoadingCourt : false;

  const tiposQuadra = [
    'Futebol',
    'Futsal',
    'Basquete',
    'Tênis',
    'Vôlei',
    'Vôlei de Praia',
    'Poliesportiva',
  ];

  // Carregar dados da quadra no formulário (modo edição)
  useEffect(() => {
    console.log('🔍 Effect - Mode:', mode, 'Court ID:', courtId, 'Court data:', court);
    
    if (isEditMode && court && !isDataLoaded) {
      console.log('✅ Carregando dados da quadra no formulário:', court);
      
      setForm({
        nome: court.nome || '',
        tipo: court.tipo || '',
        localizacao: court.localizacao || '',
      });
      
      setIsDataLoaded(true);
      console.log('✅ Dados carregados no formulário');
    }
  }, [isEditMode, court, isDataLoaded]);

  // Debug effect para monitorar mudanças
  useEffect(() => {
    console.log('🔍 Debug - Form state:', form);
    console.log('🔍 Debug - Is loading:', isLoading);
    console.log('🔍 Debug - Court data:', court);
    console.log('🔍 Debug - Data loaded:', isDataLoaded);
  }, [form, isLoading, court, isDataLoaded]);

  const handleInputChange = (field: keyof CourtForm, value: string) => {
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
    const newErrors: Partial<CourtForm> = {};

    if (!form.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (form.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres';
    }

    if (!form.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!form.localizacao.trim()) {
      newErrors.localizacao = 'Localização é obrigatória';
    } else if (form.localizacao.trim().length < 3) {
      newErrors.localizacao = 'Localização deve ter pelo menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode && courtId) {
        // Modo edição
        const updateData: UpdateCourtRequest = {
          nome: form.nome.trim(),
          tipo: form.tipo,
          localizacao: form.localizacao.trim(),
        };

        console.log('🔍 Atualizando quadra:', courtId, updateData);
        const success = await updateCourt(courtId, updateData);
        
        if (success) {
          console.log('✅ Quadra atualizada com sucesso');
          router.push('/desktop/courts?updated=true');
        }
      } else {
        // Modo criação
        const courtData: CreateCourtRequest = {
          nome: form.nome.trim(),
          tipo: form.tipo,
          localizacao: form.localizacao.trim(),
        };

        console.log('🔍 Criando nova quadra:', courtData);
        const newCourt = await createCourt(courtData);
        
        if (newCourt) {
          console.log('✅ Quadra criada com sucesso');
          router.push('/desktop/courts?created=true');
        }
      }
    } catch (err) {
      console.error(`❌ Erro ao ${isEditMode ? 'atualizar' : 'criar'} quadra:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (isEditMode && court) {
      // Modo edição: voltar aos valores originais
      setForm({
        nome: court.nome || '',
        tipo: court.tipo || '',
        localizacao: court.localizacao || '',
      });
    } else {
      // Modo criação: limpar formulário
      setForm({
        nome: '',
        tipo: '',
        localizacao: '',
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
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Skeleton variant="text" width={250} height={28} />
                <Stack spacing={3} sx={{ mt: 3 }}>
                  <Skeleton variant="rectangular" width="100%" height={56} />
                  <Skeleton variant="rectangular" width="100%" height={56} />
                  <Skeleton variant="rectangular" width="100%" height={56} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Erro ao carregar quadra (modo edição)
  if (isEditMode && loadError) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          Erro ao carregar dados da quadra: {loadError}
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
  if (isEditMode && courtId && !court && !loadError) {
    return (
      <Container maxWidth="md">
        <Box display="flex" flex-direction="column" alignItems="center" justifyContent="center" minHeight="50vh" gap={2}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Carregando dados da quadra...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
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
            {isEditMode ? 'Editar Quadra' : 'Nova Quadra'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isEditMode 
              ? `Atualize as informações da quadra esportiva${court ? ` "${court.nome}"` : ''}`
              : 'Cadastre uma nova quadra esportiva no sistema'
            }
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
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditMode ? <EditIcon color="primary" /> : <SportsIcon color="primary" />}
                {isEditMode ? 'Editar Informações' : 'Informações da Quadra'}
              </Typography>

              <Stack spacing={3} sx={{ mt: 3 }}>
                {/* Nome */}
                <TextField
                  label="Nome da Quadra *"
                  value={form.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  error={!!errors.nome}
                  helperText={errors.nome || 'Ex: Quadra Central, Arena Principal'}
                  fullWidth
                  placeholder="Digite o nome da quadra"
                />

                {/* Tipo */}
                <FormControl fullWidth error={!!errors.tipo}>
                  <InputLabel>Tipo de Esporte *</InputLabel>
                  <Select
                    value={form.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    label="Tipo de Esporte *"
                  >
                    {tiposQuadra.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.tipo && <FormHelperText>{errors.tipo}</FormHelperText>}
                </FormControl>

                {/* Localização */}
                <TextField
                  label="Localização *"
                  value={form.localizacao}
                  onChange={(e) => handleInputChange('localizacao', e.target.value)}
                  error={!!errors.localizacao}
                  helperText={errors.localizacao || 'Ex: Centro, Zona Norte, Prédio A'}
                  fullWidth
                  placeholder="Digite a localização da quadra"
                />

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
                      : (isEditMode ? 'Salvar Alterações' : 'Criar Quadra')
                    }
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Preview Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Preview */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SportsIcon color="primary" />
                  {isEditMode ? 'Dados Atuais' : 'Preview'}
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Nome
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {form.nome || 'Nome da quadra'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tipo
                    </Typography>
                    <Typography variant="body1">
                      {form.tipo || 'Tipo de esporte'}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Localização
                    </Typography>
                    <Typography variant="body1">
                      {form.localizacao || 'Localização'}
                    </Typography>
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
                <li>Use nomes descritivos e únicos</li>
                <li>A localização ajuda na identificação</li>
                <li>Todos os campos são obrigatórios</li>
                {isEditMode && <li>As alterações serão salvas imediatamente</li>}
              </Typography>
            </Alert>

            {/* Status Info */}
            <Alert severity={isEditMode ? "warning" : "success"}>
              <Typography variant="body2">
                <strong>{isEditMode ? 'Atenção:' : 'Após criar:'}</strong>{' '}
                {isEditMode 
                  ? 'As alterações afetarão todas as reservas futuras desta quadra.'
                  : 'A quadra ficará disponível para reservas automaticamente.'
                }
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};