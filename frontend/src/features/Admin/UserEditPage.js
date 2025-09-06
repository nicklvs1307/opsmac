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
import {
  fetchUsers,
  saveUser,
} from '@/services/adminService';
import {
  useGetPermissionTree,
  useGetRoles,
  useGetUserPermissionOverrides,
  useSetUserPermissionOverrides,
  useAssignUserRole,
  useRemoveUserRole,
} from '@/features/IAM/api/iamQueries';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import PermissionTree from '@/components/Admin/PermissionTree';

const UserEditPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedRestaurantId } = useAuth();
  const { can } = usePermissions();

  const { data: allUsers, isLoading: isLoadingUsers, isError: isErrorUsers } = useQuery('adminUsers', fetchUsers);
  const targetUser = allUsers?.find((u) => u.id === userId);

  const { data: allRoles, isLoading: isLoadingAllRoles, isError: isErrorAllRoles } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });
  const { data: permissionTree, isLoading: isLoadingPermissionTree, isError: isErrorPermissionTree } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  console.log('UserEditPage Debug: permissionTree', permissionTree);
  console.log('UserEditPage Debug: can("admin:users", "manage_permissions")', can('admin:users', 'manage_permissions'));
  const { data: fetchedUserOverrides, isLoading: isLoadingUserOverrides, isError: isErrorUserOverrides } = useGetUserPermissionOverrides(userId, selectedRestaurantId, {
    enabled: !!userId && !!selectedRestaurantId,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm();
  const saveUserMutation = useMutation(saveUser, { onSuccess: () => queryClient.invalidateQueries('adminUsers') });
  const assignUserRoleMutation = useAssignUserRole();
  const removeUserRoleMutation = useRemoveUserRole();
  const saveUserPermissionOverridesMutation = useSetUserPermissionOverrides();

  const [selectedPermissions, setSelectedPermissions] = useState({});

  useEffect(() => {
    if (targetUser) {
      reset({ name: targetUser.name || '', email: targetUser.email || '', phone: targetUser.phone || '', roleId: targetUser.roles?.[0]?.id || '' });
    }
  }, [targetUser, reset]);

  const updateParentStates = useCallback((permissions, tree) => {
    if (!tree || !tree.modules) return permissions;
    const newSelected = JSON.parse(JSON.stringify(permissions));

    tree.modules.forEach(module => {
      let moduleChecked = true;
      let moduleIndeterminate = false;

      module.submodules.forEach(submodule => {
        let submoduleChecked = true;
        let submoduleIndeterminate = false;

        submodule.features.forEach(feature => {
          const featureActions = newSelected[module.id]?.submodules[submodule.id]?.features[feature.id]?.actions || {};
          const actionKeys = Object.keys(featureActions);
          const checkedCount = actionKeys.filter(key => featureActions[key]).length;

          const featureState = newSelected[module.id].submodules[submodule.id].features[feature.id];
          featureState.checked = actionKeys.length > 0 && checkedCount === actionKeys.length;
          featureState.indeterminate = checkedCount > 0 && checkedCount < actionKeys.length;

          if (!featureState.checked) submoduleChecked = false;
          if (featureState.indeterminate || featureState.checked) submoduleIndeterminate = true;
        });

        const subState = newSelected[module.id].submodules[submodule.id];
        subState.checked = submoduleChecked;
        subState.indeterminate = !submoduleChecked && submoduleIndeterminate;

        if (!subState.checked) moduleChecked = false;
        if (subState.indeterminate || subState.checked) moduleIndeterminate = true;
      });

      const modState = newSelected[module.id];
      modState.checked = moduleChecked;
      modState.indeterminate = !moduleChecked && moduleIndeterminate;
    });

    return newSelected;
  }, []);

  useEffect(() => {
    if (fetchedUserOverrides && permissionTree) {
      let initialSelected = {};
      permissionTree.modules?.forEach(module => {
        initialSelected[module.id] = {
          checked: false,
          indeterminate: false,
          submodules: module.submodules?.reduce((accSub, submodule) => {
            accSub[submodule.id] = {
              checked: false,
              indeterminate: false,
              features: submodule.features?.reduce((accFeat, feature) => {
                accFeat[feature.id] = {
                  checked: false,
                  indeterminate: false,
                  actions: feature.actions?.reduce((accAct, action) => {
                    const override = fetchedUserOverrides.find(o => o.featureId === feature.id && o.actionId === action.id);
                    accAct[action.id] = override ? override.allowed : false;
                    return accAct;
                  }, {}),
                };
                return accFeat;
              }, {}),
            };
            return accSub;
          }, {}),
        };
      });
      const updatedState = updateParentStates(initialSelected, permissionTree);
      setSelectedPermissions(updatedState);
    }
  }, [fetchedUserOverrides, permissionTree, updateParentStates]);

  const handlePermissionChange = (path, checked) => {
    let newSelected = JSON.parse(JSON.stringify(selectedPermissions));
    const [moduleId, submoduleId, featureId, actionId] = path;

    const setChildrenState = (branch, value) => {
      branch.checked = value;
      if (branch.actions) {
        Object.keys(branch.actions).forEach(key => { branch.actions[key] = value; });
      }
      if (branch.features) {
        Object.values(branch.features).forEach(feat => setChildrenState(feat, value));
      }
      if (branch.submodules) {
        Object.values(branch.submodules).forEach(sub => setChildrenState(sub, value));
      }
    };

    if (actionId) {
      newSelected[moduleId].submodules[submoduleId].features[featureId].actions[actionId] = checked;
    } else if (featureId) {
      setChildrenState(newSelected[moduleId].submodules[submoduleId].features[featureId], checked);
    } else if (submoduleId) {
      setChildrenState(newSelected[moduleId].submodules[submoduleId], checked);
    } else if (moduleId) {
      setChildrenState(newSelected[moduleId], checked);
    }

    const updatedState = updateParentStates(newSelected, permissionTree);
    setSelectedPermissions(updatedState);
  };

  const onSubmit = async (data) => {
    try {
      await saveUserMutation.mutateAsync({ ...data, userId });
      toast.success('User details updated successfully!');

      const currentRoleId = targetUser?.roles?.[0]?.id;
      const newRoleId = data.roleId;
      if (currentRoleId !== newRoleId) {
        if (currentRoleId) await removeUserRoleMutation.mutateAsync({ userId, restaurantId: selectedRestaurantId, roleId: currentRoleId });
        if (newRoleId) await assignUserRoleMutation.mutateAsync({ userId, restaurantId: selectedRestaurantId, roleId: newRoleId });
        toast.success('User role updated successfully!');
      }

      const overrides = [];
      permissionTree.modules?.forEach(module => {
        module.submodules?.forEach(submodule => {
          submodule.features?.forEach(feature => {
            const actions = selectedPermissions[module.id]?.submodules[submodule.id]?.features[feature.id]?.actions || {};
            Object.keys(actions).forEach(actionId => {
              overrides.push({ featureId: feature.id, actionId, allowed: actions[actionId] });
            });
          });
        });
      });

      await saveUserPermissionOverridesMutation.mutateAsync({ userId, restaurantId: selectedRestaurantId, overrides });
      toast.success('User permissions updated successfully!');

      queryClient.invalidateQueries('adminUsers');
      queryClient.invalidateQueries(['userRoles', userId, selectedRestaurantId]);
      queryClient.invalidateQueries(['userPermissionOverrides', userId, selectedRestaurantId]);
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]);

    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred.');
    }
  };

  if (isLoadingUsers || isLoadingAllRoles || isLoadingPermissionTree || isLoadingUserOverrides) return <CircularProgress />;
  if (isErrorUsers || isErrorAllRoles || isErrorPermissionTree || isErrorUserOverrides) return <Alert severity="error">Error loading data.</Alert>;
  if (!targetUser) return <Alert severity="warning">User not found.</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Edit User: {targetUser.name}</Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}><Controller name="name" control={control} rules={{ required: 'Name is required' }} render={({ field }) => <TextField {...field} label="User Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="email" control={control} rules={{ required: 'Email is required' }} render={({ field }) => <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="phone" control={control} render={({ field }) => <TextField {...field} label="Phone" fullWidth />} /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Controller name="roleId" control={control} render={({ field }) => (
                  <Select {...field} label="Role">
                    <MenuItem value=""><em>None</em></MenuItem>
                    {allRoles?.map(role => <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>)}
                  </Select>
                )} />
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>User Permissions</Typography>
            <PermissionTree availableModules={permissionTree?.modules} selectedPermissions={selectedPermissions} onPermissionChange={handlePermissionChange} disabled={!can('admin_users', 'manage_permissions')} />
          </Box>
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button type="submit" variant="contained" color="primary" disabled={saveUserMutation.isLoading || assignUserRoleMutation.isLoading || removeUserRoleMutation.isLoading || saveUserPermissionOverridesMutation.isLoading || !can('admin:users', 'edit')}>Save Changes</Button>
            <Button variant="outlined" onClick={() => navigate('/admin/users')}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserEditPage;
