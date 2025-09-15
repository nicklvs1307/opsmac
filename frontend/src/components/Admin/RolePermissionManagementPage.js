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
import usePermissions from '@/hooks/usePermissions';
import toast from 'react-hot-toast';

import {
  useGetRoles,
  useGetPermissionTree,
  useGetRolePermissions,
  useSetRolePermissions,
} from '@/features/IAM/api/iamQueries';
import PermissionTree from '@/components/Admin/PermissionTree'; // Import the dumb component

const RolePermissionManagementPage = () => {
  const { selectedRestaurantId } = useAuth();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState({});

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

  const updateParentStates = useCallback((permissions, tree) => {
    if (!tree || !tree.modules) return permissions;
    const newSelected = JSON.parse(JSON.stringify(permissions));

    tree.modules.forEach((module) => {
      let moduleChecked = true;
      let moduleIndeterminate = false;

      module.submodules.forEach((submodule) => {
        let submoduleChecked = true;
        let submoduleIndeterminate = false;

        submodule.features.forEach((feature) => {
          const featureActions =
            newSelected[module.id]?.submodules[submodule.id]?.features[feature.id]?.actions || {};
          const actionKeys = Object.keys(featureActions);
          const checkedCount = actionKeys.filter((key) => featureActions[key]).length;

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
    if (fetchedRolePermissions && permissionTree) {
      // Create a map for quick lookup of existing role permissions
      const rolePermMap = new Map();
      fetchedRolePermissions.forEach((rp) => {
        rolePermMap.set(`${rp.featureId}-${rp.actionId}`, rp.allowed);
      });

      let initialSelected = {};
      permissionTree.modules?.forEach((module) => {
        initialSelected[module.id] = {
          checked: false, // Will be updated by updateParentStates
          indeterminate: false, // Will be updated by updateParentStates
          submodules: module.submodules?.reduce((accSub, submodule) => {
            accSub[submodule.id] = {
              checked: false, // Will be updated by updateParentStates
              indeterminate: false, // Will be updated by updateParentStates
              features: submodule.features?.reduce((accFeat, feature) => {
                accFeat[feature.id] = {
                  checked: false, // Will be updated by updateParentStates
                  indeterminate: false, // Will be updated by updateParentStates
                  actions: feature.actions?.reduce((accAct, action) => {
                    // Default to false if not explicitly allowed in rolePermMap
                    accAct[action.id] = rolePermMap.get(`${feature.id}-${action.id}`) || false;
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
  }, [fetchedRolePermissions, permissionTree, updateParentStates]);

  const handlePermissionChange = (path, checked) => {
    let newSelected = JSON.parse(JSON.stringify(selectedPermissions));
    const [moduleId, submoduleId, featureId, actionId] = path;

    const setChildrenState = (branch, value) => {
      branch.checked = value;
      if (branch.actions) {
        Object.keys(branch.actions).forEach((key) => {
          branch.actions[key] = value;
        });
      }
      if (branch.features) {
        Object.values(branch.features).forEach((feat) => setChildrenState(feat, value));
      }
      if (branch.submodules) {
        Object.values(branch.submodules).forEach((sub) => setChildrenState(sub, value));
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
