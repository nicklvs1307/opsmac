import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, TextField, Button, CircularProgress, 
  Select, MenuItem, FormControl, InputLabel, Grid, FormHelperText, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogTitle, DialogContent, DialogActions, FormGroup, FormControlLabel, Checkbox, IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
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
  phone: yup.string().optional(),
  role: yup.string().oneOf(['owner', 'admin', 'employee'], t('admin_dashboard.role_invalid')).required(t('admin_dashboard.role_required')),
});

const restaurantSchema = (t) => yup.object().shape({
  name: yup.string().required(t('admin_dashboard.restaurant_name_required')),
  owner_id: yup.string().uuid(t('admin_dashboard.owner_id_invalid')).required(t('admin_dashboard.owner_id_required')),
});

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  
  // Estados
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isRestaurantModalOpen, setRestaurantModalOpen] = useState(false);
  const [isModuleModalOpen, setModuleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [selectedModules, setSelectedModules] = useState([]);

  const availableModules = [
    'customer_segmentation', 'ifood_integration', 'google_my_business_integration',
    'saipos_integration', 'uai_rango_integration', 'delivery_much_integration',
    'checkin_program', 'surveys_feedback', 'coupons_rewards', 'whatsapp_messaging'
  ];

  // Formulários
  const { control: userControl, handleSubmit: handleUserSubmit, reset: resetUserForm } = useForm({ resolver: yupResolver(userSchema(t)) });
  const { control: restaurantControl, handleSubmit: handleRestaurantSubmit, reset: resetRestaurantForm } = useForm({ resolver: yupResolver(restaurantSchema(t)) });

  // Funções de busca
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error(t('admin_dashboard.error_loading_users_description'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/admin/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      toast.error(t('admin_dashboard.error_loading_restaurants_description'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tabValue === 0) fetchUsers();
    if (tabValue === 1) fetchRestaurants();
  }, [tabValue]);

  // Funções de Ação (CRUD)
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleOpenUserModal = (user = null) => {
    setEditingUser(user);
    resetUserForm(user || {});
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setUserModalOpen(false);
    setEditingUser(null);
  };

  const handleOpenRestaurantModal = (restaurant = null) => {
    setEditingRestaurant(restaurant);
    resetRestaurantForm(restaurant || {});
    setRestaurantModalOpen(true);
  };

  const handleCloseRestaurantModal = () => {
    setRestaurantModalOpen(false);
    setEditingRestaurant(null);
  };

  const handleOpenModuleModal = (restaurant) => {
    setEditingRestaurant(restaurant);
    setSelectedModules(restaurant.settings?.enabled_modules || []);
    setModuleModalOpen(true);
  };

  const handleCloseModuleModal = () => setModuleModalOpen(false);

  const onUserSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingUser) {
        await axiosInstance.put(`/api/admin/users/${editingUser.id}`, data);
        toast.success(t('admin_dashboard.user_updated_success'));
      } else {
        await axiosInstance.post('/api/admin/users', data);
        toast.success(t('admin_dashboard.user_created_title'));
      }
      fetchUsers();
      handleCloseUserModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const onRestaurantSubmit = async (data) => {
    setLoading(true);
    try {
      if (editingRestaurant) {
        await axiosInstance.put(`/api/restaurant/${editingRestaurant.id}`, data);
        toast.success(t('admin_dashboard.restaurant_updated_success'));
      } else {
        await axiosInstance.post('/api/admin/restaurants', data);
        toast.success(t('admin_dashboard.restaurant_created_title'));
      }
      fetchRestaurants();
      handleCloseRestaurantModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModules = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(`/api/admin/restaurants/${editingRestaurant.id}/modules`, { enabled_modules: selectedModules });
      toast.success(t('admin_dashboard.modules_updated_success'));
      fetchRestaurants();
      handleCloseModuleModal();
    } catch (error) {
      toast.error(t('admin_dashboard.modules_updated_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>{t('admin_dashboard.title')}</Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={t('admin_dashboard.list_users_tab')} />
          <Tab label={t('admin_dashboard.list_restaurants_tab')} />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Button onClick={() => handleOpenUserModal()}> {t('admin_dashboard.create_user_tab')} </Button>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin_dashboard.list_header_name')}</TableCell>
                <TableCell>{t('admin_dashboard.list_header_email')}</TableCell>
                <TableCell>{t('admin_dashboard.list_header_role')}</TableCell>
                <TableCell align="right">{t('admin_dashboard.list_header_actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow> : 
                users.map(user => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenUserModal(user)}><EditIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
           <Button onClick={() => handleOpenRestaurantModal()}> {t('admin_dashboard.create_restaurant_tab')} </Button>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin_dashboard.list_header_restaurant')}</TableCell>
                <TableCell>{t('admin_dashboard.list_header_owner')}</TableCell>
                <TableCell>{t('admin_dashboard.list_header_modules')}</TableCell>
                <TableCell align="right">{t('admin_dashboard.list_header_actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow> : 
                restaurants.map(restaurant => (
                  <TableRow key={restaurant.id} hover>
                    <TableCell>{restaurant.name}</TableCell>
                    <TableCell>{restaurant.owner?.name || 'N/A'}</TableCell>
                    <TableCell>{(restaurant.settings?.enabled_modules || []).join(', ')}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenRestaurantModal(restaurant)}><EditIcon /></IconButton>
                      <Button variant="outlined" onClick={() => handleOpenModuleModal(restaurant)}>{t('admin_dashboard.manage_modules_button')}</Button>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modais */}
      <Dialog open={isUserModalOpen} onClose={handleCloseUserModal}>
        <DialogTitle>{editingUser ? t('admin_dashboard.edit_user_title') : t('admin_dashboard.create_user_tab')}</DialogTitle>
        <DialogContent>
          <Controller name="name" control={userControl} render={({ field }) => <TextField {...field} label={t('admin_dashboard.name_label')} fullWidth margin="normal" />} />
          <Controller name="email" control={userControl} render={({ field }) => <TextField {...field} label={t('admin_dashboard.email_label')} fullWidth margin="normal" /> } />
          <Controller name="phone" control={userControl} render={({ field }) => <TextField {...field} label={t('admin_dashboard.user_phone_label')} fullWidth margin="normal" /> } />
          <Controller name="role" control={userControl} render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('admin_dashboard.role_label')}</InputLabel>
              <Select {...field} label={t('admin_dashboard.role_label')}>
                <MenuItem value="owner">{t('admin_dashboard.role_owner')}</MenuItem>
                <MenuItem value="admin">{t('admin_dashboard.role_admin')}</MenuItem>
                <MenuItem value="employee">{t('admin_dashboard.role_employee')}</MenuItem>
              </Select>
            </FormControl>
          )} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserModal}>{t('common.cancel')}</Button>
          <Button onClick={handleUserSubmit(onUserSubmit)} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isRestaurantModalOpen} onClose={handleCloseRestaurantModal}>
        <DialogTitle>{editingRestaurant ? t('admin_dashboard.edit_restaurant_title') : t('admin_dashboard.create_restaurant_tab')}</DialogTitle>
        <DialogContent>
          <Controller name="name" control={restaurantControl} render={({ field }) => <TextField {...field} label={t('admin_dashboard.restaurant_name_label')} fullWidth margin="normal" />} />
          <Controller name="owner_id" control={restaurantControl} render={({ field }) => (
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('admin_dashboard.owner_label')}</InputLabel>
              <Select {...field} label={t('admin_dashboard.owner_label')}>
                {users.map(user => <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>)}
              </Select>
            </FormControl>
          )} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRestaurantModal}>{t('common.cancel')}</Button>
          <Button onClick={handleRestaurantSubmit(onRestaurantSubmit)} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isModuleModalOpen} onClose={handleCloseModuleModal}>
        <DialogTitle>{t('admin_dashboard.manage_modules_for', { name: editingRestaurant?.name })}</DialogTitle>
        <DialogContent>
          <FormGroup>
            {availableModules.map(moduleName => (
              <FormControlLabel 
                key={moduleName} 
                control={<Checkbox checked={selectedModules.includes(moduleName)} onChange={(e) => setSelectedModules(e.target.checked ? [...selectedModules, moduleName] : selectedModules.filter(m => m !== moduleName))} name={moduleName} />} 
                label={t(`modules.${moduleName}`)} 
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModuleModal}>{t('common.cancel')}</Button>
          <Button onClick={handleSaveModules} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default AdminDashboard;