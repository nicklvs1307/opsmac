import axiosInstance from './axiosInstance';

export const fetchUsers = async () => {
  const response = await axiosInstance.get('/api/admin/users');
  return response.data;
};

export const fetchRestaurants = async () => {
  const response = await axiosInstance.get('/api/admin/restaurants');
  return response.data;
};

export const saveUser = async (userData, userId = null) => {
  if (userId) {
    const response = await axiosInstance.put(`/api/admin/users/${userId}`, userData);
    return response.data;
  } else {
    const response = await axiosInstance.post('/api/admin/users', userData);
    return response.data;
  }
};

export const saveRestaurant = async (restaurantData, restaurantId = null) => {
  if (restaurantId) {
    // Note: This route might need checking, the admin route is likely /api/admin/restaurants/:id
    const response = await axiosInstance.put(`/api/admin/restaurants/${restaurantId}`, restaurantData);
    return response.data;
  } else {
    const response = await axiosInstance.post('/api/admin/restaurants', restaurantData);
    return response.data;
  }
};

// --- New Module Management API Functions ---

/**
 * Fetches all available modules from the API.
 */
export const getAllModules = async () => {
  return await axiosInstance.get('/api/admin/modules');
};

/**
 * Fetches the assigned modules for a specific restaurant.
 * @param {string} restaurantId The ID of the restaurant.
 */
export const getRestaurantModules = async (restaurantId) => {
  return await axiosInstance.get(`/api/admin/restaurants/${restaurantId}/modules`);
};

/**
 * Saves the assigned modules for a restaurant.
 * @param {string} restaurantId The ID of the restaurant.
 * @param {number[]} moduleIds An array of module IDs to be assigned.
 */
export const saveRestaurantModules = async (restaurantId, moduleIds) => {
  return await axiosInstance.post(`/api/admin/restaurants/${restaurantId}/modules`, { moduleIds });
};