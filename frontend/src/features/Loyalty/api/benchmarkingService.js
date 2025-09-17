import axiosInstance from '@/services/axiosInstance';

export const fetchBenchmarkingData = async ({ restaurantId, token }) => {
  const response = await axiosInstance.get(`/dashboard/benchmarking`, {
    params: { restaurantId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
