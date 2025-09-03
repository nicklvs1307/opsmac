import React, { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useSaveAdminRestaurant, useCreateRestaurantWithOwner } from './api/adminQueries';

// Hooks
import usePermissions from '@/hooks/usePermissions';
import useAdminData from '@/hooks/useAdminData';
import { useGetPermissionTree, useSetEntitlement } from '@/features/IAM/api/iamQueries';

// Components
import RestaurantTable from '@/components/Admin/RestaurantTable';
import ModuleSettingsModal from '@/components/Admin/ModuleSettingsModal';

const AdminRestaurantsPage = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedRestaurantForModules, setSelectedRestaurantForModules] = useState(null);
  const [selectedModuleStates, setSelectedModuleStates] = useState({}); // New state for module states (checked/indeterminate)

  // Fetch permission tree for the selected restaurant (when modal is open)
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
    error: errorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantForModules?.id, {
    enabled: isModuleModalOpen && !!selectedRestaurantForModules?.id,
  });

  const handleOpenModuleModal = (restaurant) => {
    setSelectedRestaurantForModules(restaurant);
    setIsModuleModalOpen(true);
    // Initialize selectedModuleStates based on the fetched permissionTree
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
          // Direct features under module
          initialSelected[module.id].features[feature.id] = feature.status === 'active';
        });
      });
      setSelectedModuleStates(initialSelected);
    }
  };

  const handleCloseModuleModal = () => {
    setIsModuleModalOpen(false);
    setSelectedRestaurantForModules(null);
    setSelectedModuleStates({}); // Clear selected states on close
  };

  const handleSaveModules = async (updatedModuleStates) => {
    if (!selectedRestaurantForModules) return;

    const entitlementsToUpdate = [];

    // Iterate through the updatedModuleStates to build the entitlements array
    // This logic should mirror the structure of permissionTree
    permissionTree?.modules.forEach((module) => {
      const currentModuleState = updatedModuleStates[module.id];
      if (currentModuleState) {
        entitlementsToUpdate.push({
          entityType: 'module',
          entityId: module.id,
          status: currentModuleState.checked ? 'active' : 'locked',
          source: 'admin_ui',
        });

        module.submodules.forEach((submodule) => {
          const currentSubmoduleState = currentModuleState.submodules[submodule.id];
          if (currentSubmoduleState) {
            entitlementsToUpdate.push({
              entityType: 'submodule',
              entityId: submodule.id,
              status: currentSubmoduleState.checked ? 'active' : 'locked',
              source: 'admin_ui',
            });

            submodule.features.forEach((feature) => {
              const currentFeatureState = currentSubmoduleState.features[feature.id];
              if (currentFeatureState !== undefined) {
                entitlementsToUpdate.push({
                  entityType: 'feature',
                  entityId: feature.id,
                  status: currentFeatureState ? 'active' : 'locked',
                  source: 'admin_ui',
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
            });
          }
        });
      }
    });

    try {
      // Send each entitlement update individually (or batch if backend supports)
      for (const entitlement of entitlementsToUpdate) {
        await setEntitlementMutation.mutateAsync({
          restaurantId: selectedRestaurantForModules.id,
          ...entitlement,
        });
      }
      toast.success('Funcionalidades do restaurante atualizadas com sucesso!');
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantForModules.id]); // Invalidate permission tree
      handleCloseModuleModal(); // Close modal after saving
    } catch (err) {
      console.error('Failed to update entitlements:', err);
      toast.error(
        err.response?.data?.message || 'Erro ao atualizar funcionalidades do restaurante.'
      );
    }
  };

  // Use the refactored useAdminData hook for restaurants
  const { restaurants, loading } = useAdminData();

  // React Query Mutations
  const saveRestaurantMutation = useSaveAdminRestaurant();
  const createRestaurantWithOwnerMutation = useCreateRestaurantWithOwner();
  const setEntitlementMutation = useSetEntitlement();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin_dashboard.restaurants_title')}
      </Typography>

      {can('restaurants', 'create') && (
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
        canAddRestaurant={can('restaurants', 'create')}
        canEditRestaurant={can('restaurants', 'update')}
        canManageRestaurantModules={can('entitlements', 'update')}
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
          loading={setEntitlementMutation.isLoading || isLoadingPermissionTree}
        />
      )}
    </Box>
  );
};

export default AdminRestaurantsPage;
