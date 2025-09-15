import { useQuery, useMutation } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

// --- IAM API Hooks ---

// Fetch permission snapshot (tree)
export const useGetPermissionTree = (restaurantId, options) => {
  const { user } = useAuth(); // Add this line
  return useQuery(
    ['permissionTree', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/iam/tree?restaurantId=${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId && !!user?.token && (options?.enabled ?? true), // Modify this line
      ...options,
    }
  );
};

// Fetch all roles for a restaurant
export const useGetRoles = (restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    ['roles', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/iam/roles?restaurantId=${restaurantId}`);
      return data;
    },
    {
      enabled: !!restaurantId && !!user?.token && (options?.enabled ?? true),
      ...options,
    }
  );
};

// Create a new role
export const useCreateRole = () => {
  return useMutation(async ({ restaurantId, key, name }) => {
    const { data } = await axiosInstance.post('/iam/roles', { restaurantId, key, name });
    return data;
  });
};

// Update a role
export const useUpdateRole = () => {
  return useMutation(async ({ roleId, restaurantId, name }) => {
    const { data } = await axiosInstance.patch(`/iam/roles/${roleId}`, { restaurantId, name });
    return data;
  });
};

// Delete a role
export const useDeleteRole = () => {
  return useMutation(async ({ roleId, restaurantId }) => {
    await axiosInstance.delete(`/iam/roles/${roleId}`, { data: { restaurantId } }); // DELETE with body
  });
};

// Set permissions for a role
export const useSetRolePermissions = () => {
  return useMutation(async ({ roleId, restaurantId, permissions }) => {
    const { data } = await axiosInstance.post(`/iam/roles/${roleId}/permissions`, {
      permissions,
    });
    return data;
  });
};

// Fetch user roles for a specific user in a restaurant
export const useGetUserRoles = (userId, restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    ['userRoles', userId, restaurantId],
    async () => {
      const { data } = await axiosInstance.get(
        `/iam/users/${userId}/roles?restaurantId=${restaurantId}`
      );
      return data;
    },
    {
      enabled: !!userId && !!restaurantId && !!user?.token && (options?.enabled ?? true),
      ...options,
    }
  );
};

// Assign a role to a user
export const useAssignUserRole = () => {
  return useMutation(async ({ userId, restaurantId, roleId }) => {
    const { data } = await axiosInstance.post(
      `/iam/users/${userId}/roles?restaurantId=${restaurantId}`,
      {
        roleId,
      }
    );
    return data;
  });
};

// Remove a role from a user
export const useRemoveUserRole = () => {
  return useMutation(async ({ userId, restaurantId, roleId }) => {
    await axiosInstance.delete(`/iam/users/${userId}/roles?restaurantId=${restaurantId}`, {
      data: { roleId },
    });
  });
};

// Fetch user permission overrides
export const useGetUserPermissionOverrides = (userId, restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    ['userPermissionOverrides', userId, restaurantId],
    async () => {
      const { data } = await axiosInstance.get(
        `/iam/users/${userId}/overrides?restaurantId=${restaurantId}`
      );
      return data;
    },
    {
      enabled: !!userId && !!restaurantId && !!user?.token && (options?.enabled ?? true),
      ...options,
    }
  );
};

// Set user permission overrides
export const useSetUserPermissionOverrides = () => {
  return useMutation(async ({ userId, restaurantId, overrides }) => {
    const { data } = await axiosInstance.post(`/iam/users/${userId}/overrides`, {
      restaurantId,
      overrides,
    });
    return data;
  });
};

// Set tenant entitlements (Superadmin only)
export const useSetEntitlements = () => {
  return useMutation(async ({ restaurantId, entitlements }) => {
    const { data } = await axiosInstance.post('/iam/entitlements/bulk', {
      restaurantId,
      entitlements,
    });
    return data;
  });
};

// Fetch entitlements for a restaurant
export const useGetRestaurantEntitlements = (restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    ['restaurantEntitlements', restaurantId],
    async () => {
      const { data } = await axiosInstance.get(`/iam/restaurants/${restaurantId}/entitlements`);
      return data;
    },
    {
      enabled: !!restaurantId && !!user?.token && (options?.enabled ?? true), // Modify this line
      ...options,
    }
  );
};

// Fetch permissions for a specific role
export const useGetRolePermissions = (roleId, restaurantId, options) => {
  const { user } = useAuth();
  return useQuery(
    ['rolePermissions', roleId, restaurantId],
    async () => {
      const { data } = await axiosInstance.get(
        `/iam/roles/${roleId}/permissions?restaurantId=${restaurantId}`
      );
      return data;
    },
    {
      enabled: !!roleId && !!restaurantId && !!user?.token && (options?.enabled ?? true),
      ...options,
    }
  );
};
