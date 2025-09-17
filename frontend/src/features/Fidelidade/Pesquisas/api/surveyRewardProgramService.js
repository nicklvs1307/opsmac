import axiosInstance from '@/services/axiosInstance';

export const fetchRewards = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/rewards/restaurant/${restaurantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.rewards;
};

export const fetchSurveyRewardProgram = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/survey-reward-programs/${restaurantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const saveSurveyRewardProgram = async ({ programData }) => {
  const response = await axiosInstance.post('/survey-reward-programs', programData);