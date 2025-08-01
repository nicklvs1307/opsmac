import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Pagination,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  CardGiftcard as RewardIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Analytics as AnalyticsIcon,
  Search as SearchIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import SpinTheWheel from '../../components/UI/SpinTheWheel';

const Rewards = () => {
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const [tabValue, setTabValue] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [analytics, setAnalytics] = useState(null); // For main analytics tab
  const [selectedRewardAnalytics, setSelectedRewardAnalytics] = useState(null); // For selected reward's analytics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
  });
  
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsModalTab, setDetailsModalTab] = useState(0); // 0 for config, 1 for analytics

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      reward_type: 'discount_percentage',
      value: '',
      points_required: '',
      max_uses: '',
      expires_at: '',
      status: 'active',
      wheel_config: { items: [] }, // Adicionado
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'wheel_config.items',
  });

  useEffect(() => {
    if (tabValue === 0) {
      fetchRewards();
    } else if (tabValue === 1) {
      fetchAnalytics();
    }
  }, [tabValue, page, filters]);

  useEffect(() => {
    if (detailsModalOpen && detailsModalTab === 1 && selectedItem?.id) {
      fetchSelectedRewardAnalytics(selectedItem.id);
    }
  }, [detailsModalOpen, detailsModalTab, selectedItem?.id]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit: 12,
        ...filters,
      };
      
      const response = await axiosInstance.get(`/api/rewards/restaurant/${restaurantId}`, { params });
      
      setRewards(response.data.rewards);
      setTotalPages(response.data.pagination.total_pages);
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError('Erro ao carregar recompensas');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosInstance.get('/api/rewards/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Erro ao carregar analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedRewardAnalytics = async (rewardId) => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get(`/api/rewards/${rewardId}/analytics`);
      setSelectedRewardAnalytics(response.data);
    } catch (err) {
      console.error(`Error fetching analytics for reward ${rewardId}:`, err);
      setError('Erro ao carregar analytics da recompensa');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1);
  };

  

  const handleCreate = () => {
    reset();
    setCreateDialog(true);
  };

  const handleCardClick = (reward) => {
    setSelectedItem(reward);
    reset(reward); // Populate form with reward data
    setDetailsModalTab(0); // Default to config tab
    setDetailsModalOpen(true);
  };

  

  const handleDelete = () => {
    setDeleteDialog(true);
  };

  

  const onSubmit = async (data) => {
    try {
      const cleanData = { ...data };

      // Handle numerical fields, convert empty strings to null
      cleanData.value = cleanData.value !== '' ? parseFloat(cleanData.value) : null;
      cleanData.points_required = cleanData.points_required !== '' ? parseInt(cleanData.points_required) : null;
      cleanData.max_uses_per_customer = cleanData.max_uses !== '' ? parseInt(cleanData.max_uses) : null;
      cleanData.valid_until = cleanData.expires_at ? new Date(cleanData.expires_at) : null;

      delete cleanData.max_uses;
      delete cleanData.expires_at;

      // Ensure wheel_config is only sent if reward_type is spin_the_wheel
      if (cleanData.reward_type !== 'spin_the_wheel') {
        delete cleanData.wheel_config;
      } else {
        // Ensure wheel_config.items are properly formatted (e.g., probability as number)
        if (cleanData.wheel_config && cleanData.wheel_config.items) {
          cleanData.wheel_config.items = cleanData.wheel_config.items.map(item => ({
            ...item,
            probability: parseFloat(item.probability) // Ensure probability is a number
          }));
        }
      }

      if (detailsModalOpen && detailsModalTab === 0) {
        await axiosInstance.put(`/api/rewards/${selectedItem.id}`, cleanData);
        toast.success('Recompensa atualizada com sucesso!');
      } else {
        await axiosInstance.post('/api/rewards', { ...cleanData, restaurant_id: restaurantId });
        toast.success('Recompensa criada com sucesso!');
      }
      
      setCreateDialog(false);
      setDetailsModalOpen(false);
      fetchRewards();
    } catch (err) {
      console.error('Error saving reward:', err); // Log the full error for debugging
      toast.error(err.response?.data?.message || 'Erro ao salvar recompensa');
    }
  };

  

  

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/rewards/${selectedItem.id}`);
      
      toast.success('Recompensa excluída com sucesso!');
      setDeleteDialog(false);
      fetchRewards();
    } catch (err) {
      toast.error('Erro ao excluir recompensa');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'discount_percentage': return 'primary';
      case 'discount_fixed': return 'primary';
      case 'free_item': return 'success';
      case 'points_multiplier': return 'warning';
      case 'cashback': return 'info';
      case 'spin_the_wheel': return 'secondary'; // New color for wheel
      default: return 'default';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'discount_percentage': return 'Desconto (%)';
      case 'discount_fixed': return 'Desconto Fixo';
      case 'free_item': return 'Item Grátis';
      case 'points_multiplier': return 'Multiplicador de Pontos';
      case 'cashback': return 'Cashback';
      case 'spin_the_wheel': return 'Roleta de Prêmios'; // New label for wheel
      default: return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'expired': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'expired': return 'Expirado';
      case 'used': return 'Usado';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  const renderRewardsTab = () => (
    <Box>
      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filtros
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Buscar"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Nome ou descrição..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filters.type}
                label="Tipo"
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <SelectMenuItem value="">Todos</SelectMenuItem>
                <SelectMenuItem value="discount">Desconto</SelectMenuItem>
                <SelectMenuItem value="free_item">Item Grátis</SelectMenuItem>
                <SelectMenuItem value="points">Pontos</SelectMenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <SelectMenuItem value="">Todos</SelectMenuItem>
                <SelectMenuItem value="active">Ativo</SelectMenuItem>
                <SelectMenuItem value="inactive">Inativo</SelectMenuItem>
                <SelectMenuItem value="expired">Expirado</SelectMenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Rewards Grid */}
      <Grid container spacing={3}>
        {rewards.map((reward) => (
          <Grid item xs={12} sm={6} md={4} key={reward.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => handleCardClick(reward)}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <RewardIcon />
                  </Avatar>
                </Box>
                
                <Typography variant="h6" gutterBottom noWrap>
                  {reward.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {reward.description}
                </Typography>
                
                {reward.reward_type === 'spin_the_wheel' && reward.wheel_config?.items?.length > 0 && (
                  <Box sx={{ my: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Itens da Roleta:</Typography>
                    <SpinTheWheel items={reward.wheel_config.items} />
                  </Box>
                )}

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={getTypeLabel(reward.type)}
                    color={getTypeColor(reward.type)}
                    size="small"
                  />
                  <Chip
                    label={getStatusLabel(reward.status)}
                    color={getStatusColor(reward.status)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2">
                  <strong>Valor:</strong> {reward.value}%
                </Typography>
                <Typography variant="body2">
                  <strong>Pontos:</strong> {reward.points_required}
                </Typography>
                {reward.max_uses && (
                  <Typography variant="body2">
                    <strong>Usos máximos:</strong> {reward.max_uses}
                  </Typography>
                )}
                
                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                  Criado: {reward.created_at && !isNaN(new Date(reward.created_at)) ? format(new Date(reward.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'Data inválida'}
                </Typography>
              </CardContent>
              
              
            </Card>
          </Grid>
        ))}
      </Grid>

      {rewards.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <RewardIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma recompensa encontrada
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Criar Primeira Recompensa
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Grid container spacing={3}>
      {analytics && (
        <>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {analytics.total_rewards}
              </Typography>
              <Typography variant="body2">
                Total de Recompensas
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {analytics.active_rewards}
              </Typography>
              <Typography variant="body2">
                Recompensas Ativas
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {analytics.total_coupons}
              </Typography>
              <Typography variant="body2">
                Cupons Gerados
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {analytics.redeemed_coupons}
              </Typography>
              <Typography variant="body2">
                Cupons Resgatados
              </Typography>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );

  if (loading && rewards.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Sistema de Recompensas
        </Typography>
        {tabValue === 0 && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Nova Recompensa
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Recompensas" icon={<StarIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
        </Tabs>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tab Content */}
      {tabValue === 0 && renderRewardsTab()}
      {tabValue === 1 && renderAnalyticsTab()}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      

      {/* Create/Edit/Details Dialog */}
      <Dialog
        open={createDialog || detailsModalOpen}
        onClose={() => {
          setCreateDialog(false);
          setDetailsModalOpen(false);
          setSelectedItem(null); // Clear selected item when closing
          reset(); // Reset form when closing
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {createDialog ? 'Nova Recompensa' : 'Detalhes da Recompensa'}
        </DialogTitle>
        <DialogContent>
          {!createDialog && (
            <Tabs
              value={detailsModalTab}
              onChange={(e, newValue) => setDetailsModalTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              sx={{ mb: 2 }}
            >
              <Tab label="Configurações" />
              <Tab label="Análises" />
            </Tabs>
          )}

          {/* Configurações Tab Content */}
          {(createDialog || detailsModalTab === 0) && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: 'Nome é obrigatório' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="reward_type"
                  control={control}
                  rules={{ required: 'Tipo é obrigatório' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.type}>
                      <InputLabel>Tipo</InputLabel>
                      <Select {...field} label="Tipo">
                        <SelectMenuItem value="discount_percentage">Desconto (%)</SelectMenuItem>
                        <SelectMenuItem value="discount_fixed">Desconto Fixo</SelectMenuItem>
                        <SelectMenuItem value="free_item">Item Grátis</SelectMenuItem>
                        <SelectMenuItem value="points_multiplier">Multiplicador de Pontos</SelectMenuItem>
                        <SelectMenuItem value="cashback">Cashback</SelectMenuItem>
                        <SelectMenuItem value="spin_the_wheel">Roleta de Prêmios</SelectMenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              {watch('reward_type') === 'spin_the_wheel' && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Configuração da Roleta
                  </Typography>
                  <SpinTheWheel items={watch('wheel_config.items')} />
                  {fields.map((item, index) => (
                    <Paper key={item.id} sx={{ p: 2, mb: 2, border: '1px solid #eee' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name={`wheel_config.items.${index}.title`}
                            control={control}
                            rules={{ required: 'Título do item é obrigatório' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Título do Item"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Controller
                            name={`wheel_config.items.${index}.probability`}
                            control={control}
                            rules={{ required: 'Probabilidade é obrigatória', min: 0 }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Probabilidade"
                                type="number"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name={`wheel_config.items.${index}.color`}
                            control={control}
                            rules={{ required: 'Cor do segmento é obrigatória' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Cor do Segmento (Hex)"
                                fullWidth
                                placeholder="Ex: #FFD700"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Controller
                            name={`wheel_config.items.${index}.textColor`}
                            control={control}
                            rules={{ required: 'Cor do texto é obrigatória' }}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="Cor do Texto (Hex)"
                                fullWidth
                                placeholder="Ex: #FFFFFF"
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => remove(index)}
                            startIcon={<DeleteIcon />}
                          >
                            Remover
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => append({ title: '', probability: 0 })}
                  >
                    Adicionar Item à Roleta
                  </Button>
                </Grid>
              )}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Descrição"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
              </Grid>
              {watch('reward_type') !== 'spin_the_wheel' && (
                <Grid item xs={12} md={4}>
                  <Controller
                    name="value"
                    control={control}
                    rules={{ required: 'Valor é obrigatório' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Valor (%)"
                        type="number"
                        fullWidth
                        error={!!errors.value}
                        helperText={errors.value?.message}
                      />
                    )}
                  />
                </Grid>
              )}
              {watch('reward_type') !== 'spin_the_wheel' && (
                <Grid item xs={12} md={4}>
                  <Controller
                    name="points_required"
                    control={control}
                    rules={{ required: 'Pontos são obrigatórios' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Pontos Necessários"
                        type="number"
                        fullWidth
                        error={!!errors.points_required}
                        helperText={errors.points_required?.message}
                      />
                    )}
                  />
                </Grid>
              )}
              {watch('reward_type') !== 'spin_the_wheel' && (
                <Grid item xs={12} md={4}>
                  <Controller
                    name="max_uses"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Usos Máximos"
                        type="number"
                        fullWidth
                        helperText="Deixe em branco para ilimitado"
                      />
                    )}
                  />
                </Grid>
              )}
              {watch('reward_type') !== 'spin_the_wheel' && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="expires_at"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Data de Expiração"
                        type="datetime-local"
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    )}
                  />
                </Grid>
              )}
              <Grid item xs={12} md={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        <SelectMenuItem value="active">Ativo</SelectMenuItem>
                        <SelectMenuItem value="inactive">Inativo</SelectMenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          )}

          {/* Análises Tab Content */}
          {detailsModalTab === 1 && !createDialog && selectedItem && selectedRewardAnalytics && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Análises de Cupons
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {selectedRewardAnalytics.total_generated || 0}
                    </Typography>
                    <Typography variant="body2">Cupons Gerados</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="success">
                      {selectedRewardAnalytics.total_redeemed || 0}
                    </Typography>
                    <Typography variant="body2">Cupons Resgatados</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="info">
                      {(selectedRewardAnalytics.redemption_rate || 0).toFixed(2)}%
                    </Typography>
                    <Typography variant="body2">Taxa de Resgate</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h5" color="warning">
                      R$ {(selectedRewardAnalytics.average_order_value || 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body2">Valor Médio do Pedido</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    setDetailsModalOpen(false); // Close details modal first
                    setDeleteDialog(true); // Open delete confirmation
                  }}
                >
                  Excluir Recompensa
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCreateDialog(false);
              setDetailsModalOpen(false);
              setSelectedItem(null);
              reset();
            }}
          >
            Cancelar
          </Button>
          {detailsModalTab === 0 && ( // Only show Save button on Configurações tab
            <Button onClick={handleSubmit(onSubmit)} variant="contained">
              {createDialog ? 'Criar' : 'Atualizar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => { setDeleteDialog(false); }}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a recompensa "{selectedItem?.title}"? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rewards;
