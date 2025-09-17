import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const getRestaurantIdFromAuth = () => {
  const { user } = useAuth();
  return user?.restaurantId;
};

export const spinWheelApi = async ({ rewardId }) => {
  const restaurantId = getRestaurantIdFromAuth();
  if (!restaurantId) throw new Error('Restaurant ID not available.');
  const response = await axiosInstance.post(`/dashboard/rewards/${rewardId}/spin-wheel`, {
    restaurantId,
  });
  return response.data;
};
