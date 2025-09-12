import React from 'react';
import { useQueries } from 'react-query';
import Sidebar from './Sidebar';
import { menuStructure } from './menuStructure';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const checkPermission = async (featureKey, actionKey, restaurantId, token) => {
  const { data } = await axiosInstance.post(
    `/iam/check?restaurantId=${restaurantId}`,
    { featureKey, actionKey },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};

const extractPermissions = (items) => {
  let permissions = [];
  for (const item of items) {
    if (item.featureKey && item.actionKey) {
      permissions.push({ featureKey: item.featureKey, actionKey: item.actionKey });
    }
    if (item.submenu) {
      permissions = [...permissions, ...extractPermissions(item.submenu)];
    }
  }
  return permissions;
};

const MenuRenderer = ({ onMobileClose }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.permissionSnapshot?.isSuperAdmin || false;
  const restaurantId = user?.restaurants?.[0]?.id; // Get restaurantId from user

  const uniquePermissions = [...new Map(extractPermissions(menuStructure).map(item =>
    [`${item.featureKey}:${item.actionKey}`, item])).values()];

  const permissionQueries = useQueries(
    uniquePermissions.map(({ featureKey, actionKey }) => {
      return {
        queryKey: ['permission', featureKey, actionKey, restaurantId],
        queryFn: () => checkPermission(featureKey, actionKey, restaurantId, user?.token),
        enabled: !!restaurantId && !!user?.token, // Only enable query if restaurantId and token are available
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 15 * 60 * 1000, // 15 minutes
      };
    })
  );

  const isLoading = permissionQueries.some(query => query.isLoading) || !restaurantId;

  if (isLoading) {
    return <div>Carregando Menu...</div>; // Or a skeleton loader for the sidebar
  }

  const permissionsMap = new Map();
  permissionQueries.forEach((query, index) => {
    const { featureKey, actionKey } = uniquePermissions[index];
    permissionsMap.set(`${featureKey}:${actionKey}`, query.data);
  });

  return <Sidebar menuStructure={menuStructure} permissionsMap={permissionsMap} onMobileClose={onMobileClose} isSuperAdmin={isSuperAdmin} />;
};

export default MenuRenderer;
