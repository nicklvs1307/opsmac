import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  useGetRoles,
  useGetPermissionTree,
  useGetRolePermissions,
  useSetRolePermissions,
} from '@/features/IAM/api/iamQueries';

const RolePermissions = () => {
  const { restaurantId, roleId } = useParams();
  const { selectedRestaurantId } = useAuth(); // Use selectedRestaurantId from AuthContext
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  // Fetch all roles to find the specific role details
  const {
    data: allRoles,
    isLoading: isLoadingAllRoles,
    isError: isErrorAllRoles,
    error: errorAllRoles,
  } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });
  const role = allRoles?.find((r) => r.id === roleId);

  // Fetch permission tree (features and actions catalog)
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
    error: errorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  // Fetch current role permissions
  const {
    data: fetchedRolePermissions,
    isLoading: isLoadingRolePermissions,
    isError: isErrorRolePermissions,
    error: errorRolePermissions,
  } = useGetRolePermissions(roleId, selectedRestaurantId, {
    enabled: !!roleId && !!selectedRestaurantId,
  });

  const [rolePermissions, setRolePermissions] = useState({}); // { featureId: { actionId: allowed } }

  // Mutation for saving role permissions
  const setRolePermissionsMutation = useSetRolePermissions();

  useEffect(() => {
    if (fetchedRolePermissions) {
      const currentPermissions = {};
      fetchedRolePermissions.forEach((rp) => {
        if (!currentPermissions[rp.featureId]) {
          // Use camelCase
          currentPermissions[rp.featureId] = {};
        }
        currentPermissions[rp.featureId][rp.actionId] = rp.allowed; // Use camelCase
      });
      setRolePermissions(currentPermissions);
    }
  }, [fetchedRolePermissions]);

  const handlePermissionChange = (featureId, actionId, allowed) => {
    setRolePermissions((prev) => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [actionId]: allowed,
      },
    }));
  };

  const handleSavePermissions = async () => {
    try {
      const permissionsToSave = [];
      for (const featureId in rolePermissions) {
        for (const actionId in rolePermissions[featureId]) {
          permissionsToSave.push({
            featureId,
            actionId: parseInt(actionId), // Ensure actionId is integer
            allowed: rolePermissions[featureId][actionId],
          });
        }
      }

      await setRolePermissionsMutation.mutateAsync({
        roleId,
        restaurantId: selectedRestaurantId,
        permissions: permissionsToSave,
      });
      toast.success('Permissions updated successfully!');
      queryClient.invalidateQueries(['rolePermissions', roleId, selectedRestaurantId]); // Invalidate current role permissions
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]); // Invalidate permission tree
    } catch (err) {
      console.error('Failed to save permissions:', err);
      toast.error(err.response?.data?.message || 'Failed to save permissions.');
    }
  };

  const allFeatures =
    permissionTree?.modules.flatMap((m) => m.submodules.flatMap((sm) => sm.features)) || [];
  const allActions =
    permissionTree?.modules.flatMap((m) =>
      m.submodules.flatMap((sm) => sm.features.flatMap((f) => f.actions))
    ) || [];

  if (!restaurantId || !roleId) {
    return <div>Invalid URL. Missing restaurant ID or role ID.</div>;
  }

  if (isLoadingAllRoles || isLoadingPermissionTree || isLoadingRolePermissions) {
    return <div>Loading role permissions...</div>;
  }

  if (isErrorAllRoles || isErrorPermissionTree || isErrorRolePermissions) {
    return (
      <div>
        Error:{' '}
        {errorAllRoles?.message || errorPermissionTree?.message || errorRolePermissions?.message}
      </div>
    );
  }

  if (!role) {
    return <div>Role not found.</div>;
  }

  return (
    <div>
      <h1>
        Manage Permissions for Role: {role.name} ({role.key})
      </h1>
      <p>Restaurant ID: {restaurantId}</p>

      {can('admin:permissions', 'update') && (
        <button onClick={handleSavePermissions} disabled={setRolePermissionsMutation.isLoading}>
          Save Permissions
        </button>
      )}

      <table>
        <thead>
          <tr>
            <th>Feature</th>
            {allActions.map((action) => (
              <th key={action.id}>{action.key}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature) => (
            <tr key={feature.id}>
              <td>
                {feature.name} ({feature.key})
              </td>
              {allActions.map((action) => (
                <td key={action.id}>
                  <input
                    type="checkbox"
                    checked={!!rolePermissions[feature.id]?.[action.id]}
                    onChange={(e) =>
                      handlePermissionChange(feature.id, action.id, e.target.checked)
                    }
                    disabled={
                      !can('admin:permissions', 'update') || setRolePermissionsMutation.isLoading
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RolePermissions;
