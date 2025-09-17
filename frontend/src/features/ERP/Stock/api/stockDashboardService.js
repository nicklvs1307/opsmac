import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const fetchDashboardData = async (restaurantId) => {
  // This endpoint needs to be created in the backend
  const { data } = await axiosInstance.get(`/stock/dashboard?restaurant_id=${restaurantId}`);
  return data;
};

export const useStockDashboardData = (restaurantId) => {
  const { user } = useAuth();
  return useQuery(['stockDashboard', restaurantId], () => fetchDashboardData(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
  });
};
