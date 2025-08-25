import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/shared/lib/axiosInstance';

// Query Keys
const ADMIN_QUERY_KEYS = {
  users: 'adminUsers',
  restaurants: 'adminRestaurants',
  modules: 'adminModules',
  restaurantModules: 'adminRestaurantModules',
};

// API Functions (these are the original functions from adminService.js)
const fetchUsers = async () => {
  const response = await axiosInstance.get('/api/admin/users');
  return response.data;
};

const fetchRestaurants = async () => {
  const response = await axiosInstance.get('/api/admin/restaurants');
  return response.data;
};

const saveUser = async (userData) => {
  const { userId, ...data } = userData;
  if (userId) {
    const response = await axiosInstance.put(`/api/admin/users/${userId}`, data);
    return response.data;
  } else {
    const response = await axiosInstance.post('/api/admin/users', data);
    return response.data;
  }
};

const saveRestaurant = async (restaurantData) => {
  const { restaurantId, ...data } = restaurantData;
  if (restaurantId) {
    const response = await axiosInstance.put(`/api/admin/restaurants/${restaurantId}`, data);
    return response.data;
  } else {
    const response = await axiosInstance.post('/api/admin/restaurants', data);
    return response.data;
  }
};

const getAllModules = async () => {
  const response = await axiosInstance.get('/api/admin/modules');
  return response.data;
};

const getRestaurantModules = async (restaurantId) => {
  const response = await axiosInstance.get(`/api/admin/restaurants/${restaurantId}/modules`);
  return response.data;
};

const saveRestaurantModules = async (data) => {
  const { restaurantId, moduleIds } = data;
  const response = await axiosInstance.post(`/api/admin/restaurants/${restaurantId}/modules`, {
    moduleIds,
  });
  return response.data;
};

// React Query Hooks
export const useAdminUsers = () => {
  return useQuery(ADMIN_QUERY_KEYS.users, fetchUsers);
};

export const useAdminRestaurants = () => {
  return useQuery(ADMIN_QUERY_KEYS.restaurants, fetchRestaurants);
};

export const useSaveAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation(saveUser, {
    onSuccess: () => {
      queryClient.invalidateQueries(ADMIN_QUERY_KEYS.users);
    },
  });
};

export const useSaveAdminRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation(saveRestaurant, {
    onSuccess: () => {
      queryClient.invalidateQueries(ADMIN_QUERY_KEYS.restaurants);
    },
  });
};

export const useAllModules = () => {
  return useQuery(ADMIN_QUERY_KEYS.modules, getAllModules);
};

export const useRestaurantModules = (restaurantId) => {
  return useQuery(
    [ADMIN_QUERY_KEYS.restaurantModules, restaurantId],
    () => getRestaurantModules(restaurantId),
    {
      enabled: !!restaurantId, // Only run query if restaurantId is provided
    }
  );
};

export const useSaveRestaurantModules = () => {
  const queryClient = useQueryClient();
  return useMutation(saveRestaurantModules, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([ADMIN_QUERY_KEYS.restaurantModules, variables.restaurantId]);
    },
  });
};
