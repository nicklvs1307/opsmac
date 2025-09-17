import axiosInstance from '@/services/axiosInstance';

export const fetchCoupons = async ({ restaurantId, page, limit, search, status, rewardType, token }) => {
  const response = await axiosInstance.get(`/rewards/coupons`, {
    params: { restaurantId, page, limit, search, status, rewardType },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};