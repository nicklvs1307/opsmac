import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/contexts/AuthContext';
import usePermissions from '@/hooks/usePermissions';
import { useGetRoles, useCreateRole, useDeleteRole, useUpdateRole } from './api/iamQueries';
import { useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';

const RoleManagement = () => {
  const { selectedRestaurantId } = useAuth();
  const { can } = usePermissions();
  const queryClient = useQueryClient();

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleKey, setNewRoleKey] = useState('');
  const [isSystemRole, setIsSystemRole] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // State for role being edited

  const {
    data: roles,
    isLoading,
    isError,
    error,
  } = useGetRoles(selectedRestaurantId, {
    enabled: !!selectedRestaurantId,
  });

  const createRoleMutation = useCreateRole();
  const deleteRoleMutation = useDeleteRole();
  const updateRoleMutation = useUpdateRole();

  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName || !newRoleKey) {
      toast.error('Role name and key are required.');
      return;
    }
    try {
      await createRoleMutation.mutateAsync({
        restaurantId: selectedRestaurantId,
        name: newRoleName,
        key: newRoleKey,
        isSystem: isSystemRole, // Use camelCase
      });
      setNewRoleName('');
      setNewRoleKey('');
      setIsSystemRole(false);
      toast.success('Role created successfully!');
      queryClient.invalidateQueries(['roles', selectedRestaurantId]); // Invalidate cache
    } catch (err) {
      console.error('Failed to create role:', err);
      toast.error(err.response?.data?.message || 'Failed to create role.');
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await deleteRoleMutation.mutateAsync({ roleId, restaurantId: selectedRestaurantId });
      toast.success('Role deleted successfully!');
      queryClient.invalidateQueries(['roles', selectedRestaurantId]); // Invalidate cache
    } catch (err) {
      console.error('Failed to delete role:', err);
      toast.error(err.response?.data?.message || 'Failed to delete role.');
    }
  };

  const handleEditClick = (role) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setNewRoleKey(role.key);
    setIsSystemRole(role.isSystem); // Use camelCase
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingRole || !newRoleName) {
      toast.error('Role name is required.');
      return;
    }
    try {
      await updateRoleMutation.mutateAsync({
        roleId: editingRole.id,
        restaurantId: selectedRestaurantId,
        name: newRoleName,
      });
      setEditingRole(null);
      setNewRoleName('');
      setNewRoleKey('');
      setIsSystemRole(false);
      toast.success('Role updated successfully!');
      queryClient.invalidateQueries(['roles', selectedRestaurantId]); // Invalidate cache
    } catch (err) {
      console.error('Failed to update role:', err);
      toast.error(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setNewRoleName('');
    setNewRoleKey('');
    setIsSystemRole(false);
  };

  if (!selectedRestaurantId) {
    return <div>Please select a restaurant to manage roles.</div>;
  }

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Manage Roles for {selectedRestaurantId}</h1>

      {can('roles', 'create') && (
        <form onSubmit={editingRole ? handleUpdateRole : handleCreateRole}>
          <h3>{editingRole ? 'Edit Role' : 'Create New Role'}</h3>
          <input
            type="text"
            placeholder="Role Name"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            required
          />
          {!editingRole && ( // Key is only editable on creation
            <input
              type="text"
              placeholder="Role Key (e.g., admin, manager)"
              value={newRoleKey}
              onChange={(e) => setNewRoleKey(e.target.value)}
              required
            />
          )}
          <label>
            <input
              type="checkbox"
              checked={isSystemRole}
              onChange={(e) => setIsSystemRole(e.target.checked)}
            />
            System Role
          </label>
          <button
            type="submit"
            disabled={
              createRoleMutation.isLoading ||
              deleteRoleMutation.isLoading ||
              updateRoleMutation.isLoading ||
              !can('roles', editingRole ? 'update' : 'create')
            }
          >
            {editingRole ? 'Update Role' : 'Create Role'}
          </button>
          {editingRole && (
            <button type="button" onClick={handleCancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>
      )}

      <h3>Existing Roles</h3>
      <ul>
        {roles.map((role) => (
          <li key={role.id}>
            {role.name} ({role.key}) {role.isSystem && '(System)'} {/* Use camelCase */}
            {can('roles', 'update') && <button onClick={() => handleEditClick(role)}>Edit</button>}
            {can('roles', 'delete') && (
              <button
                onClick={() => handleDeleteRole(role.id)}
                disabled={
                  createRoleMutation.isLoading ||
                  deleteRoleMutation.isLoading ||
                  updateRoleMutation.isLoading ||
                  !can('roles', 'delete')
                }
              >
                Delete
              </button>
            )}
            {can('role_permissions', 'read') && (
              <Link to={`/admin/iam/${selectedRestaurantId}/roles/${role.id}/permissions`}>
                Manage Permissions
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoleManagement;
