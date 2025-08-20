import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import UserModal from '../../components/Admin/UserModal';
import RestaurantModal from '../../components/Admin/RestaurantModal';
import ModuleSettingsModal from '../../components/Admin/ModuleSettingsModal';
import UserTable from '../../components/Admin/UserTable';
import RestaurantTable from '../../components/Admin/RestaurantTable';
import { saveUser, saveRestaurant, saveRestaurantModules } from '../../api/adminService';
import useAdminData from '../../hooks/useAdminData';
import useModal from '../../hooks/useModal';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const { users, restaurants, loading, setLoading, fetchUsers, fetchRestaurants } = useAdminData();

  // Estados dos Modais
  const { isOpen: isUserModalOpen, editingItem: editingUser, handleOpen: handleOpenUserModal, handleClose: handleCloseUserModal } = useModal();
  const { isOpen: isRestaurantModalOpen, editingItem: editingRestaurant, handleOpen: handleOpenRestaurantModal, handleClose: handleCloseRestaurantModal } = useModal();
  const { isOpen: isModuleModalOpen, editingItem: editingModuleRestaurant, handleOpen: handleOpenModuleModal, handleClose: handleCloseModuleModal } = useModal();

  const [selectedModules, setSelectedModules] = useState([]);

  const availableModules = [
    'customer_segmentation', 'ifood_integration', 'google_my_business_integration',
    'saipos_integration', 'uai_rango_integration', 'delivery_much_integration',
    'checkin_program', 'surveys_feedback', 'coupons_rewards', 'whatsapp_messaging'
  ];

  useEffect(() => {
    if (tabValue === 0) fetchUsers();
    if (tabValue === 1) fetchRestaurants();
  }, [tabValue, fetchUsers, fetchRestaurants]);

  // Funções de Ação (CRUD)
  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const onUserSubmit = async (data) => {
    setLoading(true);
    try {
      await saveUser(data, editingUser?.id);
      toast.success(t(editingUser ? 'admin_dashboard.user_updated_success' : 'admin_dashboard.user_created_title'));
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
      await saveRestaurant(data, editingRestaurant?.id);
      toast.success(t(editingRestaurant ? 'admin_dashboard.restaurant_updated_success' : 'admin_dashboard.restaurant_created_title'));
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
      await saveRestaurantModules(editingModuleRestaurant.id, selectedModules);
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
        <UserTable
          users={users}
          loading={loading}
          handleOpenUserModal={handleOpenUserModal}
        />
      )}

      {tabValue === 1 && (
        <RestaurantTable
          restaurants={restaurants}
          loading={loading}
          handleOpenRestaurantModal={handleOpenRestaurantModal}
          handleOpenModuleModal={handleOpenModuleModal}
        />
      )}

      {/* Modais */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        editingUser={editingUser}
        onSave={onUserSubmit}
      />
      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={handleCloseRestaurantModal}
        editingRestaurant={editingRestaurant}
        onSave={onRestaurantSubmit}
        users={users} // Pass users for owner selection
      />
      <ModuleSettingsModal
        isOpen={isModuleModalOpen}
        onClose={handleCloseModuleModal}
        editingRestaurant={editingModuleRestaurant}
        availableModules={availableModules}
        selectedModules={selectedModules}
        onSaveModules={handleSaveModules}
        setSelectedModules={setSelectedModules}
      />

    </Box>
  );
};

export default AdminDashboard;
