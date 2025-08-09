import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, TextField, Button, CircularProgress, 
  Select, MenuItem, FormControl, InputLabel, Grid, FormHelperText, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox 
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../../api/axiosInstance';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// Esquemas de Validação
const userSchema = (t) => yup.object().shape({
  name: yup.string().min(2, t('admin_dashboard.name_min_chars')).required(t('admin_dashboard.name_required')),
  email: yup.string().email(t('admin_dashboard.email_invalid')).required(t('admin_dashboard.email_required')),
  password: yup.string().min(6, t('admin_dashboard.password_min_chars')).required(t('admin_dashboard.password_required')),
  phone: yup.string().optional(),
  role: yup.string().oneOf(['owner', 'admin', 'employee'], t('admin_dashboard.role_invalid')).required(t('admin_dashboard.role_required')),
});

const restaurantSchema = (t) => yup.object().shape({
  name: yup.string().required(t('admin_dashboard.restaurant_name_required')),
  owner_id: yup.string().uuid(t('admin_dashboard.owner_id_invalid')).required(t('admin_dashboard.owner_id_required')),
  enabled_modules: yup.array().of(yup.string()).optional(),
});

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  
  // Estados para criação
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);

  // Estados para listagem
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

  // Estados para o modal de módulos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);
  const [savingModules, setSavingModules] = useState(false);

  const availableModules = [
    'customer_segmentation', 'ifood_integration', 'google_my_business_integration',
    'saipos_integration', 'uai_rango_integration', 'delivery_much_integration',
    'checkin_program', 'surveys_feedback', 'coupons_rewards', 'whatsapp_messaging'
  ];

  // Formulário de criação de usuário
  const { control: userControl, handleSubmit: handleUserSubmit, reset: resetUserForm, formState: { errors: userErrors } } = useForm({
    resolver: yupResolver(userSchema(t)),
    defaultValues: { name: '', email: '', password: '', phone: '', role: 'owner' },
  });

  // Formulário de criação de restaurante
  const { control: restaurantControl, handleSubmit: handleRestaurantSubmit, reset: resetRestaurantForm, formState: { errors: restaurantErrors } } = useForm({
    resolver: yupResolver(restaurantSchema(t)),
    defaultValues: { name: '', owner_id: '', enabled_modules: [] },
  });

  // Funções de busca de dados
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axiosInstance.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error(t('admin_dashboard.error_loading_users_description'));
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRestaurants = async () => {
    setLoadingRestaurants(true);
    try {
      const response = await axiosInstance.get('/api/admin/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      toast.error(t('admin_dashboard.error_loading_restaurants_description'));
    } finally {
      setLoadingRestaurants(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (tabValue === 2) {
      fetchUsers();
    }
    if (tabValue === 3) {
      fetchRestaurants();
    }
  }, [tabValue]);

  // Funções de Ação
  const handleCreateUser = async (data) => {
    setCreatingUser(true);
    try {
      await axiosInstance.post('/api/admin/users', data);
      toast.success(t('admin_dashboard.user_created_title'));
      resetUserForm();
      fetchUsers(); // Atualiza a lista
    } catch (error) {
      toast.error(error.response?.data?.error || t('admin_dashboard.error_creating_user_description'));
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateRestaurant = async (data) => {
    setCreatingRestaurant(true);
    try {
      await axiosInstance.post('/api/admin/restaurants', data);
      toast.success(t('admin_dashboard.restaurant_created_title'));
      resetRestaurantForm();
      fetchRestaurants(); // Atualiza a lista
    } catch (error) {
      toast.error(error.response?.data?.error || t('admin_dashboard.error_creating_restaurant_description'));
    } finally {
      setCreatingRestaurant(false);
    }
  };

  const handleOpenModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedModules(restaurant.settings?.enabled_modules || []);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRestaurant(null);
    setSelectedModules([]);
  };

  const handleModuleChange = (event) => {
    const { name, checked } = event.target;
    setSelectedModules(prev => 
      checked ? [...prev, name] : prev.filter(m => m !== name)
    );
  };

  const handleSaveModules = async () => {
    if (!selectedRestaurant) return;
    setSavingModules(true);
    try {
      await axiosInstance.put(`/api/admin/restaurants/${selectedRestaurant.id}/modules`, {
        enabled_modules: selectedModules,
      });
      toast.success(t('admin_dashboard.modules_updated_success'));
      fetchRestaurants(); // Atualiza a lista de restaurantes
      handleCloseModal();
    } catch (error) {
      toast.error(t('admin_dashboard.modules_updated_error'));
    } finally {
      setSavingModules(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Renderização das Abas
  const renderCreateUserTab = () => (
    <Box component="form" onSubmit={handleUserSubmit(handleCreateUser)} sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={userControl}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.name_label')}
                fullWidth
                margin="normal"
                error={!!userErrors.name}
                helperText={userErrors.name ? userErrors.name.message : ''}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="email"
            control={userControl}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.email_label')}
                fullWidth
                margin="normal"
                type="email"
                error={!!userErrors.email}
                helperText={userErrors.email ? userErrors.email.message : ''}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="password"
            control={userControl}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.password_label')}
                fullWidth
                margin="normal"
                type="password"
                error={!!userErrors.password}
                helperText={userErrors.password ? userErrors.password.message : ''}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="phone"
            control={userControl}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.user_phone_label')}
                fullWidth
                margin="normal"
                error={!!userErrors.phone}
                helperText={userErrors.phone ? userErrors.phone.message : ''}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="role"
            control={userControl}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!userErrors.role}>
                <InputLabel>{t('admin_dashboard.role_label')}</InputLabel>
                <Select
                  {...field}
                  label={t('admin_dashboard.role_label')}
                >
                  <MenuItem value="owner">{t('admin_dashboard.role_owner')}</MenuItem>
                  <MenuItem value="admin">{t('admin_dashboard.role_admin')}</MenuItem>
                  <MenuItem value="employee">{t('admin_dashboard.role_employee')}</MenuItem>
                </Select>
                {userErrors.role && <FormHelperText>{userErrors.role.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }} disabled={creatingUser}>
        {creatingUser ? <CircularProgress size={24} /> : t('admin_dashboard.create_user_button')}
      </Button>
    </Box>
  );

  const renderCreateRestaurantTab = () => (
    <Box component="form" onSubmit={handleRestaurantSubmit(handleCreateRestaurant)} sx={{ mt: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="name"
            control={restaurantControl}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('admin_dashboard.restaurant_name_label')}
                fullWidth
                margin="normal"
                error={!!restaurantErrors.name}
                helperText={restaurantErrors.name ? restaurantErrors.name.message : ''}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="owner_id"
            control={restaurantControl}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!restaurantErrors.owner_id}>
                <InputLabel>{t('admin_dashboard.owner_label')}</InputLabel>
                <Select
                  {...field}
                  label={t('admin_dashboard.owner_label')}
                  defaultValue=""
                >
                  <MenuItem value="">{t('admin_dashboard.select_owner_placeholder')}</MenuItem>
                  {loadingUsers ? (
                    <MenuItem disabled><CircularProgress size={20} /></MenuItem>
                  ) : (
                    users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))
                  )}
                </Select>
                {restaurantErrors.owner_id && <FormHelperText>{restaurantErrors.owner_id.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="enabled_modules"
            control={restaurantControl}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!restaurantErrors.enabled_modules}>
                <InputLabel>{t('admin_dashboard.enabled_modules_label')}</InputLabel>
                <Select
                  {...field}
                  label={t('admin_dashboard.enabled_modules_label')}
                  multiple
                  value={field.value || []} // Garante que o valor seja um array
                  renderValue={(selected) => selected.join(', ')}
                >
                  {availableModules.map(moduleName => (
                    <MenuItem key={moduleName} value={moduleName}>{t(`modules.${moduleName}`)}</MenuItem>
                  ))}
                </Select>
                {restaurantErrors.enabled_modules && <FormHelperText>{restaurantErrors.enabled_modules.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }} disabled={creatingRestaurant}>
        {creatingRestaurant ? <CircularProgress size={24} /> : t('admin_dashboard.create_restaurant_button')}
      </Button>
    </Box>
  );

  const renderUsersListTab = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('admin_dashboard.list_header_name')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_email')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_role')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loadingUsers ? (
            <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow>
          ) : (
            users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderRestaurantsListTab = () => (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('admin_dashboard.list_header_restaurant')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_owner')}</TableCell>
            <TableCell>{t('admin_dashboard.list_header_modules')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loadingRestaurants ? (
            <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow>
          ) : (
            restaurants.map(restaurant => (
              <TableRow key={restaurant.id} hover onClick={() => handleOpenModal(restaurant)} sx={{ cursor: 'pointer' }}>
                <TableCell>{restaurant.name}</TableCell>
                <TableCell>{restaurant.owner?.name || 'N/A'}</TableCell>
                <TableCell>{(restaurant.settings?.enabled_modules || []).join(', ')}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>{t('admin_dashboard.title')}</Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Admin Tabs" variant="scrollable" scrollButtons="auto">
          <Tab label={t('admin_dashboard.create_user_tab')} />
          <Tab label={t('admin_dashboard.create_restaurant_tab')} />
          <Tab label={t('admin_dashboard.list_users_tab')} />
          <Tab label={t('admin_dashboard.list_restaurants_tab')} />
        </Tabs>
      </Paper>

      {tabValue === 0 && renderCreateUserTab()}
      {tabValue === 1 && renderCreateRestaurantTab()}
      {tabValue === 2 && renderUsersListTab()}
      {tabValue === 3 && renderRestaurantsListTab()}

      {/* Modal de Gerenciamento de Módulos */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>{t('admin_dashboard.manage_modules_for', { name: selectedRestaurant?.name })}</DialogTitle>
        <DialogContent>
          <FormGroup>
            {availableModules.map(moduleName => (
              <FormControlLabel 
                key={moduleName} 
                control={<Checkbox checked={selectedModules.includes(moduleName)} onChange={handleModuleChange} name={moduleName} />} 
                label={t(`modules.${moduleName}`)} 
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveModules} variant="contained" disabled={savingModules}>
            {savingModules ? <CircularProgress size={24} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
