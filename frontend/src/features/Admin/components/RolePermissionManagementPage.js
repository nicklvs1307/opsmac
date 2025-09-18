import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useQueryClient } from 'react-query';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import { usePermissions } from '../../../hooks/usePermissions';
import toast from 'react-hot-toast';

import {
  useGetRoles,
  useGetPermissionTree,
  useGetRolePermissions,
  useSetRolePermissions,
} from '@/features/IAM/api/iamQueries';
import PermissionTree from '@/features/Admin/components/PermissionTree';
import { usePermissionTreeLogic } from '../hooks/usePermissionTreeLogic';

const RolePermissionManagementPage = () => {
  const { selectedRestaurantId } = useAuth();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const { selectedPermissions, handlePermissionChange } = usePermissionTreeLogic(permissionTree, fetchedRolePermissions, 'role_permissions');

  const {
    data: roles,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
  } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });
  const {
    data: fetchedRolePermissions,
    isLoading: isLoadingRolePermissions,
    isError: isErrorRolePermissions,
  } = useGetRolePermissions(selectedRoleId, selectedRestaurantId, {
    enabled: !!selectedRoleId && !!selectedRestaurantId,
  });

  const setRolePermissionsMutation = useSetRolePermissions();



  const handleSave = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role.');
      return;
    }

    const permissionsToSave = [];
    permissionTree.modules?.forEach((module) => {
      module.submodules?.forEach((submodule) => {
        submodule.features?.forEach((feature) => {
          const actions =
            selectedPermissions[module.id]?.submodules[submodule.id]?.features[feature.id]
              ?.actions || {};
          Object.keys(actions).forEach((actionId) => {
            permissionsToSave.push({ featureId: feature.id, actionId, allowed: actions[actionId] });
          });
        });
      });
    });

    try {
      await setRolePermissionsMutation.mutateAsync({
        roleId: selectedRoleId,
        restaurantId: selectedRestaurantId,
        permissions: permissionsToSave,
      });
      toast.success('Permissions updated successfully!');
      queryClient.invalidateQueries(['rolePermissions', selectedRoleId, selectedRestaurantId]);
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update permissions.');
    }
  };

  if (isLoadingRoles || isLoadingPermissionTree || isLoadingRolePermissions)
    return <CircularProgress />;
  if (isErrorRoles || isErrorPermissionTree || isErrorRolePermissions)
    return <Alert severity="error">Error loading permission data.</Alert>;

  const selectedRole = roles?.find((r) => r.id === selectedRoleId);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Role Permission Management
      </Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Role</InputLabel>
        <Select
          value={selectedRoleId}
          label="Select Role"
          onChange={(e) => setSelectedRoleId(e.target.value)}
        >
          {roles?.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedRoleId && permissionTree && selectedRole && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Assign Permissions for {selectedRole.name}
          </Typography>
          <PermissionTree
            availableModules={permissionTree.modules}
            selectedPermissions={selectedPermissions}
            onPermissionChange={handlePermissionChange}
            disabled={!can('role_permissions', 'update')}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={setRolePermissionsMutation.isLoading || !can('role_permissions', 'update')}
            sx={{ mt: 3 }}
          >
            {setRolePermissionsMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Save Permissions'
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default RolePermissionManagementPage;
