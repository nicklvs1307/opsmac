import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { fetchRestaurants, saveRestaurant } from '../services/adminService';
import {
  useGetPermissionTree,
  useSetEntitlements, // Changed from useSetEntitlement
  useGetRestaurantEntitlements, // Added this hook
} from '@/features/IAM/api/iamQueries';
import { usePermissions } from '../../../hooks/usePermissions';
import PermissionTree from '../components/PermissionTree';
import { usePermissionTreeLogic } from '../hooks/usePermissionTreeLogic';

const RestaurantEditPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const {
    data: restaurant,
    isLoading: isLoadingRestaurant,
    isError: isErrorRestaurant,
  } = useQuery(['restaurant', restaurantId], () => fetchRestaurants(restaurantId), {
    enabled: !!restaurantId,
  });

  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
  } = useGetPermissionTree(restaurantId, { enabled: !!restaurantId });

  // Fetch the specific entitlements for this restaurant
  const {
    data: restaurantEntitlements,
    isLoading: isLoadingEntitlements,
    isError: isErrorEntitlements,
  } = useGetRestaurantEntitlements(restaurantId, { enabled: !!restaurantId });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const saveRestaurantMutation = useMutation(saveRestaurant, {
    onSuccess: () => queryClient.invalidateQueries(['restaurant', restaurantId]),
  });
  const setEntitlementsMutation = useSetEntitlements();

  const { selectedPermissions, handlePermissionChange } = usePermissionTreeLogic(
    permissionTree,
    restaurantEntitlements,
    'entitlements'
  );

  useEffect(() => {
    if (restaurant) {
      reset(restaurant);
    }
  }, [restaurant, reset]);

  const onSubmit = async (data) => {
    try {
      if (!restaurantId) {
        toast.error('Restaurant ID is missing. Cannot save.');
        return;
      }
      const { ownerId, ...restOfData } = data;
      await saveRestaurantMutation.mutateAsync({ ...restOfData, restaurantId });
      toast.success('Restaurant details updated successfully!');

      const entitlements = [];
      permissionTree.modules?.forEach((module) => {
        const moduleState = selectedPermissions[module.id];
        if (moduleState) {
          entitlements.push({
            entityType: 'module',
            entityId: module.id,
            status: moduleState.checked ? 'active' : 'locked',
            source: 'admin_ui',
            metadata: {},
          });
          module.submodules?.forEach((submodule) => {
            const submoduleState = moduleState.submodules[submodule.id];
            if (submoduleState) {
              entitlements.push({
                entityType: 'submodule',
                entityId: submodule.id,
                status: submoduleState.checked ? 'active' : 'locked',
                source: 'admin_ui',
                metadata: {},
              });
              submodule.features?.forEach((feature) => {
                const featureState = submoduleState.features[feature.id];
                if (featureState) {
                  entitlements.push({
                    entityType: 'feature',
                    entityId: feature.id,
                    status: featureState.checked ? 'active' : 'locked',
                    source: 'admin_ui',
                    metadata: {},
                  });
                }
              });
            }
          });
        }
      });

      console.log('Entitlements being sent:', JSON.stringify(entitlements, null, 2));
      await setEntitlementsMutation.mutateAsync({ restaurantId, entitlements });
      toast.success('Restaurant entitlements updated successfully!');

      queryClient.invalidateQueries(['permissionTree', restaurantId]);
      queryClient.invalidateQueries(['restaurantEntitlements', restaurantId]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    }
  };

  if (isLoadingRestaurant || isLoadingPermissionTree || isLoadingEntitlements)
    return <CircularProgress />;
  if (isErrorRestaurant || isErrorPermissionTree || isErrorEntitlements)
    return <Alert severity="error">Error loading data.</Alert>;
  if (!restaurant) return <Alert severity="warning">Restaurant not found.</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit Restaurant: {restaurant.name}
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Restaurant Name"
                    fullWidth
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
                render={({ field }) => <TextField {...field} label="Address" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="cuisine_type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select // Use select prop to make it a dropdown
                    label="Cuisine Type"
                    fullWidth
                    InputLabelProps={{ shrink: true }} // Ensures label is always "shrunk" for select
                  >
                    {/* Hardcoded options for now. In a real app, these would come from an API */}
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="Brazilian">Brazilian</MenuItem>
                    <MenuItem value="Italian">Italian</MenuItem>
                    <MenuItem value="Japanese">Japanese</MenuItem>
                    <MenuItem value="Mexican">Mexican</MenuItem>
                    <MenuItem value="American">American</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Description" fullWidth multiline rows={4} />
                )}
              />
            </Grid>
          </Grid>
          {permissionTree?.modules?.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h5" gutterBottom>
                Enabled Modules
              </Typography>
              <PermissionTree
                availableModules={permissionTree?.modules}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
                disabled={!can('admin:permissions', 'update')}
              />
            </Box>
          )}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                saveRestaurantMutation.isLoading ||
                setEntitlementsMutation.isLoading ||
                !can('admin:restaurants', 'update')
              }
            >
              Save Changes
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/restaurants')}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default RestaurantEditPage;
