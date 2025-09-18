import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  useSaveAdminRestaurant,
  useCreateRestaurantWithOwner,
} from '@/features/Admin/api/adminQueries';

// Hooks
import { usePermissions } from '../../../hooks/usePermissions';
import useAdminData from '../hooks/useAdminData';
import { useGetPermissionTree, useSetEntitlements } from '@/features/IAM/api/iamQueries';

// Components
import RestaurantTable from '../components/RestaurantTable';
import ModuleSettingsModal from '../components/ModuleSettingsModal';

// Services
import { deleteRestaurant } from '../services/adminService'; // Import deleteRestaurant service

const RestaurantsPage = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedRestaurantForModules, setSelectedRestaurantForModules] = useState(null);
  const [selectedModuleStates, setSelectedModuleStates] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);

  const { data: permissionTree, isLoading: isLoadingPermissionTree } = useGetPermissionTree(selectedRestaurantForModules?.id, {
    enabled: isModuleModalOpen && !!selectedRestaurantForModules?.id,
  });

  const handleOpenModuleModal = (restaurant) => {
    setSelectedRestaurantForModules(restaurant);
    setIsModuleModalOpen(true);
    if (permissionTree) {
      const initialSelected = {};
      permissionTree.modules.forEach((module) => {
        initialSelected[module.id] = {
          checked: module.status === 'active',
          indeterminate: false,
          submodules: {},
          features: {},
        };
        module.submodules.forEach((submodule) => {
          initialSelected[module.id].submodules[submodule.id] = {
            checked: submodule.status === 'active',
            indeterminate: false,
            features: {},
          };
          submodule.features.forEach((feature) => {
            initialSelected[module.id].submodules[submodule.id].features[feature.id] =
              feature.status === 'active';
          });
        });
        module.features.forEach((feature) => {
          initialSelected[module.id].features[feature.id] = feature.status === 'active';
        });
      });
      setSelectedModuleStates(initialSelected);
    }
  };

  const handleCloseModuleModal = () => {
    setIsModuleModalOpen(false);
    setSelectedRestaurantForModules(null);
    setSelectedModuleStates({});
  };

  const handleSaveModules = async (updatedModuleStates) => {
    if (!selectedRestaurantForModules) return;

    const entitlementsToUpdate = [];

    permissionTree?.modules.forEach((module) => {
      const currentModuleState = updatedModuleStates[module.id];
      if (currentModuleState) {
        entitlementsToUpdate.push({
          entityType: 'module',
          entityId: module.id,
          status: currentModuleState.checked ? 'active' : 'locked',
          source: 'admin_ui',
          metadata: {},
        });

        module.submodules.forEach((submodule) => {
          const currentSubmoduleState = currentModuleState.submodules[submodule.id];
          if (currentSubmoduleState) {
            entitlementsToUpdate.push({
              entityType: 'submodule',
              entityId: submodule.id,
              status: currentSubmoduleState.checked ? 'active' : 'locked',
              source: 'admin_ui',
              metadata: {},
            });

            submodule.features.forEach((feature) => {
              const currentFeatureState = currentSubmoduleState.features[feature.id];
              if (currentFeatureState !== undefined) {
                entitlementsToUpdate.push({
                  entityType: 'feature',
                  entityId: feature.id,
                  status: currentFeatureState ? 'active' : 'locked',
                  source: 'admin_ui',
                  metadata: {},
                });
              }
            });
          }
        });

        module.features.forEach((feature) => {
          const currentFeatureState = currentModuleState.features[feature.id];
          if (currentFeatureState !== undefined) {
            entitlementsToUpdate.push({
              entityType: 'feature',
              entityId: feature.id,
              status: currentFeatureState ? 'active' : 'locked',
              source: 'admin_ui',
              metadata: {},
            });
          }
        });
      }
    });

    try {
      await setEntitlementsMutation.mutateAsync({
        restaurantId: selectedRestaurantForModules.id,
        entitlements: entitlementsToUpdate,
      });
      toast.success('Funcionalidades do restaurante atualizadas com sucesso!');
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantForModules.id]);
      handleCloseModuleModal();
    } catch (err) {
      console.error('Failed to update entitlements:', err);
      toast.error(
        err.response?.data?.message || 'Erro ao atualizar funcionalidades do restaurante.'
      );
    }
  };

  const { restaurants, loading } = useAdminData();

  const saveRestaurantMutation = useSaveAdminRestaurant();
  const createRestaurantWithOwnerMutation = useCreateRestaurantWithOwner();
  const setEntitlementsMutation = useSetEntitlements();

  const handleDeleteClick = (restaurantId) => {
    setRestaurantToDelete(restaurantId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (restaurantToDelete) {
      try {
        await deleteRestaurant(restaurantToDelete);
        queryClient.invalidateQueries('adminRestaurants');
        toast.success('Restaurante excluído com sucesso!');
      } catch (error) {
        console.error('Failed to delete restaurant:', error);
        toast.error(error.response?.data?.message || 'Erro ao excluir restaurante.');
      } finally {
        setDeleteDialogOpen(false);
        setRestaurantToDelete(null);
      }
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin_dashboard.restaurants_title')}
      </Typography>

      {can('admin:restaurants', 'create') && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin/restaurants/new')}
          sx={{ mb: 3 }}
        >
          {t('admin_dashboard.create_new_restaurant')}
        </Button>
      )}

      <RestaurantTable
        restaurants={restaurants}
        loading={
          loading ||
          saveRestaurantMutation.isLoading ||
          createRestaurantWithOwnerMutation.isLoading ||
          isLoadingPermissionTree
        }
        canAddRestaurant={can('admin:restaurants', 'create')}
        canEditRestaurant={can('admin:restaurants', 'update')}
        canManageRestaurantModules={can('entitlements', 'update')}
        canDeleteRestaurant={can('admin:restaurants', 'delete')}
        onDeleteRestaurant={handleDeleteClick}
        handleOpenModuleModal={handleOpenModuleModal}
      />

      {selectedRestaurantForModules && permissionTree && (
        <ModuleSettingsModal
          isOpen={isModuleModalOpen}
          onClose={handleCloseModuleModal}
          editingRestaurant={selectedRestaurantForModules}
          allModules={permissionTree.modules || []}
          selectedModuleStates={selectedModuleStates}
          setSelectedModuleStates={setSelectedModuleStates}
          onSaveModules={handleSaveModules}
          loading={setEntitlementsMutation.isLoading || isLoadingPermissionTree}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>{t('admin_dashboard.confirm_delete_restaurant_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('admin_dashboard.confirm_delete_restaurant')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button onClick={confirmDelete} color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantsPage;
