import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Tabs, Tab, TextField, Button, CircularProgress, Select, MenuItem, FormControl, InputLabel, Grid } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../../api/axiosInstance';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingRestaurant, setCreatingRestaurant] = useState(false);

  // Esquema de validação para o formulário de usuário
  const userSchema = yup.object().shape({
    name: yup.string().min(2, t('admin_dashboard.name_min_chars')).required(t('admin_dashboard.name_required')),
    email: yup.string().email(t('admin_dashboard.email_invalid')).required(t('admin_dashboard.email_required')),
    password: yup.string().min(6, t('admin_dashboard.password_min_chars')).required(t('admin_dashboard.password_required')),
    phone: yup.string().optional(),
    role: yup.string().oneOf(['owner', 'admin', 'employee'], t('admin_dashboard.role_invalid')).required(t('admin_dashboard.role_required')),
  });

  // Esquema de validação para o formulário de restaurante
  const restaurantSchema = yup.object().shape({
    name: yup.string().required(t('admin_dashboard.restaurant_name_required')),
    address: yup.string().optional(),
    city: yup.string().optional(),
    state: yup.string().optional(),
    zip_code: yup.string().optional(),
    phone: yup.string().optional(),
    email: yup.string().email(t('admin_dashboard.email_invalid')).optional(),
    website: yup.string().url(t('admin_dashboard.website_invalid')).optional(),
    owner_id: yup.string().uuid(t('admin_dashboard.owner_id_invalid')).required(t('admin_dashboard.owner_id_required')),
    enabled_modules: yup.array().of(yup.string()).optional(),
  });

  // Configuração do react-hook-form para o formulário de usuário
  const { control: userControl, handleSubmit: handleUserSubmit, reset: resetUserForm, formState: { errors: userErrors } } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'owner',
    },
  });

  // Configuração do react-hook-form para o formulário de restaurante
  const { control: restaurantControl, handleSubmit: handleRestaurantSubmit, reset: resetRestaurantForm, formState: { errors: restaurantErrors } } = useForm({
    resolver: yupResolver(restaurantSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      website: '',
      owner_id: '',
      enabled_modules: [],
    },
  });

  // Efeito para carregar usuários quando o componente é montado
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axiosInstance.get('/api/admin/users');
        setUsers(response.data);
      } catch (error) {
        toast.error(error.response?.data?.error || t('admin_dashboard.error_loading_users_description'));
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [t]);

  const handleCreateUser = async (data) => {
    setCreatingUser(true);
    try {
      await axiosInstance.post('/api/admin/users', data);
      toast.success(t('admin_dashboard.user_created_title'));
      resetUserForm();
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
    } catch (error) {
      toast.error(error.response?.data?.error || t('admin_dashboard.error_creating_restaurant_description'));
    } finally {
      setCreatingRestaurant(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin_dashboard.title')}
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="Admin Tabs">
          <Tab label={t('admin_dashboard.create_user_tab')} />
          <Tab label={t('admin_dashboard.create_restaurant_tab')} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
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
      )}

      {tabValue === 1 && (
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
                name="address"
                control={restaurantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('admin_dashboard.address_label')}
                    fullWidth
                    margin="normal"
                    error={!!restaurantErrors.address}
                    helperText={restaurantErrors.address ? restaurantErrors.address.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="city"
                control={restaurantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('admin_dashboard.city_label')}
                    fullWidth
                    margin="normal"
                    error={!!restaurantErrors.city}
                    helperText={restaurantErrors.city ? restaurantErrors.city.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="state"
                control={restaurantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('admin_dashboard.state_label')}
                    fullWidth
                    margin="normal"
                    error={!!restaurantErrors.state}
                    helperText={restaurantErrors.state ? restaurantErrors.state.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="zip_code"
                control={restaurantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('admin_dashboard.zip_code_label')}
                    fullWidth
                    margin="normal"
                    error={!!restaurantErrors.zip_code}
                    helperText={restaurantErrors.zip_code ? restaurantErrors.zip_code.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={restaurantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('admin_dashboard.restaurant_phone_label')}
                    fullWidth
                    margin="normal"
                    error={!!restaurantErrors.phone}
                    helperText={restaurantErrors.phone ? restaurantErrors.phone.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={restaurantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('admin_dashboard.restaurant_email_label')}
                    fullWidth
                    margin="normal"
                    type="email"
                    error={!!restaurantErrors.email}
                    helperText={restaurantErrors.email ? restaurantErrors.email.message : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="website"
                control={restaurantControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('admin_dashboard.website_label')}
                    fullWidth
                    margin="normal"
                    error={!!restaurantErrors.website}
                    helperText={restaurantErrors.website ? restaurantErrors.website.message : ''}
                  />
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
                      {/* Lista de módulos disponíveis */}
                      <MenuItem value="customer_segmentation">{t('modules.customer_segmentation')}</MenuItem>
                      <MenuItem value="ifood_integration">{t('modules.ifood_integration')}</MenuItem>
                      <MenuItem value="google_my_business_integration">{t('modules.google_my_business_integration')}</MenuItem>
                      <MenuItem value="saipos_integration">{t('modules.saipos_integration')}</MenuItem>
                      <MenuItem value="uai_rango_integration">{t('modules.uai_rango_integration')}</MenuItem>
                      <MenuItem value="delivery_much_integration">{t('modules.delivery_much_integration')}</MenuItem>
                      <MenuItem value="checkin_program">{t('modules.checkin_program')}</MenuItem>
                      <MenuItem value="surveys_feedback">{t('modules.surveys_feedback')}</MenuItem>
                      <MenuItem value="coupons_rewards">{t('modules.coupons_rewards')}</MenuItem>
                      <MenuItem value="whatsapp_messaging">{t('modules.whatsapp_messaging')}</MenuItem>
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
      )}
    </Box>
  );
};
};

export default AdminDashboard;
