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
    const response = await axiosInstance.put(`/api/restaurant/${restaurantId}`, restaurantData);
    return response.data;
  } else {
    const response = await axiosInstance.post('/api/admin/restaurants', restaurantData);
    return response.data;
  }
};

export const saveRestaurantModules = async (restaurantId, enabledModules) => {
  const response = await axiosInstance.put(`/api/admin/restaurants/${restaurantId}/modules`, { enabled_modules: enabledModules });
  return response.data;
};
