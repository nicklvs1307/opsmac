import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { useGetRoles, useAssignUserRole, useRemoveUserRole } from './api/iamQueries';
import { fetchUsers } from '@/services/adminService'; // To fetch users with their roles

const UserRoleManagement = () => {
  const { selectedRestaurantId } = useAuth(); // Use selectedRestaurantId from AuthContext
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  // Fetch all users (assuming fetchUsers now includes role data)

  // Fetch all users (assuming fetchUsers now includes role data)
  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: errorUsers,
  } = queryClient.getQueryData('adminUsers')
    ? {
        data: queryClient.getQueryData('adminUsers'),
        isLoading: false,
        isError: false,
        error: null,
      }
    : queryClient.fetchQuery('adminUsers', fetchUsers);

  // Fetch all roles for the selected restaurant
  const {
    data: roles,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
    error: errorRoles,
  } = useGetRoles(selectedRestaurantId, { enabled: !!selectedRestaurantId });

  const assignUserRoleMutation = useAssignUserRole();
  const removeUserRoleMutation = useRemoveUserRole();

  const handleRoleChange = async (userId, newRoleId) => {
    if (!can('admin:users', 'update')) {
      toast.error('You do not have permission to update user roles.');
      return;
    }

    const userToUpdate = users.find((u) => u.id === userId);
    const currentRoleId = userToUpdate?.role?.id; // Assuming user object has role.id

    if (currentRoleId === newRoleId) {
      return; // No change
    }

    try {
      if (currentRoleId) {
        await removeUserRoleMutation.mutateAsync({
          userId,
          restaurantId: selectedRestaurantId,
          roleId: currentRoleId,
        });
      }
      if (newRoleId) {
        await assignUserRoleMutation.mutateAsync({
          userId,
          restaurantId: selectedRestaurantId,
          roleId: newRoleId,
        });
      }
      toast.success('User role updated successfully!');
      queryClient.invalidateQueries(['adminUsers']); // Invalidate users list to refetch with new roles
      queryClient.invalidateQueries(['userRoles', userId, selectedRestaurantId]); // Invalidate user specific roles
      queryClient.invalidateQueries(['permissionTree', selectedRestaurantId]); // Invalidate permission tree
    } catch (err) {
      console.error('Failed to update user role:', err);
      toast.error(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  // Note: restaurantId from useParams is not used directly in the component logic
  // as selectedRestaurantId from useAuth is preferred for consistency.
  // However, it's part of the URL path, so it's still relevant for routing.

  if (isLoadingUsers || isLoadingRoles) {
    return <div>Loading user roles...</div>;
  }

  if (isErrorUsers || isErrorRoles) {
    return <div>Error: {errorUsers?.message || errorRoles?.message}</div>;
  }

  return (
    <div>
      <h1>Manage User Roles for Restaurant: {selectedRestaurantId}</h1>

      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Current Role</th>
            <th>Assign New Role</th>
            <th>Overrides</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.roles && u.roles.length > 0 ? u.roles[0].name : 'N/A'}</td>
              <td>
                <select
                  value={u.roles && u.roles.length > 0 ? u.roles[0].id : ''} // Use u.roles[0].id
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={
                    isLoadingUsers ||
                    isLoadingRoles ||
                    assignUserRoleMutation.isLoading ||
                    removeUserRoleMutation.isLoading ||
                    !can('admin:users', 'update')
                  }
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                {can('admin:users', 'read') && (
                  <Link to={`/admin/iam/${selectedRestaurantId}/users/${u.id}/overrides`}>
                    Manage Overrides
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserRoleManagement;
