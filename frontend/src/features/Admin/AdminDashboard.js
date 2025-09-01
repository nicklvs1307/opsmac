import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

// React Query Hooks
import {
  useSaveAdminUser,
  useSaveAdminRestaurant,
  useSaveRestaurantFeatures,
  useAllModules,
  useRestaurantFeatures,
} from '@/features/Admin/api/adminQueries';

// Hooks
import useModal from '@/shared/hooks/useModal';
import usePermissions from '@/shared/hooks/usePermissions';
import useAdminData from '@/shared/hooks/useAdminData'; // Import the refactored hook

// Components
import UserModal from '@/components/Admin/UserModal';
import RestaurantModal from '@/components/Admin/RestaurantModal';
import ModuleSettingsModal from '@/components/Admin/ModuleSettingsModal';
import UserTable from '@/components/Admin/UserTable';
import RestaurantTable from '@/components/Admin/RestaurantTable';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const [tabValue, setTabValue] = useState(0);

  // Use the refactored useAdminData hook
  const { users, restaurants, loading } = useAdminData();

  // React Query Mutations
  const saveUserMutation = useSaveAdminUser();
  const saveRestaurantMutation = useSaveAdminRestaurant();
  const saveRestaurantFeaturesMutation = useSaveRestaurantFeatures();

  // Fetch all modules (for ModuleSettingsModal)
  const { data: allModules = [] } = useAllModules();

  // Modal State
  const {
    isOpen: isUserModalOpen,
    editingItem: editingUser,
    handleOpen: handleOpenUserModal,
    handleClose: handleCloseUserModal,
  } = useModal();
  const {
    isOpen: isRestaurantModalOpen,
    editingItem: editingRestaurant,
    handleOpen: handleOpenRestaurantModal,
    handleClose: handleCloseRestaurantModal,
  } = useModal();
  const {
    isOpen: isModuleModalOpen,
    editingItem: editingModuleRestaurant,
    handleOpen: handleOpenModuleModal,
    handleClose: handleCloseModuleModal,
  } = useModal();

  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  // Fetch restaurant modules when module modal is opened
  const { data: currentRestaurantFeatures, isLoading: isLoadingRestaurantFeatures } =
    useRestaurantFeatures(editingModuleRestaurant?.id);

  useEffect(() => {
    if (isModuleModalOpen && currentRestaurantFeatures) {
      setSelectedModuleIds(currentRestaurantFeatures.map((feature) => feature.id));
    }
  }, [isModuleModalOpen, currentRestaurantFeatures]);

  // --- Modal and Form Handlers ---

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const onUserSubmit = async (data) => {
    try {
      await saveUserMutation.mutateAsync(data);
      toast.success(
        t(
          editingUser
            ? 'admin_dashboard.user_updated_success'
            : 'admin_dashboard.user_created_title'
        )
      );
      handleCloseUserModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const onRestaurantSubmit = async (data) => {
    try {
      await saveRestaurantMutation.mutateAsync(data);
      toast.success(
        t(
          editingRestaurant
            ? 'admin_dashboard.restaurant_updated_success'
            : 'admin_dashboard.restaurant_created_title'
        )
      );
      handleCloseRestaurantModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error');
    }
  };

  const handleOpenModuleEditor = useCallback(
    (restaurant) => {
      handleOpenModuleModal(restaurant); // Opens the modal and sets the restaurant being edited
      // The useRestaurantModules hook will fetch the data automatically
    },
    [handleOpenModuleModal]
  );

  const handleSaveModules = async () => {
    if (!editingModuleRestaurant) return;
    try {
      await saveRestaurantFeaturesMutation.mutateAsync({
        restaurantId: editingModuleRestaurant.id,
        enabledFeatureIds: selectedModuleIds,
      });
      toast.success(t('admin_dashboard.modules_updated_success'));
      handleCloseModuleModal();
    } catch (error) {
      toast.error(t('admin_dashboard.modules_updated_error'));
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin_dashboard.title')}
      </Typography>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label={t('admin_dashboard.list_users_tab')} disabled={!can('admin_users', 'read')} />
          <Tab
            label={t('admin_dashboard.list_restaurants_tab')}
            disabled={!can('admin_restaurants', 'read')}
          />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <UserTable
          users={users}
          loading={loading || saveUserMutation.isLoading} // Combine loading states
          handleOpenUserModal={handleOpenUserModal}
          canAddUser={can('admin_users', 'create')}
          canEditUser={can('admin_users', 'update')}
        />
      )}

      {tabValue === 1 && (
        <RestaurantTable
          restaurants={restaurants}
          loading={loading || saveRestaurantMutation.isLoading} // Combine loading states
          handleOpenRestaurantModal={handleOpenRestaurantModal}
          handleOpenModuleModal={handleOpenModuleEditor}
          canAddRestaurant={can('admin_restaurants', 'create')}
          canEditRestaurant={can('admin_restaurants', 'update')}
          canManageRestaurantModules={can('modules', 'manage')}
        />
      )}

      {/* Modais */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        editingUser={editingUser}
        onSave={onUserSubmit}
        restaurants={restaurants} // Pass restaurants to the modal
      />
      <RestaurantModal
        isOpen={isRestaurantModalOpen}
        onClose={handleCloseRestaurantModal}
        editingRestaurant={editingRestaurant}
        onSave={onRestaurantSubmit}
        users={users} // users data is now from useAdminData
      />
      {isModuleModalOpen && (
        <ModuleSettingsModal
          isOpen={isModuleModalOpen}
          onClose={handleCloseModuleModal}
          editingRestaurant={editingModuleRestaurant}
          allModules={allModules} // Pass allModules from react-query
          selectedModuleIds={selectedModuleIds} // Pass the selected module IDs
          setSelectedModuleIds={setSelectedModuleIds} // Pass the function to update selected IDs
          onSaveModules={handleSaveModules}
          loading={isLoadingRestaurantFeatures || saveRestaurantFeaturesMutation.isLoading} // Combine loading states
        />
      )}
    </Box>
  );
};

export default AdminDashboard;
