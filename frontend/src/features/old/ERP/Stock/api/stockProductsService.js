import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const STOCK_PRODUCTS_QUERY_KEYS = {
  allStocks: 'allStocks',
};

// API Functions
const fetchAllStocks = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/stock?restaurant_id=${restaurantId}`);
  return data;
};

// React Query Hooks
export const useAllStocks = (restaurantId) => {
  const { user } = useAuth();
  return useQuery(STOCK_PRODUCTS_QUERY_KEYS.allStocks, () => fetchAllStocks(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
  });
};
