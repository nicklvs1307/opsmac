import axiosInstance from '@/services/axiosInstance';

export const fetchRewards = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/rewards/restaurant/${restaurantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.rewards;
};

export const createReward = async ({ rewardData, token }) => {
  const response = await axiosInstance.post('/rewards', rewardData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateReward = async ({ rewardId, rewardData, token }) => {
  const response = await axiosInstance.put(`/rewards/${rewardId}`, rewardData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteReward = async ({ rewardId }) => {
  const response = await axiosInstance.delete(`/rewards/${rewardId}`);