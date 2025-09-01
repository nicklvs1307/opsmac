import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  useGetPermissionTree,
  useGetUserPermissionOverrides,
  useSetUserPermissionOverrides,
} from './api/iamQueries';
import { fetchUsers } from '@/services/adminService'; // To fetch target user details

const UserPermissionOverrides = () => {
  const { restaurantId, userId } = useParams();
  const { selectedRestaurantId } = useAuth(); // Use selectedRestaurantId from AuthContext
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  // Fetch all users to find the specific target user
  const {
    data: allUsers,
    isLoading: isLoadingAllUsers,
    isError: isErrorAllUsers,
    error: errorAllUsers,
  } = queryClient.getQueryData('adminUsers')
    ? {
        data: queryClient.getQueryData('adminUsers'),
        isLoading: false,
        isError: false,
        error: null,
      }
    : queryClient.fetchQuery('adminUsers', fetchUsers);
  const targetUser = allUsers?.find((u) => u.id === userId);

  // Fetch permission tree (features and actions catalog)
  const {
    data: permissionTree,
    isLoading: isLoadingPermissionTree,
    isError: isErrorPermissionTree,
    error: errorPermissionTree,
  } = useGetPermissionTree(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  // Fetch current user overrides
  const {
    data: fetchedUserOverrides,
    isLoading: isLoadingUserOverrides,
    isError: isErrorUserOverrides,
    error: errorUserOverrides,
  } = useGetUserPermissionOverrides(userId, selectedRestaurantId, {
    enabled: !!userId && !!selectedRestaurantId,
  });

  const [userOverrides, setUserOverrides] = useState({}); // { featureId: { actionId: allowed } }

  // Mutation for saving user permission overrides
  const setUserPermissionOverridesMutation = useSetUserPermissionOverrides();

  useEffect(() => {
    if (fetchedUserOverrides) {
      const currentOverrides = {};
      fetchedUserOverrides.forEach((uo) => {
        if (!currentOverrides[uo.featureId]) {
          // Use camelCase
          currentOverrides[uo.featureId] = {};
        }
        currentOverrides[uo.featureId][uo.actionId] = uo.allowed; // Use camelCase
      });
      setUserOverrides(currentOverrides);
    }
  }, [fetchedUserOverrides]);

  const handleOverrideChange = (featureId, actionId, allowed) => {
    setUserOverrides((prev) => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [actionId]: allowed,
      },
    }));
  };

  const handleSaveOverrides = async () => {
    try {
      const overridesToSave = [];
      // Iterate through the permissionTree structure to build the overrides array
      permissionTree.modules.forEach((module) => {
        module.features.forEach((feature) => {
          feature.actions.forEach((action) => {
            const isActionSelected = userOverrides[feature.id]?.[action.id];
            if (isActionSelected !== undefined) {
              // Only add if explicitly set
              overridesToSave.push({
                featureId: feature.id,
                actionId: action.id,
                allowed: isActionSelected,
              });
            }
          });
        });
        module.submodules.forEach((submodule) => {
          submodule.features.forEach((feature) => {
            feature.actions.forEach((action) => {
              const isActionSelected = userOverrides[feature.id]?.[action.id];
              if (isActionSelected !== undefined) {
                // Only add if explicitly set
                overridesToSave.push({
                  featureId: feature.id,
                  actionId: action.id,
                  allowed: isActionSelected,
                });
              }
            });
          });
        });
      });

      await setUserPermissionOverridesMutation.mutateAsync({
        userId,
        restaurantId: selectedRestaurantId,
        overrides: overridesToSave,
      });
      toast.success('User overrides updated successfully!');
      queryClient.invalidateQueries(['userPermissionOverrides', userId, selectedRestaurantId]);
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]); // Invalidate permission tree
    } catch (err) {
      console.error('Failed to save user overrides:', err);
      toast.error(err.response?.data?.message || 'Failed to save user overrides.');
    }
  };

  const allFeatures =
    permissionTree?.modules.flatMap((m) => m.submodules.flatMap((sm) => sm.features)) || [];
  const allActions =
    permissionTree?.modules.flatMap((m) =>
      m.submodules.flatMap((sm) => sm.features.flatMap((f) => f.actions))
    ) || [];

  if (!restaurantId || !userId) {
    return <div>Invalid URL. Missing restaurant ID or user ID.</div>;
  }

  if (isLoadingAllUsers || isLoadingPermissionTree || isLoadingUserOverrides) {
    return <div>Loading user overrides...</div>;
  }

  if (isErrorAllUsers || isErrorPermissionTree || isErrorUserOverrides) {
    return (
      <div>
        Error:{' '}
        {errorAllUsers?.message || errorPermissionTree?.message || errorUserOverrides?.message}
      </div>
    );
  }

  if (!targetUser) {
    return <div>User not found.</div>;
  }

  return (
    <div>
      <h1>
        Manage Overrides for User: {targetUser.name} ({targetUser.email})
      </h1>
      <p>Restaurant ID: {restaurantId}</p>

      {can('user_overrides', 'update') && (
        <button
          onClick={handleSaveOverrides}
          disabled={setUserPermissionOverridesMutation.isLoading}
        >
          Save Overrides
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
                    checked={!!userOverrides[feature.id]?.[action.id]}
                    onChange={(e) => handleOverrideChange(feature.id, action.id, e.target.checked)}
                    disabled={
                      !can('user_overrides', 'update') ||
                      setUserPermissionOverridesMutation.isLoading
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

export default UserPermissionOverrides;
