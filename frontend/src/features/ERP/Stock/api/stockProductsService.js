import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

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
  return useQuery(STOCK_PRODUCTS_QUERY_KEYS.allStocks, () => fetchAllStocks(restaurantId), {
    enabled: !!restaurantId,
  });
};
