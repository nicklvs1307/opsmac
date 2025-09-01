import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

const WAITER_QUERY_KEYS = {
  tables: 'waiterTables',
};

// API Functions
const fetchWaiterTables = async (restaurantId) => {
  const response = await axiosInstance.get(`/restaurant/${restaurantId}/tables`);
  return response.data;
};

// React Query Hooks
export const useWaiterTables = (restaurantId, options) => {
  return useQuery([WAITER_QUERY_KEYS.tables, restaurantId], () => fetchWaiterTables(restaurantId), {
    enabled: !!restaurantId,
    ...options,
  });
};
