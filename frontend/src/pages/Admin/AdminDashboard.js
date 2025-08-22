import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// API Services
import { 
  fetchUsers as apiFetchUsers, 
  fetchRestaurants as apiFetchRestaurants, 
  saveUser, 
  saveRestaurant, 
  getAllModules, 
  getRestaurantModules, 
  saveRestaurantModules 
} from '../../api/adminService';

// Components
import UserModal from '../../components/Admin/UserModal';
import RestaurantModal from '../../components/Admin/RestaurantModal';
import ModuleSettingsModal from '../../components/Admin/ModuleSettingsModal';
import UserTable from '../../components/Admin/UserTable';
import RestaurantTable from '../../components/Admin/RestaurantTable';

// Hooks
import useModal from '../../hooks/useModal';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data State
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [allModules, setAllModules] = useState([]);

  // Modal State
  const { isOpen: isUserModalOpen, editingItem: editingUser, handleOpen: handleOpenUserModal, handleClose: handleCloseUserModal } = useModal();
  const { isOpen: isRestaurantModalOpen, editingItem: editingRestaurant, handleOpen: handleOpenRestaurantModal, handleClose: handleCloseRestaurantModal } = useModal();
  const { isOpen: isModuleModalOpen, editingItem: editingModuleRestaurant, handleOpen: handleOpenModuleModal, handleClose: handleCloseModuleModal } = useModal();
  
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  // --- Data Fetching ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetchUsers();
      setUsers(data);
    } catch (error) {
      toast.error(t('admin_dashboard.fetch_users_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetchRestaurants();
      setRestaurants(data);
    } catch (error) {
      toast.error(t('admin_dashboard.fetch_restaurants_error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (tabValue === 0) fetchUsers();
    if (tabValue === 1) fetchRestaurants();
  }, [tabValue, fetchUsers, fetchRestaurants]);

  useEffect(() => {
    const fetchAllModules = async () => {
      try {
        const response = await getAllModules();
        setAllModules(response.data);
      } catch (error) {
        toast.error(t('admin_dashboard.fetch_modules_error'));
      }
    };
    fetchAllModules();
  }, [t]);

  // --- Modal and Form Handlers ---

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

  const handleOpenModuleEditor = async (restaurant) => {
    handleOpenModuleModal(restaurant); // Abre o modal e define o restaurante em edição
    try {
      setLoading(true);
      const response = await getRestaurantModules(restaurant.id);
      const currentModuleIds = response.data.map(module => module.id);
      setSelectedModuleIds(currentModuleIds);
    } catch (error) {
      toast.error(t('admin_dashboard.fetch_restaurant_modules_error'));
      handleCloseModuleModal(); // Fecha o modal se houver erro
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModules = async () => {
    if (!editingModuleRestaurant) return;
    setLoading(true);
    try {
      await saveRestaurantModules(editingModuleRestaurant.id, selectedModuleIds);
      toast.success(t('admin_dashboard.modules_updated_success'));
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
          handleOpenModuleModal={handleOpenModuleEditor} // Passa a nova função
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
        users={users}
      />
      {isModuleModalOpen && (
        <ModuleSettingsModal
          isOpen={isModuleModalOpen}
          onClose={handleCloseModuleModal}
          editingRestaurant={editingModuleRestaurant}
          allModules={allModules} // Passa todos os módulos possíveis
          selectedModuleIds={selectedModuleIds} // Passa os IDs dos módulos selecionados
          setSelectedModuleIds={setSelectedModuleIds} // Passa a função para atualizar os IDs
          onSaveModules={handleSaveModules}
          loading={loading}
        />
      )}
    </Box>
  );
};

export default AdminDashboard;