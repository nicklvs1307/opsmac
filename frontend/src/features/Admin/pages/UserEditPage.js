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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { fetchUsers, saveUser } from '../services/adminService';
import {
  useGetPermissionTree,
  useGetRoles,
  useGetUserPermissionOverrides,
  useSetUserPermissionOverrides,
  useAssignUserRole,
  useRemoveUserRole,
} from '@/features/IAM/api/iamQueries';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionTree from '../components/PermissionTree';
import { usePermissionTreeLogic } from '../hooks/usePermissionTreeLogic';

const UserEditPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedRestaurantId } = useAuth();
  const { can } = usePermissions();

  const {
    data: allUsers,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery('adminUsers', fetchUsers);
  const targetUser = allUsers?.find((u) => u.id === userId);

  const {
    data: allRoles,
    isLoading: isLoadingAllRoles,
    isError: isErrorAllRoles,
  } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });
  const {
    data: fetchedUserOverrides,
    isLoading: isLoadingUserOverrides,
    isError: isErrorUserOverrides,
  } = useGetUserPermissionOverrides(userId, selectedRestaurantId, {
    enabled: !!userId && !!selectedRestaurantId,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const saveUserMutation = useMutation(saveUser, {
    onSuccess: () => queryClient.invalidateQueries('adminUsers'),
  });
  const assignUserRoleMutation = useAssignUserRole();
  const removeUserRoleMutation = useRemoveUserRole();
  const saveUserPermissionOverridesMutation = useSetUserPermissionOverrides();

  const { selectedPermissions, handlePermissionChange } = usePermissionTreeLogic(permissionTree, fetchedUserOverrides);

  useEffect(() => {
    if (targetUser) {
      reset({
        name: targetUser.name || '',
        email: targetUser.email || '',
        phone: targetUser.phone || '',
        roleId: targetUser.roles?.[0]?.id || '',
      });
    }
  }, [targetUser, reset]);



  const onSubmit = async (data) => {
    try {
      await saveUserMutation.mutateAsync({ ...data, userId });
      toast.success('User details updated successfully!');

      const currentRoleId = targetUser?.roles?.[0]?.id;
      const newRoleId = data.roleId;
      if (currentRoleId !== newRoleId) {
        if (currentRoleId)
          await removeUserRoleMutation.mutateAsync({
            userId,
            restaurantId: selectedRestaurantId,
            roleId: currentRoleId,
          });
        if (newRoleId)
          await assignUserRoleMutation.mutateAsync({
            userId,
            restaurantId: selectedRestaurantId,
            roleId: newRoleId,
          });
        toast.success('User role updated successfully!');
      }

      const overrides = [];
      permissionTree.modules?.forEach((module) => {
        module.submodules?.forEach((submodule) => {
          submodule.features?.forEach((feature) => {
            const actions =
              selectedPermissions[module.id]?.submodules[submodule.id]?.features[feature.id]
                ?.actions || {};
            Object.keys(actions).forEach((actionId) => {
              overrides.push({ featureId: feature.id, actionId, allowed: actions[actionId] });
            });
          });
        });
      });

      if (selectedRestaurantId) {
        if (overrides.length > 0) {
          // Only send if there are actual overrides
          console.log('Sending user permission overrides:', {
            userId,
            restaurantId: selectedRestaurantId,
            overrides,
          });
          await saveUserPermissionOverridesMutation.mutateAsync({
            userId,
            restaurantId: selectedRestaurantId,
            overrides,
          });
          toast.success('User permissions updated successfully!');
        } else {
          console.log('No permission overrides to save. Skipping mutation.');
          toast.success('User permissions updated successfully (no changes applied).'); // Provide feedback
        }
      } else {
        toast.error('Restaurant ID is missing. Cannot save user permission overrides.');
      }

      queryClient.invalidateQueries('adminUsers');
      queryClient.invalidateQueries(['userRoles', userId, selectedRestaurantId]);
      queryClient.invalidateQueries(['userPermissionOverrides', userId, selectedRestaurantId]);
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    }
  };

  if (isLoadingUsers || isLoadingAllRoles || isLoadingPermissionTree || isLoadingUserOverrides)
    return <CircularProgress />;
  if (isErrorUsers || isErrorAllRoles || isErrorPermissionTree || isErrorUserOverrides)
    return <Alert severity="error">Error loading data.</Alert>;
  if (!targetUser) return <Alert severity="warning">User not found.</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Edit User: {targetUser.name}
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
                    label="User Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => <TextField {...field} label="Phone" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} label="Role">
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {allRoles?.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
          {permissionTree?.modules?.length > 0 && Object.keys(selectedPermissions).length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                User Permissions
              </Typography>
              <PermissionTree
                availableModules={permissionTree?.modules}
                selectedPermissions={selectedPermissions}
                onPermissionChange={handlePermissionChange}
                disabled={!can('admin:users', 'manage_permissions')}
              />
            </Box>
          )}
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                saveUserMutation.isLoading ||
                assignUserRoleMutation.isLoading ||
                removeUserRoleMutation.isLoading ||
                saveUserPermissionOverridesMutation.isLoading ||
                !can('admin:users', 'update')
              }
            >
              Save Changes
            </Button>
            <Button variant="outlined" onClick={() => navigate('/admin/users')}>
              Cancel
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserEditPage;
