import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Grid,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  fetchRestaurants, // Used to fetch a single restaurant by ID (will filter locally for now)
  saveRestaurant,
} from '@/services/adminService'; // Assuming these are correctly implemented
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import { useGetPermissionTree, useSetEntitlement } from '@/features/IAM/api/iamQueries';

const RestaurantEditPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { can } = usePermissions(); // Destructure can from usePermissions

  const [selectedModules, setSelectedModules] = useState({}); // State for module states

  // Fetch the specific restaurant
  const {
    data: restaurant, // Renamed from allRestaurants to restaurant
    isLoading: isLoadingRestaurant, // Renamed from isLoadingRestaurants
    isError: isErrorRestaurant, // Renamed from isErrorRestaurants
    error: errorRestaurant, // Renamed from errorRestaurants
  } = useQuery(['restaurant', restaurantId], () => fetchRestaurants(restaurantId), {
    enabled: !!restaurantId, // Only fetch if restaurantId is available
  });

  console.log('DEBUG: RestaurantEditPage - restaurantId from params:', restaurantId); // Add this line

  console.log('DEBUG: RestaurantEditPage - found restaurant:', restaurant); // This will now directly log the fetched restaurant

  // Fetch permission tree (modules, submodules, features) for the selected restaurant
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
    error: errorPermissionTree,
  } = useGetPermissionTree(restaurantId, { enabled: !!restaurantId });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Mutation for saving restaurant details
  const saveRestaurantMutation = useMutation(saveRestaurant, {
    onSuccess: () => {
      toast.success('Detalhes do restaurante atualizados com sucesso!');
      queryClient.invalidateQueries(['restaurant', restaurantId]); // Invalidate to refetch updated list
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Erro ao atualizar detalhes do restaurante.');
    },
  });

  // Mutation for saving restaurant entitlements
  const setEntitlementMutation = useSetEntitlement();

  // Effect to populate form and selected modules when data loads
  useEffect(() => {
    if (restaurant && permissionTree) {
      reset(restaurant); // Populate form fields with restaurant data

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

      // This part needs to be more robust to handle indeterminate states correctly
      // For now, a simple check based on active status
      setSelectedModules(initialSelected);
    }
  }, [restaurant, permissionTree, reset]);

  const handleModuleChange =
    (type, itemId, parentId = null, grandparentId = null) =>
    (event) => {
      const isChecked = event.target.checked;

      setSelectedModules((prevSelected) => {
        const newSelected = JSON.parse(JSON.stringify(prevSelected)); // Deep copy

        if (type === 'feature') {
          if (grandparentId && parentId) {
            // Feature under submodule
            newSelected[grandparentId].submodules[parentId].features[itemId] = isChecked;
          } else if (parentId) {
            // Feature directly under module
            newSelected[parentId].features[itemId] = isChecked;
          }
        } else if (type === 'submodule') {
          newSelected[parentId].submodules[itemId].checked = isChecked;
          // Propagate change to all children features
          Object.keys(newSelected[parentId].submodules[itemId].features).forEach((featureId) => {
            newSelected[parentId].submodules[itemId].features[featureId] = isChecked;
          });
        } else if (type === 'module') {
          newSelected[itemId].checked = isChecked;
          // Propagate change to all children submodules and features
          Object.keys(newSelected[itemId].submodules).forEach((submoduleId) => {
            newSelected[itemId].submodules[submoduleId].checked = isChecked;
            Object.keys(newSelected[itemId].submodules[submoduleId].features).forEach(
              (featureId) => {
                newSelected[itemId].submodules[submoduleId].features[featureId] = isChecked;
              }
            );
          });
          Object.keys(newSelected[itemId].features).forEach((featureId) => {
            // Direct features under module
            newSelected[itemId].features[featureId] = isChecked;
          });
        }

        // Recalculate indeterminate and checked states for parents (simplified for now)
        // This logic needs to be more robust, similar to PermissionTree
        const updateParentState = (currentSelected) => {
          const updated = { ...currentSelected };
          Object.keys(updated).forEach((moduleId) => {
            const module = updated[moduleId];

            // Update submodule states
            Object.keys(module.submodules).forEach((submoduleId) => {
              const submodule = module.submodules[submoduleId];
              const featureIds = Object.keys(submodule.features);
              const checkedFeatures = featureIds.filter((id) => submodule.features[id]);

              submodule.checked =
                featureIds.length > 0 && checkedFeatures.length === featureIds.length;
              submodule.indeterminate =
                checkedFeatures.length > 0 && checkedFeatures.length < featureIds.length;
            });

            // Update direct features under module
            const directFeatureIds = Object.keys(module.features);
            const checkedDirectFeatures = directFeatureIds.filter((id) => module.features[id]);

            // Update module state
            const allChildrenChecked =
              Object.keys(module.submodules).every(
                (submoduleId) => module.submodules[submoduleId].checked
              ) &&
              (directFeatureIds.length > 0
                ? checkedDirectFeatures.length === directFeatureIds.length
                : true); // If no direct features, consider them checked

            const anyChildrenChecked =
              Object.keys(module.submodules).some(
                (submoduleId) =>
                  module.submodules[submoduleId].checked ||
                  module.submodules[submoduleId].indeterminate
              ) || checkedDirectFeatures.length > 0;

            module.checked = allChildrenChecked;
            module.indeterminate = anyChildrenChecked && !allChildrenChecked;
          });
          return updated;
        };

        return updateParentState(newSelected);
      });
    };

  const onSubmit = async (data) => {
    if (!restaurantId) {
      toast.error('ID do restaurante não encontrado para atualização.');
      return;
    }

    // Save restaurant details
    await saveRestaurantMutation.mutateAsync({ ...data, restaurantId });

    // Collect all selected feature IDs and update entitlements
    const entitlementsToUpdate = [];
    permissionTree.modules.forEach((module) => {
      const currentModuleStatus = selectedModules[module.id]?.checked ? 'active' : 'locked';
      entitlementsToUpdate.push({
        entityType: 'module',
        entityId: module.id,
        status: currentModuleStatus,
        source: 'admin_ui',
      });

      module.submodules.forEach((submodule) => {
        const currentSubmoduleStatus = selectedModules[module.id]?.submodules[submodule.id]?.checked
          ? 'active'
          : 'locked';
        entitlementsToUpdate.push({
          entityType: 'submodule',
          entityId: submodule.id,
          status: currentSubmoduleStatus,
          source: 'admin_ui',
        });

        submodule.features.forEach((feature) => {
          const currentFeatureStatus = selectedModules[module.id]?.submodules[submodule.id]
            ?.features[feature.id]
            ? 'active'
            : 'locked';
          entitlementsToUpdate.push({
            entityType: 'feature',
            entityId: feature.id,
            status: currentFeatureStatus,
            source: 'admin_ui',
          });
        });
      });

      module.features.forEach((feature) => {
        // Direct features under module
        const currentFeatureStatus = selectedModules[module.id]?.features[feature.id]
          ? 'active'
          : 'locked';
        entitlementsToUpdate.push({
          entityType: 'feature',
          entityId: feature.id,
          status: currentFeatureStatus,
          source: 'admin_ui',
        });
      });
    });

    // Send each entitlement update individually (or batch if backend supports)
    for (const entitlement of entitlementsToUpdate) {
      await setEntitlementMutation.mutateAsync(entitlement);
    }

    toast.success('Funcionalidades do restaurante atualizadas com sucesso!');
    queryClient.invalidateQueries(['permissionTree', restaurantId]); // Invalidate permission tree
  };

  if (isLoadingRestaurant || isLoadingPermissionTree) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorRestaurant || isErrorPermissionTree) {
    return (
      <Alert severity="error">
        Erro ao carregar dados: {errorRestaurant?.message || errorPermissionTree?.message}
      </Alert>
    );
  }

  if (!restaurant) {
    return <Alert severity="warning">Restaurante não encontrado.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Editar Restaurante: {restaurant.name}
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome do Restaurante"
                    fullWidth
                    margin="normal"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="address"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} label="Endereço" fullWidth margin="normal" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cuisine_type"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField {...field} label="Tipo de Culinária" fullWidth margin="normal" />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
            {/* Add other restaurant fields here */}
          </Grid>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              Módulos Habilitados
            </Typography>
            <FormGroup>
              {permissionTree?.modules.map((module) => (
                <Box
                  key={module.id}
                  sx={{ mb: 2, border: '1px solid #eee', borderRadius: '8px', p: 2 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedModules[module.id]?.checked || false}
                        indeterminate={selectedModules[module.id]?.indeterminate || false}
                        onChange={handleModuleChange('module', module.id)}
                        disabled={!can('entitlements', 'update')}
                      />
                    }
                    label={<Typography variant="h6">{module.name}</Typography>}
                  />
                  <Box sx={{ ml: 3 }}>
                    {/* Features directly under module */}
                    {module.features?.map((feature) => (
                      <FormControlLabel
                        key={feature.id}
                        control={
                          <Checkbox
                            checked={selectedModules[module.id]?.features[feature.id] || false}
                            onChange={handleModuleChange('feature', feature.id, module.id)}
                            disabled={!can('entitlements', 'update')}
                          />
                        }
                        label={feature.name}
                        sx={{ display: 'block' }}
                      />
                    ))}
                    {/* Submodules */}
                    {module.submodules?.map((submodule) => (
                      <Box
                        key={submodule.id}
                        sx={{ ml: 2, mt: 1, borderLeft: '2px solid #ddd', pl: 2 }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={
                                selectedModules[module.id]?.submodules[submodule.id]?.checked ||
                                false
                              }
                              indeterminate={
                                selectedModules[module.id]?.submodules[submodule.id]
                                  ?.indeterminate || false
                              }
                              onChange={handleModuleChange('submodule', submodule.id, module.id)}
                              disabled={!can('entitlements', 'update')}
                            />
                          }
                          label={<Typography variant="subtitle1">{submodule.name}</Typography>}
                        />
                        <Box sx={{ ml: 3 }}>
                          {/* Features under submodule */}
                          {submodule.features?.map((feature) => (
                            <FormControlLabel
                              key={feature.id}
                              control={
                                <Checkbox
                                  checked={
                                    selectedModules[module.id]?.submodules[submodule.id]?.features[
                                      feature.id
                                    ] || false
                                  }
                                  onChange={handleModuleChange(
                                    'feature',
                                    feature.id,
                                    submodule.id,
                                    module.id
                                  )}
                                  disabled={!can('entitlements', 'update')}
                                />
                              }
                              label={feature.name}
                              sx={{ display: 'block' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </FormGroup>
          </Box>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                saveRestaurantMutation.isLoading ||
                setEntitlementMutation.isLoading ||
                !can('restaurants', 'update')
              }
            >
              {saveRestaurantMutation.isLoading || setEntitlementMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Salvar Alterações'
              )}
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/restaurants')}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default RestaurantEditPage;
