import React from 'react';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useGetPermissionTree, useSetEntitlement } from './api/iamQueries';

const EntitlementManagement = () => {
  const { selectedRestaurantId } = useAuth(); // Use selectedRestaurantId from AuthContext
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  // Fetch the full permission tree which includes entitlement status
  const {
    data: permissionTree,
    isLoading,
    isError,
    error,
  } = useGetPermissionTree(selectedRestaurantId, {
    enabled: !!selectedRestaurantId,
  });

  const setEntitlementMutation = useSetEntitlement();

  const handleToggleEntitlement = async (entityId, entityType, currentStatus) => {
    if (!can('entitlements', 'update')) {
      toast.error('You do not have permission to update entitlements.');
      return;
    }

    const newStatus = currentStatus === 'active' ? 'locked' : 'active';

    try {
      await setEntitlementMutation.mutateAsync({
        restaurantId: selectedRestaurantId,
        entityType,
        entityId,
        status: newStatus,
        source: 'manual_admin', // Or a more specific source
        metadata: { updatedBy: 'admin_user' },
      });
      toast.success('Entitlement updated successfully!');
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]); // Invalidate cache
    } catch (err) {
      console.error('Failed to toggle entitlement status:', err);
      toast.error(err.response?.data?.message || 'Failed to update entitlement.');
    }
  };

  if (!selectedRestaurantId) {
    return <div>Please select a restaurant to manage entitlements.</div>;
  }

  if (isLoading) {
    return <div>Loading entitlements...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Manage Restaurant Entitlements</h1>
      <p>Restaurant ID: {selectedRestaurantId}</p>

      <table>
        <thead>
          <tr>
            <th>Module Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {permissionTree?.modules.map((module) => (
            <React.Fragment key={module.id}>
              <tr>
                <td>
                  <strong>{module.name}</strong>
                </td>
                <td>{module.status}</td>
                <td>
                  <button
                    onClick={() => handleToggleEntitlement(module.id, 'module', module.status)}
                    disabled={setEntitlementMutation.isLoading || !can('entitlements', 'update')}
                  >
                    {module.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
              {module.submodules.map((submodule) => (
                <tr key={submodule.id}>
                  <td>&nbsp;&nbsp;&nbsp;&nbsp;{submodule.name}</td>
                  <td>{submodule.status}</td>
                  <td>
                    <button
                      onClick={() =>
                        handleToggleEntitlement(submodule.id, 'submodule', submodule.status)
                      }
                      disabled={setEntitlementMutation.isLoading || !can('entitlements', 'update')}
                    >
                      {submodule.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {module.features.map((feature) => (
                <tr key={feature.id}>
                  <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{feature.name}</td>
                  <td>{feature.status}</td>
                  <td>
                    <button
                      onClick={() => handleToggleEntitlement(feature.id, 'feature', feature.status)}
                      disabled={setEntitlementMutation.isLoading || !can('entitlements', 'update')}
                    >
                      {feature.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EntitlementManagement;
