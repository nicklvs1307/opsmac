import { useQuery } from 'react-query';
import axiosInstance from '@/services/axiosInstance';

const fetchRestaurantById = async (restaurantId) => {
  const { data } = await axiosInstance.get(`/restaurant/${restaurantId}`);
  return data;
};

export const useGetRestaurantById = (restaurantId, options) => {
  return useQuery(['restaurant', restaurantId], () => fetchRestaurantById(restaurantId), {
    ...options,
    enabled: !!restaurantId && (options?.enabled ?? true),
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
  return useQuery(['restaurants', restaurantIds], () => fetchRestaurantsByIds(restaurantIds), {
    ...options,
    enabled: restaurantIds?.length > 0 && (options?.enabled ?? true),
  });
};
