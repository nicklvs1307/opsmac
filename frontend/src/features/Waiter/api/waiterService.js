import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

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
  const { user } = useAuth();
  return useQuery([WAITER_QUERY_KEYS.tables, restaurantId], () => fetchWaiterTables(restaurantId), {
    enabled: !!restaurantId && !!user?.token,
    ...options,
  });
};
