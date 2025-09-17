import axiosInstance from '@/services/axiosInstance';

export const spinWheelApi = async ({ rewardId, restaurantId, token }) => {
  const response = await axiosInstance.post(
    `/dashboard/rewards/${rewardId}/spin-wheel`,
    { restaurantId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};