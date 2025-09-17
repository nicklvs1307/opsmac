import axiosInstance from '@/services/axiosInstance';

export const fetchUsers = async () => {
  const response = await axiosInstance.get('/admin/users');
  return response.data;
};

export const fetchRestaurants = async (id) => {
  try {
    const url = id ? `/admin/restaurants/${id}` : '/admin/restaurants';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const saveUser = async (payload) => {
  const { userId, ...userData } = payload;
  if (userId) {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response.data;
  } else {
    const response = await axiosInstance.post('/admin/users', userData);
    return response.data;
  }
};

export const saveRestaurant = async (payload) => {
  const { restaurantId, ...restaurantData } = payload; // Destructure restaurantId from payload
  if (restaurantId) {
    const response = await axiosInstance.put(`/admin/restaurants/${restaurantId}`, restaurantData);
    return response.data;
  } else {
    const response = await axiosInstance.post('/admin/restaurants', restaurantData);
    return response.data;
  }
};

export const createRestaurantWithOwner = async (data) => {
  const response = await axiosInstance.post('/admin/restaurants/create-with-owner', data);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/admin/users/${userId}`);
  return response.data;
};

export const deleteRestaurant = async (restaurantId) => {
  const response = await axiosInstance.delete(`/admin/restaurants/${restaurantId}`);
  return response.data;
};
