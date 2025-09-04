import axiosInstance from '@/services/axiosInstance';

export const fetchUsers = async () => {
  const response = await axiosInstance.get('/admin/users');
  return response.data;
};

export const fetchRestaurants = async (id) => {
  try {
    const url = id ? `/admin/restaurants/${id}` : '/admin/restaurants';
    const response = await axiosInstance.get(url);
    console.log('DEBUG: fetchRestaurants - response.data:', response.data);
    return response.data;
  } catch (error) {
    console.error('DEBUG: fetchRestaurants - error:', error);
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
    // Note: This route might need checking, the admin route is likely /admin/restaurants/:id
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
