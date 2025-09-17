import axiosInstance from '@/services/axiosInstance';

export const fetchCoupons = async ({ restaurantId, page, limit, search, status, rewardType }) => {
  const response = await axiosInstance.get(`/rewards/coupons`, {
    params: { restaurantId, page, limit, search, status, rewardType },
  });
  return response.data;
};