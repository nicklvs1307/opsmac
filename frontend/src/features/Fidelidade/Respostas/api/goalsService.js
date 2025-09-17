import axiosInstance from '@/services/axiosInstance';

export const fetchGoals = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/goals`, {
    params: { restaurantId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createGoal = async ({ goalData }) => {
  const response = await axiosInstance.post('/goals', goalData);

export const updateGoal = async ({ goalId, goalData, token }) => {
  const response = await axiosInstance.put(`/goals/${goalId}`, goalData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteGoal = async ({ goalId, token }) => {
  const response = await axiosInstance.delete(`/goals/${goalId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateGoalProgress = async ({ goalId }) => {
  const response = await axiosInstance.post(
    `/goals/${goalId}/update-progress`,
    {},
  );