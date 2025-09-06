import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient, useQuery } from 'react-query';
import usePermissions from '@/hooks/usePermissions';
import toast from 'react-hot-toast';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  useGetPermissionTree,
  useGetUserPermissionOverrides,
  useSetUserPermissionOverrides,
} from './api/iamQueries';
import { fetchUsers } from '@/services/adminService';
import PermissionTree from '@/components/Admin/PermissionTree';

const UserPermissionOverridesPage = () => {
  const { restaurantId, userId } = useParams();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [selectedPermissions, setSelectedPermissions] = useState({});

  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useQuery('adminUsers', fetchUsers);
  const { data: permissionTree, isLoading: isLoadingPermissionTree, isError: isErrorPermissionTree } = useGetPermissionTree(restaurantId, { enabled: !!restaurantId });
  const { data: fetchedUserOverrides, isLoading: isLoadingUserOverrides, isError: isErrorUserOverrides } = useGetUserPermissionOverrides(userId, restaurantId, {
    enabled: !!userId && !!restaurantId,
  });

  const setUserPermissionOverridesMutation = useSetUserPermissionOverrides();

  const targetUser = users?.find(u => u.id === userId);

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
      // Create a map for quick lookup of existing user overrides
      const userOverrideMap = new Map();
      fetchedUserOverrides.forEach(override => {
        userOverrideMap.set(`${override.featureId}-${override.actionId}`, override.allowed);
      });

      let initialSelected = {};
      permissionTree.modules?.forEach(module => {
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
                    // Default to false if not explicitly allowed in userOverrideMap
                    accAct[action.id] = userOverrideMap.get(`${feature.id}-${action.id}`) || false;
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

  const handleSave = async () => {
    const overridesToSave = [];
    permissionTree.modules?.forEach(module => {
      module.submodules?.forEach(submodule => {
        submodule.features?.forEach(feature => {
          const actions = selectedPermissions[module.id]?.submodules[submodule.id]?.features[feature.id]?.actions || {};
          Object.keys(actions).forEach(actionId => {
            overridesToSave.push({ featureId: feature.id, actionId, allowed: actions[actionId] });
          });
        });
      });
    });

    try {
      await setUserPermissionOverridesMutation.mutateAsync({
        userId,
        restaurantId,
        overrides: overridesToSave,
      });
      toast.success('User permission overrides updated successfully!');
      queryClient.invalidateQueries(['userPermissionOverrides', userId, restaurantId]);
      queryClient.invalidateQueries(['permissionTree', restaurantId]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user overrides.');
    }
  };

  if (isLoadingUsers || isLoadingPermissionTree || isLoadingUserOverrides) return <CircularProgress />;
  if (isErrorUsers || isErrorPermissionTree || isErrorUserOverrides) return <Alert severity="error">Error loading data.</Alert>;
  if (!targetUser) return <Alert severity="error">User not found.</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Manage Permission Overrides for {targetUser.name}</Typography>
      {permissionTree && (
        <Box sx={{ mt: 4 }}>
          <PermissionTree
            availableModules={permissionTree.modules}
            selectedPermissions={selectedPermissions}
            onPermissionChange={handlePermissionChange}
            disabled={!can('user_overrides', 'update')}
          />
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={setUserPermissionOverridesMutation.isLoading || !can('user_overrides', 'update')}
            sx={{ mt: 3 }}
          >
            {setUserPermissionOverridesMutation.isLoading ? <CircularProgress size={24} /> : 'Save Overrides'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default UserPermissionOverridesPage;