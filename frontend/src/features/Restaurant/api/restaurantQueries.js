import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';
import { useAuth } from '@/app/providers/contexts/AuthContext';

const fetchRestaurantById = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/restaurant/${restaurantId}`);
  return data;
};

export const useGetRestaurantById = (restaurantId, options) => {
  const { user } = useAuth(); // Add this line
  return useQuery(['restaurant', restaurantId], () => fetchRestaurantById(restaurantId), {
    ...options,
    enabled: !!restaurantId && !!user?.token && (options?.enabled ?? true),
  });
};

const fetchRestaurantsByIds = async (restaurantIds) => {
  if (!restaurantIds || restaurantIds.length === 0) {
    return [];
  }
  const { data } = await axiosInstance.get(`/restaurants`, {
    params: { ids: restaurantIds.join(',') },
  });
  return data;
};

export const useGetRestaurantsByIds = (restaurantIds, options) => {
  const { user } = useAuth(); // Add this line
  return useQuery(['restaurants', restaurantIds], () => fetchRestaurantsByIds(restaurantIds), {
    ...options,
    enabled: restaurantIds?.length > 0 && !!user?.token && (options?.enabled ?? true),
  });
};
