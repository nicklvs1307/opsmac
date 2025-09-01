import { useQuery, useMutation, useQueryClient } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

// Query Keys
const ADMIN_QUERY_KEYS = {
  users: 'adminUsers',
  restaurants: 'adminRestaurants',
  modules: 'adminModules',
  restaurantFeatures: 'adminRestaurantFeatures',
};

// API Functions (these are the original functions from adminService.js)
const fetchUsers = async () => {
  const response = await axiosInstance.get('/admin/users');
  return response.data;
};

const fetchRestaurants = async () => {
  const response = await axiosInstance.get('/admin/restaurants');
  return response.data;
};

const saveUser = async (userData) => {
  const { userId, ...data } = userData;
  if (userId) {
    const response = await axiosInstance.put(`/admin/users/${userId}`, data);
    return response.data;
  } else {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  }
};

const saveRestaurant = async (restaurantData) => {
  const { restaurantId, ...data } = restaurantData;
  if (restaurantId) {
    const response = await axiosInstance.put(`/admin/restaurants/${restaurantId}`, data);
    return response.data;
  } else {
    const response = await axiosInstance.post('/admin/restaurants', data);
    return response.data;
  }
};

const createRestaurantWithOwner = async (data) => {
  const response = await axiosInstance.post('/admin/restaurants/create-with-owner', data);
  return response.data;
};

const getAllModules = async () => {
  const response = await axiosInstance.get('/admin/modules');
  return response.data;
};

const getRestaurantFeatures = async (restaurantId) => {
  const response = await axiosInstance.get(`/admin/restaurants/${restaurantId}/features`);
  return response.data;
};

const saveRestaurantFeatures = async (data) => {
  const { restaurantId, enabledFeatureIds } = data;
  const response = await axiosInstance.put(`/admin/restaurants/${restaurantId}/features`, {
    enabledFeatureIds,
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

export const useCreateRestaurantWithOwner = () => {
  const queryClient = useQueryClient();
  return useMutation(createRestaurantWithOwner, {
    onSuccess: () => {
      queryClient.invalidateQueries(ADMIN_QUERY_KEYS.restaurants);
      queryClient.invalidateQueries(ADMIN_QUERY_KEYS.users); // Invalidate users as well
    },
  });
};

export const useAllModules = () => {
  return useQuery(ADMIN_QUERY_KEYS.modules, getAllModules);
};

export const useRestaurantFeatures = (restaurantId) => {
  return useQuery(
    [ADMIN_QUERY_KEYS.restaurantFeatures, restaurantId],
    () => getRestaurantFeatures(restaurantId),
    {
      enabled: !!restaurantId, // Only run query if restaurantId is provided
    }
  );
};

export const useSaveRestaurantFeatures = () => {
  const queryClient = useQueryClient();
  return useMutation(saveRestaurantFeatures, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([ADMIN_QUERY_KEYS.restaurantFeatures, variables.restaurantId]);
    },
  });
};
