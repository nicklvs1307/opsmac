import RewardFormDialog from '../components/RewardFormDialog';
import { usePermissions } from '../../hooks/usePermissions';

const RewardsPage = () => {
  const { can } = usePermissions();
  const { user } = useAuth();
  const restaurantId = user?.restaurants?.[0]?.id;
  const [tabValue, setTabValue] = useState(0);

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

  const methods = useForm({
    defaultValues: {
      title: '',
      description: '',
      reward_type: 'discount_percentage',
      value: '',
      points_required: '',
      max_uses: '',
      expires_at: '',
      status: 'active',
      coupon_validity_days: '',
      wheel_config: { items: [] },
    },
  });

  const { control, handleSubmit, reset, watch, formState: { errors } } = methods;

  const [page, setPage] = useState(1);

  const { data: rewards, isLoading: isLoadingRewards, isError: isErrorRewards, error: rewardsError } = useRewards(restaurantId, page, filters, {
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao carregar recompensas.');
    },
  });

  const { data: analytics, isLoading: isLoadingAnalytics, isError: isErrorAnalytics, error: analyticsError } = useRewardsAnalytics({
    enabled: tabValue === 1,
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao carregar analytics.');
    },
  });

  const { data: selectedRewardAnalytics, isLoading: isLoadingSelectedRewardAnalytics, isError: isErrorSelectedRewardAnalytics, error: selectedRewardAnalyticsError } = useSelectedRewardAnalytics(selectedItem?.id, {
    enabled: detailsModalOpen && detailsModalTab === 1 && !!selectedItem?.id,
    onError: (error) => {
      toast.error(error.response?.data?.msg || 'Erro ao carregar analytics da recompensa.');
    },
  });

  const createMutation = useCreateReward({
    onSuccess: () => {
      setCreateDialog(false);
      setDetailsModalOpen(false);
    },
  });

  const updateMutation = useUpdateReward({
    onSuccess: () => {
      setCreateDialog(false);
      setDetailsModalOpen(false);
    },
  });

  const deleteMutation = useDeleteReward({
    onSuccess: () => {
      setDeleteDialog(false);
    },
  });

  useEffect(() => {
  }, [tabValue, page, filters]);

  useEffect(() => {
  }, [detailsModalOpen, detailsModalTab, selectedItem?.id]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handleCreate = () => {
    reset();
    setCreateDialog(true);
  };

  const handleCardClick = (reward) => {
    setSelectedItem(reward);
    reset(reward);
    setDetailsModalTab(0);
    setDetailsModalOpen(true);
  };

  const onSubmit = async (data) => {
    const cleanData = { ...data };

    cleanData.value = cleanData.value !== '' ? parseFloat(cleanData.value) : null;
    cleanData.points_required = cleanData.points_required !== '' ? parseInt(cleanData.points_required) : null;
    cleanData.max_uses_per_customer = cleanData.max_uses !== '' ? parseInt(cleanData.max_uses) : null;
    cleanData.coupon_validity_days = cleanData.coupon_validity_days !== '' ? parseInt(cleanData.coupon_validity_days) : null;
    cleanData.valid_until = cleanData.expires_at ? new Date(cleanData.expires_at) : null;

    delete cleanData.max_uses;
    delete cleanData.expires_at;

    if (cleanData.reward_type !== 'spin_the_wheel') {
      delete cleanData.wheel_config;
    } else {
      if (cleanData.wheel_config && cleanData.wheel_config.items) {
        cleanData.wheel_config.items = cleanData.wheel_config.items.map((item) => ({
          ...item,
          probability: parseFloat(item.probability),
        }));
      }
    }

    if (detailsModalOpen && detailsModalTab === 0) {
      updateMutation.mutate({ id: selectedItem.id, ...cleanData });
    } else {
      createMutation.mutate({ ...cleanData, restaurant_id: restaurantId });
    }
  };

  const confirmDelete = async () => {
    deleteMutation.mutate(selectedItem.id);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'discount_percentage': return 'primary';
      case 'discount_fixed': return 'primary';
      case 'free_item': return 'success';
      case 'points_multiplier': return 'warning';
      case 'cashback': return 'info';
      case 'spin_the_wheel': return 'secondary';
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
      case 'spin_the_wheel': return 'Roleta de Prêmios';
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
      <RewardFilters filters={filters} onFilterChange={handleFilterChange} />

      <Grid container spacing={3}>
        {rewards?.rewards?.map((reward) => (
          <Grid item xs={12} sm={6} md={4} key={reward.id}>
            <RewardCard 
              reward={reward} 
              onClick={handleCardClick} 
              getTypeLabel={getTypeLabel} 
              getStatusLabel={getStatusLabel} 
              getTypeColor={getTypeColor} 
              getStatusColor={getStatusColor} 
            />
          </Grid>
        ))}
      </Grid>

      {rewards?.rewards?.length === 0 && !isLoadingRewards && (
        <Box textAlign="center" py={4}>
          <EmojiEventsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma recompensa encontrada
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
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
              <Typography variant="h4" color="primary">{analytics.total_rewards}</Typography>
              <Typography variant="body2">Total de Recompensas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{analytics.active_rewards}</Typography>
              <Typography variant="body2">Recompensas Ativas</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{analytics.total_coupons}</Typography>
              <Typography variant="body2">Cupons Gerados</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{analytics.redeemed_coupons}</Typography>
              <Typography variant="body2">Cupons Resgatados</Typography>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );

  if (!can('fidelity:coupons:rewards', 'read')) { // Assumindo permissão para acessar recompensas
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">
          {t('common.module_not_enabled', { moduleName: t('modules.rewards') })}
        </Alert>
      </Box>
    );
  }

  if (isLoadingRewards || isLoadingAnalytics || isLoadingSelectedRewardAnalytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (isErrorRewards || isErrorAnalytics || isErrorSelectedRewardAnalytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error">Erro ao carregar dados.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">Sistema de Recompensas</Typography>
        {tabValue === 0 && (
          {can('fidelity:coupons:rewards', 'create') && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Nova Recompensa
            </Button>
          )}
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} indicatorColor="primary" textColor="primary">
          <Tab label="Recompensas" icon={<StarIcon />} />
          <Tab label="Analytics" icon={<AnalyticsIcon />} />
        </Tabs>
      </Paper>

      {(rewardsError || analyticsError || selectedRewardAnalyticsError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {rewardsError?.message || analyticsError?.message || selectedRewardAnalyticsError?.message || 'Ocorreu um erro.'}
        </Alert>
      )}

      {tabValue === 0 && renderRewardsTab()}
      {tabValue === 1 && renderAnalyticsTab()}

      {rewards?.pagination?.total_pages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={rewards.pagination.total_pages} page={page} onChange={(e, value) => setPage(value)} color="primary" />
        </Box>
      )}

      <RewardFormDialog
        open={createDialog || detailsModalOpen}
        onClose={() => {
          setCreateDialog(false);
          setDetailsModalOpen(false);
          setSelectedItem(null);
          reset();
        }}
        onSubmit={handleSubmit(onSubmit)}
        isEditing={detailsModalOpen}
        control={control}
        errors={errors}
        watch={watch}
      />

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja excluir a recompensa "{selectedItem?.title}"? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          {can('fidelity:coupons:rewards', 'delete') && (
            <Button onClick={confirmDelete} color="error" variant="contained">Excluir</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RewardsPage;
