import axiosInstance from '@/services/axiosInstance';

const getRestaurantIdFromAuth = (user) => {
  return user?.restaurantId;
};

export const spinWheelApi = async ({ rewardId, user }) => {
  const restaurantId = getRestaurantIdFromAuth();
  if (!restaurantId) throw new Error('Restaurant ID not available.');
  const response = await axiosInstance.post(`/dashboard/rewards/${rewardId}/spin-wheel`, {
    restaurantId,
  });
  return response.data;
};
